"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { SchoolEntry } from "@/lib/types";
import { schoolFormFromEntry, type SchoolFormData, SchoolFormFields } from "@/components/sections/school/school-form";

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
  const [form, setForm] = useState<SchoolFormData>(schoolFormFromEntry(entry));

  function update<K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) {
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
    <ModalOverlay label="Schooling" title="Edit school option" onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <SchoolFormFields form={form} onChange={update} />
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
