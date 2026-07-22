import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let destination = next;
      if (!destination) {
        const userId = data.user?.id;
        const { data: profile } = userId
          ? await supabase.from("profiles").select("username").eq("id", userId).maybeSingle()
          : { data: null };
        destination = (profile as any)?.username ? `/${(profile as any).username}` : "/admin";
      }
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // Return the user to an error page or home if code exchange failed
  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
}
