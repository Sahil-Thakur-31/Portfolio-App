"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useLinkedinIdentity() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const linkedinIdentity = user.identities?.find(id => id.provider === "linkedin_oidc");
        if (linkedinIdentity) {
          setUsername(linkedinIdentity.identity_data?.name || linkedinIdentity.identity_data?.email || "LinkedIn User");
        }
      }
      setLoading(false);
    });
  }, []);

  const linkLinkedin = async () => {
    setLinking(true);
    setError(null);
    const supabase = createClient();
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    });
    if (linkError) {
      setError(linkError.message);
      setLinking(false);
    }
  };

  const unlinkLinkedin = async () => {
    setLinking(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const linkedinIdentity = user.identities?.find(id => id.provider === "linkedin_oidc");
      if (linkedinIdentity) {
        const { error: unlinkError } = await supabase.auth.unlinkIdentity(linkedinIdentity);
        if (unlinkError) {
          setError(unlinkError.message);
        } else {
          setUsername(null);
        }
      }
    }
    setLinking(false);
  };

  return { username, loading, linking, error, linkLinkedin, unlinkLinkedin };
}
