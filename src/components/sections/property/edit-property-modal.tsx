"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadImage } from "@/lib/hooks/upload-image";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { HousingOption } from "@/lib/types";
import {
  propertyFormFromData,
  type PropertyFormData,
  PropertyFormFields,
} from "@/components/sections/property/property-form";

export function EditPropertyModal({
  property,
  onSuccess,
  onClose,
}: {
  property: HousingOption;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(property.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl] = useState(property.image_url);
  const [form, setForm] = useState<PropertyFormData>(propertyFormFromData(property));

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.property_title.trim() || !form.location.trim()) {
      setError("Property title and location are required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    let imageUrl = existingImageUrl;

    if (imageFile) {
      const result = await uploadImage(imageFile, "housing-images");
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }
      imageUrl = result.url;
    }

    const { error: updateError } = await supabase
      .from("moving_housing_options")
      .update({
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
        viewed: form.viewed,
        shortlisted: form.shortlisted,
      })
      .eq("id", property.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    onClose();
    onSuccess();
  }

  return (
    <ModalOverlay label="Housing" title="Edit property" onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Property photo
          </label>
          <ImageUploader
            preview={imagePreview}
            fileName={imageFile?.name}
            onFileSelect={handleImageSelect}
            placeholder="Click to change photo"
          />
        </div>

        <PropertyFormFields form={form} onChange={update} showDecisionToggles />

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
