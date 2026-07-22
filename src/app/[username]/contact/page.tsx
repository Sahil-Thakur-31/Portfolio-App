import React from "react";
import { ContactForm } from "@/components/contact-form";

export default async function ContactPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-theme-accent-teal mb-2">Contact Me</h1>
      <p className="text-theme-neutral-300 mb-8">Have an opportunity or project in mind? Shoot me a message!</p>
      <div className="rounded-xl border border-theme-neutral-900 bg-theme-neutral-900/20 p-6">
        <ContactForm username={username} />
      </div>
    </div>
  );
}
