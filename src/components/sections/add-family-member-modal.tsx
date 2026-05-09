"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { uploadImage } from "@/lib/hooks/upload-image";
import { getMoveIdForUser } from "@/lib/move-context";

const RELATIONSHIP_OPTIONS = ["Parent", "Child", "Spouse", "Sibling", "Other"];

interface FormData {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  notes: string;
}

export function AddFamilyMemberModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState<FormData>({
    full_name: "",
    relationship: "",
    date_of_birth: "",
    notes: "",
  });

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setForm({ full_name: "", relationship: "", date_of_birth: "", notes: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
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
    const moveId = await getMoveIdForUser();

    if (!moveId) {
      setError("You must be in a move to add a family member.");
      setLoading(false);
      return;
    }

    let profilePhotoUrl: string | null = null;

    if (photoFile) {
      const result = await uploadImage(photoFile, "family-photos");
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }
      profilePhotoUrl = result.url;
    }

    const { error: insertError } = await supabase.from("moving_family_members").insert({
      move_id: moveId,
      full_name: form.full_name.trim(),
      relationship: form.relationship,
      date_of_birth: form.date_of_birth || null,
      notes: form.notes,
      profile_photo_url: profilePhotoUrl,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    resetForm();
    setOpen(false);
    onSuccess();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add family member
      </Button>
      {open ? (
        <ModalOverlay label="Family members" title="Add family member" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Profile photo</label>
              <ImageUploader
                preview={photoPreview}
                fileName={photoFile?.name}
                onFileSelect={handlePhotoSelect}
                round={true}
                size={64}
              />
            </div>

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
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add member
              </Button>
            </div>
          </form>
        </ModalOverlay>
      ) : null}
    </>
  );
}
