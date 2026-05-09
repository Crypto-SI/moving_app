"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { AuthButton } from "@/components/layout/auth-button";
import { formatDateShort, getDaysRemaining } from "@/components/layout/app-shell/date-utils";

export function AppHeader({
  currentLabel,
  useMockData,
  moveDate,
  editingDates,
  editMoveDate,
  savingDate,
  saveDateError,
  onMockDataChange,
  onInvite,
  onOpenMobileNav,
  onStartEditingDate,
  onDateChange,
  onSaveDate,
  onCancelEditingDate,
}: {
  currentLabel: string;
  useMockData: boolean;
  moveDate: string;
  editingDates: boolean;
  editMoveDate: string;
  savingDate: boolean;
  saveDateError: string | null;
  onMockDataChange: (value: boolean) => void;
  onInvite: () => void;
  onOpenMobileNav: () => void;
  onStartEditingDate: () => void;
  onDateChange: (value: string) => void;
  onSaveDate: () => void;
  onCancelEditingDate: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 mb-6 space-y-3 rounded-[24px] bg-[var(--header-bg)] py-2 shadow-sm backdrop-blur-xl sm:space-y-4 sm:rounded-[30px]">
      <div className="app-card flex flex-col gap-4 rounded-[28px] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button className="shrink-0 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-[var(--foreground)] lg:hidden" onClick={onOpenMobileNav}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Current section</p>
            <h2 className="font-serif text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">{currentLabel}</h2>
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-2 md:justify-end">
          <Toggle checked={useMockData} onChange={onMockDataChange} labelOn="Demo data" labelOff="Live data" />
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onInvite}>
            Invite
          </Button>
          <AuthButton />
        </div>
      </div>

      <MoveCountdownCard
        moveDate={moveDate}
        editing={editingDates}
        value={editMoveDate}
        saving={savingDate}
        error={saveDateError}
        onStartEditing={onStartEditingDate}
        onChange={onDateChange}
        onSave={onSaveDate}
        onCancel={onCancelEditingDate}
      />
    </div>
  );
}

function MoveCountdownCard({
  moveDate,
  editing,
  value,
  saving,
  error,
  onStartEditing,
  onChange,
  onSave,
  onCancel,
}: {
  moveDate: string;
  editing: boolean;
  value: string;
  saving: boolean;
  error: string | null;
  onStartEditing: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="app-card overflow-hidden rounded-[28px] px-4 py-3 md:px-6">
      <div className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-[var(--foreground)]">Move date countdown</span>
            {moveDate ? <span className="text-sm text-[var(--muted)]">{getDaysRemaining(moveDate)} days left</span> : null}
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-[var(--muted)]">{moveDate ? formatDateShort(moveDate) : "-"}</span>
          {editing ? null : (
            <button type="button" onClick={onStartEditing} className="text-xs text-teal-600 underline decoration-teal-300 underline-offset-2 hover:text-teal-700">
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="pt-4">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-[var(--muted)]">Move date</label>
              <input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>
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
        </div>
      ) : null}
    </div>
  );
}
