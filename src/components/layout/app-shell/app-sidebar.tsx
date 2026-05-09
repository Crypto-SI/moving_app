"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import { iconMap } from "@/components/layout/app-shell/nav-icons";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar({
  pathname,
  destination,
  role,
  inviteCode,
  editingDestination,
  editDestination,
  savingDestination,
  saveDestinationError,
  onEditDestinationChange,
  onStartEditingDestination,
  onCancelEditingDestination,
  onSaveDestination,
  onOpenSettings,
}: {
  pathname: string;
  destination: string;
  role: "owner" | "collaborator" | null;
  inviteCode: string | null;
  editingDestination: boolean;
  editDestination: string;
  savingDestination: boolean;
  saveDestinationError: string | null;
  onEditDestinationChange: (value: string) => void;
  onStartEditingDestination: () => void;
  onCancelEditingDestination: () => void;
  onSaveDestination: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <aside className="fixed inset-y-4 left-4 z-40 hidden w-[288px] overflow-y-auto rounded-[32px] border border-white/60 bg-slate-950/92 p-5 text-white shadow-2xl lg:block">
      <BrandHeader logoSize={44} />
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.href];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <DestinationCard
        destination={destination}
        role={role}
        inviteCode={inviteCode}
        editing={editingDestination}
        value={editDestination}
        saving={savingDestination}
        error={saveDestinationError}
        onChange={onEditDestinationChange}
        onStartEditing={onStartEditingDestination}
        onCancel={onCancelEditingDestination}
        onSave={onSaveDestination}
      />

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export function BrandHeader({ logoSize, subtitle = "Family move command centre" }: { logoSize: number; subtitle?: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <Image src="/Relocateghlogo.png" alt="RelocateGH logo" width={logoSize} height={logoSize} className="rounded-2xl object-contain" />
      <div>
        <p className="text-lg font-semibold">RelocateGH</p>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function DestinationCard({
  destination,
  role,
  inviteCode,
  editing,
  value,
  saving,
  error,
  onChange,
  onStartEditing,
  onCancel,
  onSave,
}: {
  destination: string;
  role: "owner" | "collaborator" | null;
  inviteCode: string | null;
  editing: boolean;
  value: string;
  saving: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onStartEditing: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="app-card mt-8 rounded-[28px] p-4 text-[var(--foreground)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Current move</p>
      {editing ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="e.g. Accra, Ghana"
            className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <div className="flex gap-2">
            {error ? <p className="flex-1 text-xs text-rose-600">{error}</p> : null}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="mt-2 font-serif text-3xl">{destination || "Set destination"}</p>
          <button
            type="button"
            onClick={onStartEditing}
            className="mt-2 shrink-0 text-xs text-teal-600 underline decoration-teal-300 underline-offset-2 hover:text-teal-700"
          >
            Edit
          </button>
        </div>
      )}
      {role ? (
        <p className="mt-1 text-xs text-[var(--muted)]">
          {role === "owner" ? "Owner" : "Collaborator"}
          {inviteCode ? (
            <>
              {" "}
              &middot; Code: <span className="font-mono font-semibold">{inviteCode}</span>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
