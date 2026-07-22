"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TerminalContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle terminal via Ctrl+K or backtick key
      if ((event.ctrlKey && event.key === "k") || event.key === "`") {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <TerminalContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
}
