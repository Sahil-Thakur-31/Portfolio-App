import React from "react";
import { Navbar } from "@/components/navbar";
import { getResumeData } from "@/server/db/resume";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PortfolioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();
  let profileExists = false;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    profileExists = !!profile;
  } catch (error) {
    profileExists = false;
  }

  if (!profileExists) {
    notFound();
  }

  let userName = "";

  try {
    const resume = await getResumeData({ username });
    if (resume?.full_name) {
      userName = resume.full_name;
    }
  } catch (error) {
    // Database query failed
  }

  return (
    <>
      <Navbar username={username} userName={userName} />
      {children}
    </>
  );
}
