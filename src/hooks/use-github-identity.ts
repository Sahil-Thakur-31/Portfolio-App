"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getGithubUsername } from "@/lib/utils";

/**
 * Detects whether the current admin session has a linked GitHub identity
 * (either signed in via GitHub directly, or linked afterward from another
 * login method) and exposes a way to start that linking flow. Used to
 * replace manual "paste your GitHub link" inputs across the admin panel.
 */
export function useGithubIdentity() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsername(getGithubUsername(user));
      setLoading(false);
    });
  }, []);

  const linkGithub = async () => {
    setLinking(true);
    setError(null);
    const supabase = createClient();
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    });
    if (linkError) {
      setError(linkError.message);
      setLinking(false);
    }
    // On success the browser navigates away to GitHub, so no further state update needed.
  };
  const unlinkGithub = async () => {
    setLinking(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const githubIdentity = user.identities?.find(id => id.provider === "github");
      if (githubIdentity) {
        const { error: unlinkError } = await supabase.auth.unlinkIdentity(githubIdentity);
        if (unlinkError) {
          setError(unlinkError.message);
        } else {
          setUsername(null);
        }
      }
    }
    setLinking(false);
  };

  return { username, loading, linking, error, linkGithub, unlinkGithub };
}
