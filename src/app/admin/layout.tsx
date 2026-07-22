import React from "react";
import { AmbientBackground } from "@/components/ambient-background";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text relative overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
