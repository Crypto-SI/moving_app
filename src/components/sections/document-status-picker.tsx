"use client";

import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: DocumentStatus; label: string; dot: string }[] = [
  { value: "not started", label: "Not started", dot: "bg-slate-400" },
  { value: "in progress", label: "In progress", dot: "bg-amber-400" },
  { value: "received", label: "Received", dot: "bg-blue-400" },
  { value: "approved", label: "Ready", dot: "bg-emerald-400" },
  { value: "expired", label: "Expired", dot: "bg-rose-400" },
];

interface Props {
  value: DocumentStatus;
  onChange: (status: DocumentStatus) => void;
}

export function DocumentStatusPicker({ value, onChange }: Props) {
  const current = STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0];

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DocumentStatus)}
        className={cn(
          "appearance-none rounded-full pl-3 pr-7 py-2 sm:py-1.5 text-xs font-semibold cursor-pointer border-0 outline-none",
          "bg-white/90 text-slate-700 backdrop-blur-sm",
        )}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className={cn("pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full", current.dot)} />
    </div>
  );
}
