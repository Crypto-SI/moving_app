"use client";

import { ImagePlus, Loader2, Trash2, User, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { FamilyMember } from "@/lib/types";

interface FamilyMemberPhotoModalProps {
  member: FamilyMember;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function FamilyMemberPhotoModal({ member, onClose, onUpdated, onDeleted }: FamilyMemberPhotoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(member.profile_photo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("family-photos")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError("Failed to upload photo: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("family-photos").getPublicUrl(path);
    const newUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("moving_family_members")
      .update({ profile_photo_url: newUrl })
      .eq("id", member.id);

    if (updateError) {
      setError("Failed to update photo: " + updateError.message);
      setLoading(false);
      return;
    }

    setPhotoUrl(newUrl);
    setLoading(false);
    onUpdated();
  }

  async function handleDelete() {
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: deleteError } = await supabase
      .from("moving_family_members")
      .delete()
      .eq("id", member.id);

    if (deleteError) {
      setError("Failed to delete member: " + deleteError.message);
      setLoading(false);
      setConfirmDelete(false);
      return;
    }

    setLoading(false);
    onDeleted();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-sm p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Profile photo</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)] truncate">{member.full_name}</h3>
          </div>
          <button className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={member.full_name}
              className="h-40 w-40 rounded-full object-cover border-2 border-[var(--border)]"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
              <User className="h-20 w-20 text-slate-300" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {error ? <p className="mt-4 text-center text-sm text-rose-600">{error}</p> : null}

        {confirmDelete ? (
          <div className="mt-5 space-y-3">
            <p className="text-center text-sm text-[var(--muted)]">
              Delete <span className="font-semibold">{member.full_name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Confirm delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              {photoUrl ? "Change photo" : "Add photo"}
            </Button>
            <Button
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-700"
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete member
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </Card>
    </div>
  );
}
