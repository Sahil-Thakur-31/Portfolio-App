"use client";

import React, { startTransition, useOptimistic, useState } from "react";
import { postGuestbookMessageAction, deleteGuestbookMessageAction } from "@/server/actions/guestbook";
import type { GuestbookEntry } from "@/lib/database.types";
import { App, ConfigProvider, theme } from "antd";

function GuestbookFormInner({
  initialEntries,
  username,
  isAdmin = false,
}: {
  initialEntries: GuestbookEntry[];
  username: string;
  isAdmin?: boolean;
}) {
  const { message: antdMessage } = App.useApp();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [optimisticEntries, setOptimisticEntries] = useOptimistic(
    initialEntries,
    (state, action: { type: "ADD"; payload: GuestbookEntry } | { type: "DELETE"; payload: string }) => {
      if (action.type === "ADD") return [action.payload, ...state];
      if (action.type === "DELETE") return state.filter(e => e.id !== action.payload);
      return state;
    }
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticEntries({ type: "DELETE", payload: id });
      try {
        await deleteGuestbookMessageAction(id, username);
      } catch (err: any) {
        antdMessage.error(err.message || "Failed to delete message.");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const tempName = name.trim();
    const tempMessage = message.trim();
    
    // Clear fields
    setName("");
    setMessage("");

    const newOptimisticEntry: GuestbookEntry = {
      id: Math.random().toString(),
      owner_id: "",
      user_id: null,
      user_name: tempName,
      user_avatar: null,
      message: tempMessage,
      created_at: new Date().toISOString(),
    };

    startTransition(async () => {
      setOptimisticEntries({ type: "ADD", payload: newOptimisticEntry });
      try {
        await postGuestbookMessageAction(username, tempName, tempMessage);
      } catch (err: any) {
        antdMessage.error(err.message || "Failed to post message.");
      }
    });
  };

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start select-none">
      
      {/* Left Column: Input Console Form */}
      <div className="md:col-span-4 md:sticky md:top-24">
        <form onSubmit={handleSubmit} className="relative rounded-2xl bg-theme-bg/90 border border-theme-border p-6 flex flex-col gap-4 shadow-xl">
          <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-accent-teal/40" />
          <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-theme-accent-purple/40" />

          <div className="flex justify-between items-center border-b border-theme-border pb-3">
            <span className="text-[9px] font-mono uppercase tracking-widest text-theme-accent-teal font-bold">LOG_ENTRY // INITIATE</span>
            <span className="w-2 h-2 rounded-full bg-theme-success animate-pulse" />
          </div>

          <div>
            <label htmlFor="visitor_name" className="block text-[8px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">VISITOR_IDENTIFIER</label>
            <input
              id="visitor_name"
              type="text"
              placeholder="e.g. Anonymous Node"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/80 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
            />
          </div>

          <div>
            <label htmlFor="visitor_message" className="block text-[8px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">TRANSMISSION_BODY</label>
            <textarea
              id="visitor_message"
              placeholder="Leave your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={500}
              className="w-full min-h-[100px] rounded-xl border border-theme-border bg-theme-input-bg/80 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] focus:outline-none transition-all duration-300 font-mono resize-none"
            />
          </div>

          <button
            type="submit"
            className="self-end inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            [ RECORD_MESSAGE ]
          </button>
        </form>
      </div>

      {/* Right Column: Message Log Feed (Grid of 3) */}
      <div className="md:col-span-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        {optimisticEntries.length === 0 ? (
          <div className="relative rounded-2xl border bg-theme-bg/30 border-theme-border p-8 text-center text-xs font-mono text-theme-neutral-300">
            [NO_TRANSMISSIONS_RECORDED]
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {optimisticEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div 
                  key={entry.id} 
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className={`relative rounded-2xl border bg-theme-bg/60 border-theme-border p-4 flex flex-col justify-between group transition-all duration-300 cursor-pointer select-none ${
                    isExpanded 
                      ? "h-auto border-theme-accent-teal/40 shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.08)] bg-theme-card-bg" 
                      : "h-36 hover:border-theme-border/20 hover:bg-theme-neutral-900/40"
                  }`}
                >
                  <span className="absolute top-2 left-2 w-1 h-1 border-t border-l border-theme-border/20" />
                  
                  <div>
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-theme-border pb-2 mb-2">
                      <span className="font-bold text-theme-neutral-200 text-xs font-mono truncate max-w-[90%]">
                        {entry.user_name}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDelete(entry.id, e)}
                          className="text-[10px] text-red-500 hover:text-red-400 font-mono font-bold uppercase tracking-widest transition-colors z-10 shrink-0"
                          title="Delete entry"
                        >
                          [X]
                        </button>
                      )}
                    </div>

                    {/* Message content */}
                    <p className={`text-theme-neutral-300 text-xs leading-relaxed font-sans pl-0.5 ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}>
                      {entry.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-theme-border/30">
                    <span className="text-[8px] font-mono text-theme-neutral-300 shrink-0">
                      {new Date(entry.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {!isExpanded && entry.message.length > 70 && (
                        <div className="text-[8px] font-mono text-theme-neutral-300 uppercase tracking-wider group-hover:text-theme-accent-teal/75 transition-colors">
                          expand //
                        </div>
                      )}
                      {isExpanded && (
                        <div className="text-[8px] font-mono text-theme-accent-purple uppercase tracking-wider">
                          collapse //
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function GuestbookForm(props: { initialEntries: GuestbookEntry[]; username: string; isAdmin?: boolean }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "var(--theme-accent-teal)",
          colorBgContainer: "var(--theme-input-bg)",
          colorBorder: "var(--theme-border)",
          borderRadius: 12,
          colorText: "var(--theme-text)",
          fontFamily: "monospace",
        },
      }}
    >
      <App>
        <GuestbookFormInner {...props} />
      </App>
    </ConfigProvider>
  );
}
