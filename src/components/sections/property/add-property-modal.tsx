"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadImage } from "@/lib/hooks/upload-image";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMoveIdForUser } from "@/lib/move-context";
import {
  EMPTY_PROPERTY_FORM,
  type PropertyFormData,
  PropertyFormFields,
} from "@/components/sections/property/property-form";

export function AddPropertyModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<PropertyFormData>(EMPTY_PROPERTY_FORM);

  function update<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setForm(EMPTY_PROPERTY_FORM);
    setImageFile(null);
    setImagePreview(null);
  }

  function handleClose() {
    resetForm();
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.property_title.trim() || !form.location.trim()) {
      setError("Property title and location are required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const moveId = await getMoveIdForUser();

    if (!moveId) {
      setError("You must be in a move to add a property.");
      setLoading(false);
      return;
    }

    let imageUrl = "";

    if (imageFile) {
      const result = await uploadImage(imageFile, "housing-images");
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }
      imageUrl = result.url;
    }

    const { error: insertError } = await supabase.from("moving_housing_options").insert({
      move_id: moveId,
      property_title: form.property_title.trim(),
      location: form.location.trim(),
      advert_link: form.advert_link.trim(),
      number_of_rooms: form.number_of_rooms,
      has_boys_quarters: form.has_boys_quarters,
      rent: form.rent,
      currency: form.currency,
      landlord_or_agent_name: form.landlord_or_agent_name.trim(),
      contact_details: form.contact_details.trim(),
      notes: form.notes.trim(),
      image_url: imageUrl,
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
        Add property
      </Button>
      {open ? (
        <ModalOverlay label="Housing" title="Add property" onClose={handleClose}>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Property photo
              </label>
              <ImageUploader
                preview={imagePreview}
                fileName={imageFile?.name}
                onFileSelect={handleImageSelect}
                placeholder="Click to upload a photo"
              />
            </div>

            <PropertyFormFields form={form} onChange={update} />

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add property
              </Button>
            </div>
          </form>
        </ModalOverlay>
      ) : null}
    </>
  );
}
