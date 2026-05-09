"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

export function DeleteButton({
  tableName,
  itemId,
  label,
  onSuccess,
}: {
  tableName: string;
  itemId: string;
  label?: string;
  onSuccess: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.from(tableName).delete().eq("id", itemId);
    setLoading(false);
    setConfirming(false);
    onSuccess();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Delete{label ? ` ${label}` : ""}?</span>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
        >
          No
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-full bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 transition cursor-pointer"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition cursor-pointer"
      title={`Delete${label ? ` ${label}` : ""}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
