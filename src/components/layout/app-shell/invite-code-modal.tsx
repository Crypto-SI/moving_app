"use client";

import { Share2, X } from "lucide-react";
import { useState } from "react";

export function InviteCodeModal({
  onClose,
  inviteCode,
}: {
  onClose: () => void;
  inviteCode: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `Join my RelocateGH move! Invite code: ${inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "RelocateGH", text });
      } catch {}
      return;
    }
    await handleCopy();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] bg-[var(--surface)] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Invite</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Share invite code</h3>
          </div>
          <button className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Share this code with family members so they can join your move.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 px-4 py-3 dark:border-teal-600 dark:bg-teal-900/20">
          <span className="font-mono text-2xl font-bold tracking-[0.3em] text-teal-700 dark:text-teal-300">{inviteCode}</span>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:hover:bg-slate-500"
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
