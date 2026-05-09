"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PlaceholderModal({
  title,
  description,
  actionLabel = "Add new",
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {actionLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-lg p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Prototype action</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{title}</h3>
              </div>
              <button className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{description}</p>
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-white/5 p-4 text-sm text-[var(--muted)]">
              Form state is intentionally non-persistent in this version. The component boundary is ready to swap to Supabase-powered create flows later.
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
