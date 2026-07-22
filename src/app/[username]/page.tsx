import { getResumeData } from "@/server/db/resume";
import { getFeaturedProjects, getProjects } from "@/server/db/projects";
import { HomeClient } from "@/components/home-client";
import type { Project } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let resumeData = null;
  let featuredProjects: Project[] = [];
  let totalProjectCount = 0;

  // These three queries are independent — run them in parallel instead of one
  // after another so the page isn't waiting on the sum of all three round-trips.
  const [resumeResult, featuredResult, projectsResult] = await Promise.allSettled([
    getResumeData({ username }),
    getFeaturedProjects({ username }),
    getProjects({ username }),
  ]);

  // PGRST116 = "no rows found" — expected when the username doesn't resolve to
  // any data (the layout's own check already handles showing the not-found
  // page for that case), so only log genuinely unexpected failures here.
  const logIfUnexpected = (error: any) => {
    if (error?.code !== "PGRST116") {
      console.error("Failed to load initial data:", error?.message || error?.details || error?.hint || JSON.stringify(error));
    }
  };

  if (resumeResult.status === "fulfilled") {
    resumeData = resumeResult.value;
  } else {
    logIfUnexpected(resumeResult.reason);
  }

  if (featuredResult.status === "fulfilled") {
    featuredProjects = featuredResult.value;
  } else {
    logIfUnexpected(featuredResult.reason);
  }

  if (projectsResult.status === "fulfilled") {
    totalProjectCount = projectsResult.value.length;
  } else {
    logIfUnexpected(projectsResult.reason);
  }

  return (
    <HomeClient
      username={username}
      resumeDataJson={resumeData ? JSON.stringify(resumeData) : null}
      featuredProjects={featuredProjects}
      totalProjectCount={totalProjectCount}
    />
  );
}
