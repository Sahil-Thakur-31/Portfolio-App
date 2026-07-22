"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfigProvider, theme, App } from "antd";
import { syncGithubProjectsAction } from "@/server/actions/projects";
import { useGithubIdentity } from "@/hooks/use-github-identity";

function GithubSyncButtonInner() {
  const { username, loading, linking, error: linkError, linkGithub } = useGithubIdentity();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { message: antdMessage } = App.useApp();

  const handleClick = async () => {
    if (!username) {
      linkGithub();
      return;
    }
    setIsSyncing(true);
    try {
      const summary = await syncGithubProjectsAction(username);
      antdMessage.success(
        `[SYNC_COMPLETE] ${summary.created} new project${summary.created === 1 ? "" : "s"} imported as drafts` +
        (summary.updated > 0 ? ` · ${summary.updated} existing project${summary.updated === 1 ? "" : "s"} refreshed` : "") +
        ` · ${summary.total} repos scanned`
      );
      router.refresh();
    } catch (err: any) {
      antdMessage.error(`[SYNC_FAILED] ${err.message || "Sync failed"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    if (linkError) antdMessage.error(`[LINK_FAILED] ${linkError}`);
  }, [linkError, antdMessage]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || isSyncing || linking}
      title={username ? `Sync repos for ${username}` : "Link your GitHub account"}
      className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-purple to-theme-accent-pink px-5 text-xs font-mono font-bold uppercase tracking-widest text-theme-bg hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {username
        ? (isSyncing ? "SYNCING..." : "SYNC_FROM_GITHUB")
        : (linking ? "REDIRECTING..." : "LINK_GITHUB_ACCOUNT")}
    </button>
  );
}

export function GithubSyncForm() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgElevated: "var(--theme-popover-bg)",
          colorText: "var(--theme-text)",
          colorSuccess: "var(--theme-success)",
          colorError: "var(--theme-error)",
          fontFamily: "monospace",
          borderRadius: 12,
        },
      }}
    >
      <App>
        <GithubSyncButtonInner />
      </App>
    </ConfigProvider>
  );
}
