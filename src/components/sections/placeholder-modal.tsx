"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";

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
        <ModalOverlay label="Prototype action" title={title} onClose={() => setOpen(false)}>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{description}</p>
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-white/5 p-4 text-sm text-[var(--muted)]">
            Form state is intentionally non-persistent in this version. The component boundary is ready to swap to Supabase-powered create flows later.
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </ModalOverlay>
      ) : null}
    </>
  );
}
