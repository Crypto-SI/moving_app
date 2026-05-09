"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMoveIdForUser } from "@/lib/move-context";
import { useFamilyMembers } from "@/lib/data-hooks";
import type { SchoolEntry } from "@/lib/types";

const APPLICATION_STATUSES = [
  "not started",
  "researching",
  "documents requested",
  "interview scheduled",
  "applied",
  "offered",
  "accepted",
  "declined",
  "waitlisted",
];

interface FormData {
  family_member_id: string;
  school_name: string;
  address: string;
  contact_name: string;
  contact_details: string;
  fee_per_year: number;
  application_status: string;
  year_group: string;
  distance_from_home: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  family_member_id: "",
  school_name: "",
  address: "",
  contact_name: "",
  contact_details: "",
  fee_per_year: 0,
  application_status: "not started",
  year_group: "",
  distance_from_home: "",
  notes: "",
};

export function AddSchoolModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const { data: familyMembers } = useFamilyMembers();

  const children = familyMembers.filter(
    (m) => m.relationship.toLowerCase() === "child",
  );

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function handleClose() {
    resetForm();
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.school_name.trim()) {
      setError("School name is required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const moveId = await getMoveIdForUser();

    if (!moveId) {
      setError("You must be in a move to add a school option.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("moving_school_entries")
      .insert({
        move_id: moveId,
        family_member_id: form.family_member_id || null,
        school_name: form.school_name.trim(),
        address: form.address.trim(),
        contact_name: form.contact_name.trim(),
        contact_details: form.contact_details.trim(),
        fee_per_year: form.fee_per_year,
        application_status: form.application_status,
        year_group: form.year_group.trim(),
        distance_from_home: form.distance_from_home.trim(),
        notes: form.notes.trim(),
      });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    handleClose();
    onSuccess();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add school option
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4"
          onClick={handleClose}
        >
          <Card
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Schooling
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  Add school option
                </h3>
              </div>
              <button
                className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Child
                </label>
                <select
                  value={form.family_member_id}
                  onChange={(e) => update("family_member_id", e.target.value)}
                  className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                >
                  <option value="">Select a child</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  School name *
                </label>
                <Input
                  value={form.school_name}
                  onChange={(e) => update("school_name", e.target.value)}
                  placeholder="e.g. Lincoln Community School"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Address
                </label>
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="e.g. 126 Jungle Rd, East Legon, Accra"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Contact name
                  </label>
                  <Input
                    value={form.contact_name}
                    onChange={(e) => update("contact_name", e.target.value)}
                    placeholder="e.g. Admissions Office"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Contact details
                  </label>
                  <Input
                    value={form.contact_details}
                    onChange={(e) => update("contact_details", e.target.value)}
                    placeholder="email or phone"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Fee per year
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.fee_per_year || ""}
                    onChange={(e) =>
                      update("fee_per_year", Math.max(0, Number(e.target.value)))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Application status
                  </label>
                  <select
                    value={form.application_status}
                    onChange={(e) => update("application_status", e.target.value)}
                    className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Year group
                  </label>
                  <Input
                    value={form.year_group}
                    onChange={(e) => update("year_group", e.target.value)}
                    placeholder="e.g. Year 8"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Distance from home
                  </label>
                  <Input
                    value={form.distance_from_home}
                    onChange={(e) => update("distance_from_home", e.target.value)}
                    placeholder="e.g. 14 mins"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                  placeholder="Optional notes about this school"
                />
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" type="button" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add school
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function formFromEntry(entry: SchoolEntry): FormData {
  return {
    family_member_id: entry.family_member_id,
    school_name: entry.school_name,
    address: entry.address,
    contact_name: entry.contact_name,
    contact_details: entry.contact_details,
    fee_per_year: entry.fee_per_year,
    application_status: entry.application_status,
    year_group: entry.year_group,
    distance_from_home: entry.distance_from_home,
    notes: entry.notes,
  };
}

export function EditSchoolModal({
  entry,
  onSuccess,
  onClose,
}: {
  entry: SchoolEntry;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(formFromEntry(entry));
  const { data: familyMembers } = useFamilyMembers();

  const children = familyMembers.filter(
    (m) => m.relationship.toLowerCase() === "child",
  );

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.school_name.trim()) {
      setError("School name is required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const { error: updateError } = await supabase
      .from("moving_school_entries")
      .update({
        family_member_id: form.family_member_id || null,
        school_name: form.school_name.trim(),
        address: form.address.trim(),
        contact_name: form.contact_name.trim(),
        contact_details: form.contact_details.trim(),
        fee_per_year: form.fee_per_year,
        application_status: form.application_status,
        year_group: form.year_group.trim(),
        distance_from_home: form.distance_from_home.trim(),
        notes: form.notes.trim(),
      })
      .eq("id", entry.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    onClose();
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Schooling
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              Edit school option
            </h3>
          </div>
          <button
            className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Child
            </label>
            <select
              value={form.family_member_id}
              onChange={(e) => update("family_member_id", e.target.value)}
              className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              School name *
            </label>
            <Input
              value={form.school_name}
              onChange={(e) => update("school_name", e.target.value)}
              placeholder="e.g. Lincoln Community School"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Address
            </label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="e.g. 126 Jungle Rd, East Legon, Accra"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Contact name
              </label>
              <Input
                value={form.contact_name}
                onChange={(e) => update("contact_name", e.target.value)}
                placeholder="e.g. Admissions Office"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Contact details
              </label>
              <Input
                value={form.contact_details}
                onChange={(e) => update("contact_details", e.target.value)}
                placeholder="email or phone"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Fee per year
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.fee_per_year || ""}
                onChange={(e) =>
                  update("fee_per_year", Math.max(0, Number(e.target.value)))
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Application status
              </label>
              <select
                value={form.application_status}
                onChange={(e) => update("application_status", e.target.value)}
                className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Year group
              </label>
              <Input
                value={form.year_group}
                onChange={(e) => update("year_group", e.target.value)}
                placeholder="e.g. Year 8"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Distance from home
              </label>
              <Input
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
                placeholder="e.g. 14 mins"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
              placeholder="Optional notes about this school"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
