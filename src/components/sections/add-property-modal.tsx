"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMoveIdForUser } from "@/lib/move-context";
import type { HousingOption } from "@/lib/types";

const CURRENCIES = ["GBP", "USD", "EUR", "GHS"];

interface FormData {
  property_title: string;
  location: string;
  advert_link: string;
  number_of_rooms: number;
  has_boys_quarters: boolean;
  rent: number;
  currency: string;
  landlord_or_agent_name: string;
  contact_details: string;
  notes: string;
  viewed: boolean;
  shortlisted: boolean;
}

const EMPTY_FORM: FormData = {
  property_title: "",
  location: "",
  advert_link: "",
  number_of_rooms: 1,
  has_boys_quarters: false,
  rent: 0,
  currency: "USD",
  landlord_or_agent_name: "",
  contact_details: "",
  notes: "",
  viewed: false,
  shortlisted: false,
};

function formFromProperty(p: HousingOption): FormData {
  return {
    property_title: p.property_title,
    location: p.location,
    advert_link: p.advert_link,
    number_of_rooms: p.number_of_rooms,
    has_boys_quarters: p.has_boys_quarters,
    rent: p.rent,
    currency: p.currency,
    landlord_or_agent_name: p.landlord_or_agent_name,
    contact_details: p.contact_details,
    notes: p.notes,
    viewed: p.viewed,
    shortlisted: p.shortlisted,
  };
}

export function AddPropertyModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
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
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in.");
        setLoading(false);
        return;
      }
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("housing-images")
        .upload(path, imageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("Failed to upload image: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("housing-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
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
                  Housing
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Add property</h3>
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
                  Property photo
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-white/5 text-slate-400 transition hover:border-teal-400 hover:text-teal-500"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-6 w-6" />
                    )}
                  </button>
                  <span className="text-sm text-[var(--muted)]">
                    {imageFile ? imageFile.name : "Click to upload a photo"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Property title *
                </label>
                <Input
                  value={form.property_title}
                  onChange={(e) => update("property_title", e.target.value)}
                  placeholder="e.g. Palm Court Townhouse"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Location *
                </label>
                <Input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. East Legon, Accra"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Advert link
                </label>
                <Input
                  type="url"
                  value={form.advert_link}
                  onChange={(e) => update("advert_link", e.target.value)}
                  placeholder="https://example.com/property"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Number of rooms *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={form.number_of_rooms}
                    onChange={(e) =>
                      update("number_of_rooms", Math.max(1, Number(e.target.value)))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Boys quarters
                  </label>
                  <div className="mt-2">
                    <Toggle
                      checked={form.has_boys_quarters}
                      onChange={(checked) => update("has_boys_quarters", checked)}
                      labelOn="Yes"
                      labelOff="No"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Rent</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.rent || ""}
                    onChange={(e) => update("rent", Math.max(0, Number(e.target.value)))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white/70 dark:bg-white/5 p-4 space-y-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">Agent details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                      Agent / landlord name
                    </label>
                    <Input
                      value={form.landlord_or_agent_name}
                      onChange={(e) => update("landlord_or_agent_name", e.target.value)}
                      placeholder="e.g. Ava Realty Ghana"
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                  placeholder="Optional notes about this property"
                />
              </div>

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
          </Card>
        </div>
      ) : null}
    </>
  );
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>(formFromProperty(property));

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
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
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in.");
        setLoading(false);
        return;
      }
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("housing-images")
        .upload(path, imageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("Failed to upload image: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("housing-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
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
              Housing
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Edit property</h3>
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
              Property photo
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-white/5 text-slate-400 transition hover:border-teal-400 hover:text-teal-500"
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
              </button>
              <span className="text-sm text-[var(--muted)]">
                {imageFile ? imageFile.name : "Click to change photo"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Property title *
            </label>
            <Input
              value={form.property_title}
              onChange={(e) => update("property_title", e.target.value)}
              placeholder="e.g. Palm Court Townhouse"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Location *</label>
            <Input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. East Legon, Accra"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Advert link</label>
            <Input
              type="url"
              value={form.advert_link}
              onChange={(e) => update("advert_link", e.target.value)}
              placeholder="https://example.com/property"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Number of rooms *
              </label>
              <Input
                type="number"
                min={1}
                value={form.number_of_rooms}
                onChange={(e) =>
                  update("number_of_rooms", Math.max(1, Number(e.target.value)))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Boys quarters
              </label>
              <div className="mt-2">
                <Toggle
                  checked={form.has_boys_quarters}
                  onChange={(checked) => update("has_boys_quarters", checked)}
                  labelOn="Yes"
                  labelOff="No"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Rent</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.rent || ""}
                onChange={(e) => update("rent", Math.max(0, Number(e.target.value)))}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/70 dark:bg-white/5 p-4 space-y-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Agent details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Agent / landlord name
                </label>
                <Input
                  value={form.landlord_or_agent_name}
                  onChange={(e) => update("landlord_or_agent_name", e.target.value)}
                  placeholder="e.g. Ava Realty Ghana"
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Viewed</label>
              <div className="mt-2">
                <Toggle
                  checked={form.viewed}
                  onChange={(checked) => update("viewed", checked)}
                  labelOn="Yes"
                  labelOff="No"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Shortlisted</label>
              <div className="mt-2">
                <Toggle
                  checked={form.shortlisted}
                  onChange={(checked) => update("shortlisted", checked)}
                  labelOn="Yes"
                  labelOff="No"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
              placeholder="Optional notes about this property"
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

