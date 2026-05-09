"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { FamilyMember } from "@/lib/types";

const RELATIONSHIP_OPTIONS = ["Parent", "Child", "Spouse", "Sibling", "Other"];

interface FormData {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  notes: string;
}

export function EditFamilyMemberModal({
  member,
  onSuccess,
  onClose,
}: {
  member: FamilyMember;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    full_name: member.full_name,
    relationship: member.relationship,
    date_of_birth: member.date_of_birth ?? "",
    notes: member.notes ?? "",
  });

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.full_name.trim() || !form.relationship) {
      setError("Full name and relationship are required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const { error: updateError } = await supabase
      .from("moving_family_members")
      .update({
        full_name: form.full_name.trim(),
        relationship: form.relationship,
        date_of_birth: form.date_of_birth || null,
        notes: form.notes,
      })
      .eq("id", member.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    onClose();
    onSuccess();
  }

  return (
    <ModalOverlay label="Family members" title="Edit family member" onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Full name</label>
          <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. Ama Mensah" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Relationship</label>
          <select
            value={form.relationship}
            onChange={(e) => update("relationship", e.target.value)}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
          >
            <option value="">Select relationship</option>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Date of birth</label>
          <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
            placeholder="Optional notes about this family member"
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
    </ModalOverlay>
  );
}
