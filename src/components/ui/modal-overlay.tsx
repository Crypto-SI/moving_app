"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ModalOverlayProps {
  label: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}

export function ModalOverlay({ label, title, onClose, children, wide, className }: ModalOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4"
      onClick={onClose}
    >
      <Card
        className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8 ${className ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{title}</h3>
          </div>
          <button
            className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
