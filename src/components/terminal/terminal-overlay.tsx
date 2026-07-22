"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTerminal } from "./terminal-provider";
import { useRouter } from "next/navigation";

export function TerminalOverlay() {
  const { isOpen, setIsOpen } = useTerminal();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([
    "Portfolio CLI [Version 1.0.0]",
    "Type 'help' to see list of available commands.",
    "",
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newOutput = [...output, `> ${cmd}`];

    if (trimmed === "") {
      setOutput(newOutput);
      return;
    }

    switch (trimmed) {
      case "help":
        newOutput.push(
          "Available Commands:",
          "  about       Display professional introduction summary",
          "  projects    Navigate to Projects showcase list page",
          "  contact     Display email & phone contact information",
          "  whatsapp    Show how to start a WhatsApp chat",
          "  clear       Clear terminal buffer screen history",
          "  exit        Close the terminal overlay window"
        );
        break;
      case "about":
        newOutput.push(
          "Junior Software Engineer specializing in full-stack web applications with Next.js, React, Node.js & Supabase."
        );
        break;
      case "projects":
        newOutput.push("Navigating to Projects...");
        router.push("/#projects");
        setIsOpen(false);
        break;
      case "contact":
        newOutput.push(
          "See the Contact section of this page for up-to-date email, phone, and WhatsApp details."
        );
        break;
      case "whatsapp":
        newOutput.push("Use the WhatsApp Chat button in the Contact section to start a chat.");
        break;
      case "clear":
        setOutput([]);
        setInput("");
        return;
      case "exit":
        setIsOpen(false);
        setInput("");
        return;
      default:
        newOutput.push(`Command not found: '${trimmed}'. Type 'help' for instructions.`);
    }

    setOutput([...newOutput, ""]);
    setHistory([...history, cmd]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 font-mono text-emerald-400">
      <div 
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
        className="w-full h-full max-w-4xl bg-black border border-emerald-500/30 rounded-lg p-6 overflow-y-auto flex flex-col justify-between"
      >
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {output.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-emerald-950 pt-4">
          <span className="text-emerald-500 font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCommand(input);
              }
            }}
            className="flex-1 bg-transparent outline-none border-none text-emerald-400"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
