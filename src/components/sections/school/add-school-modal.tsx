"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMoveIdForUser } from "@/lib/move-context";
import { EMPTY_SCHOOL_FORM, type SchoolFormData, SchoolFormFields } from "@/components/sections/school/school-form";

export function AddSchoolModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SchoolFormData>(EMPTY_SCHOOL_FORM);

  function update<K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setForm(EMPTY_SCHOOL_FORM);
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

    const { error: insertError } = await supabase.from("moving_school_entries").insert({
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
        <ModalOverlay label="Schooling" title="Add school option" onClose={handleClose}>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <SchoolFormFields form={form} onChange={update} />
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
        </ModalOverlay>
      ) : null}
    </>
  );
}
