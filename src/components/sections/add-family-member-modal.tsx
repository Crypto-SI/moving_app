"use client";

import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to add a family member.");
      setLoading(false);
      return;
    }

    let profilePhotoUrl: string | null = null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("family-photos")
        .upload(path, photoFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("Failed to upload photo: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("family-photos").getPublicUrl(path);
      profilePhotoUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("moving_family_members").insert({
      user_id: user.id,
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-lg p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Family members</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Add family member</h3>
              </div>
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Profile photo</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-teal-400 hover:text-teal-500"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <ImagePlus className="h-6 w-6" />
                    )}
                  </button>
                  <span className="text-sm text-slate-500">
                    {photoFile ? photoFile.name : "Click to upload a photo"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. Ama Mensah" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Relationship</label>
                <select
                  value={form.relationship}
                  onChange={(e) => update("relationship", e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:bg-white"
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Date of birth</label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
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
          </Card>
        </div>
      ) : null}
    </>
  );
}
