const ACRONYMS = new Set(["ai", "crm", "api", "ui", "ux", "sdk", "cli", "ml", "cv", "iot", "sql", "css", "html", "aws", "gcp"]);

function prettifyTitle(repoName: string) {
  return repoName
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function slugify(repoName: string) {
  return repoName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  fork: boolean;
  private: boolean;
  archived: boolean;
  stargazers_count: number;
  updated_at: string;
}

export interface NormalizedGithubProject {
  title: string;
  slug: string;
  description: string | null;
  tags: string[];
  github_url: string;
  live_url: string | null;
  updated_at: string;
}

// Repos list endpoint only reports the single dominant language. The
// per-repo languages endpoint returns every language actually used, e.g.
// { JavaScript: 41000, HTML: 38000, CSS: 20000 } — used as a richer tag
// fallback when a repo has no topics set.
async function fetchRepoLanguages(username: string, repoName: string, headers: Record<string, string>): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/languages`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return [];
  const data: Record<string, number> = await res.json();
  return Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);
}

// Used as the project description — falls back to the repo's one-line
// GitHub description if it has no README.
async function fetchReadme(username: string, repoName: string, headers: Record<string, string>): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/readme`,
    { headers: { ...headers, Accept: "application/vnd.github.raw" }, cache: "no-store" }
  );
  if (!res.ok) return null;
  const text = await res.text();
  return text.trim() || null;
}

export async function fetchGithubRepos(username: string): Promise<NormalizedGithubProject[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-github-sync",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repos: GithubRepo[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      { headers, cache: "no-store" }
    );

    if (!res.ok) {
      if (res.status === 404) throw new Error(`GitHub user "${username}" not found`);
      if (res.status === 403) throw new Error("GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN.");
      throw new Error(`GitHub API request failed (${res.status})`);
    }

    const batch: GithubRepo[] = await res.json();
    repos.push(...batch);

    if (batch.length < 100) break;
    page += 1;
  }

  const owned = repos.filter((repo) => !repo.fork && !repo.private);

  return Promise.all(
    owned.map(async (repo) => {
      let tagsPromise: Promise<string[]> = Promise.resolve(repo.topics?.length > 0 ? repo.topics : []);
      if (repo.topics?.length === 0 || !repo.topics) {
        tagsPromise = fetchRepoLanguages(username, repo.name, headers).then(
          (languages) => (languages.length > 0 ? languages : repo.language ? [repo.language] : [])
        );
      }

      const [tags, readme] = await Promise.all([
        tagsPromise,
        fetchReadme(username, repo.name, headers),
      ]);

      return {
        title: prettifyTitle(repo.name),
        slug: slugify(repo.name),
        description: readme || repo.description,
        tags,
        github_url: repo.html_url,
        live_url: repo.homepage || null,
        updated_at: repo.updated_at,
      };
    })
  );
}
