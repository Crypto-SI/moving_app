"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMoveIdForUser } from "@/lib/move-context";
import {
  type ContainerForm,
  makeDefaultContainer,
  ContainerFormSection,
} from "@/components/sections/shipping/container-form-section";

const CURRENCIES = ["GBP", "USD", "EUR", "GHS"];

interface QuoteForm {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  currency: string;
  collection_date: string;
  estimated_delivery_date: string;
  shipment_type: string;
  insurance_included: boolean;
  notes: string;
  containers: ContainerForm[];
}

export function AddShippingQuoteModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<QuoteForm>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    currency: "GBP",
    collection_date: "",
    estimated_delivery_date: "",
    shipment_type: "",
    insurance_included: false,
    notes: "",
    containers: [makeDefaultContainer(0)],
  });

  function updateForm<K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateContainer(index: number, updates: Partial<ContainerForm>) {
    setForm((prev) => ({
      ...prev,
      containers: prev.containers.map((c, i) => (i === index ? { ...c, ...updates } : c)),
    }));
  }

  function removeContainer(index: number) {
    setForm((prev) => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index),
    }));
  }

  function addContainer() {
    setForm((prev) => ({
      ...prev,
      containers: [...prev.containers, makeDefaultContainer(prev.containers.length)],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.company_name.trim()) {
      setError("Company name is required.");
      return;
    }

    if (form.containers.length === 0) {
      setError("At least one container is required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const moveId = await getMoveIdForUser();
    if (!moveId) {
      setError("You must be in a move to add a quote.");
      setLoading(false);
      return;
    }

    const { data: quoteData, error: quoteError } = await supabase
      .from("moving_shipping_quotes")
      .insert({
        move_id: moveId,
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        currency: form.currency,
        collection_date: form.collection_date || null,
        estimated_delivery_date: form.estimated_delivery_date || null,
        shipment_type: form.shipment_type.trim(),
        insurance_included: form.insurance_included,
        notes: form.notes.trim(),
      })
      .select("id")
      .single();

    if (quoteError || !quoteData) {
      setError(quoteError?.message || "Failed to create quote.");
      setLoading(false);
      return;
    }

    const quoteId = quoteData.id;

    for (const container of form.containers) {
      const { data: containerData, error: containerError } = await supabase
        .from("moving_shipping_containers")
        .insert({
          move_id: moveId,
          shipping_quote_id: quoteId,
          container_label: container.container_label.trim(),
          tracking_number: container.tracking_number.trim(),
          container_type: container.container_type,
        })
        .select("id")
        .single();

      if (containerError || !containerData) {
        setError(containerError?.message || "Failed to create container.");
        setLoading(false);
        return;
      }

      const enabledLegs = container.leg_quotes.filter((lq) => lq.enabled && lq.amount > 0);
      if (enabledLegs.length > 0) {
        const legInserts = enabledLegs.map((lq) => ({
          move_id: moveId,
          shipping_quote_id: quoteId,
          container_id: containerData.id,
          leg: lq.leg,
          amount: lq.amount,
          route: lq.route.trim(),
          notes: lq.notes.trim(),
        }));

        const { error: legsError } = await supabase.from("moving_shipping_leg_quotes").insert(legInserts);
        if (legsError) {
          setError(legsError.message);
          setLoading(false);
          return;
        }
      }
    }

    setForm({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      currency: "GBP",
      collection_date: "",
      estimated_delivery_date: "",
      shipment_type: "",
      insurance_included: false,
      notes: "",
      containers: [makeDefaultContainer(0)],
    });
    setLoading(false);
    setOpen(false);
    onSuccess();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add quote
      </Button>
      {open ? (
        <ModalOverlay label="Add shipping quote" title="New quote" onClose={() => setOpen(false)} wide>
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 dark:bg-white/5 p-4 space-y-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Shipper details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Company name *</label>
                  <Input value={form.company_name} onChange={(e) => updateForm("company_name", e.target.value)} placeholder="e.g. Gold Coast Movers" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Contact name</label>
                  <Input value={form.contact_name} onChange={(e) => updateForm("contact_name", e.target.value)} placeholder="e.g. Naana Botchway" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="naana@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Phone</label>
                  <Input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+233 20 555 0114" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white/70 dark:bg-white/5 p-4 space-y-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Quote details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateForm("currency", e.target.value)}
                    className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Shipment type</label>
                  <Input value={form.shipment_type} onChange={(e) => updateForm("shipment_type", e.target.value)} placeholder="e.g. Door-to-door" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Collection date</label>
                  <Input type="date" value={form.collection_date} onChange={(e) => updateForm("collection_date", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Estimated delivery</label>
                  <Input type="date" value={form.estimated_delivery_date} onChange={(e) => updateForm("estimated_delivery_date", e.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <input type="checkbox" checked={form.insurance_included} onChange={(e) => updateForm("insurance_included", e.target.checked)} className="rounded border-slate-300" />
                Insurance included
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--foreground)]">Containers</p>
                <Button variant="secondary" type="button" onClick={addContainer} className="text-xs px-3 py-1.5">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add container
                </Button>
              </div>

              {form.containers.map((container, ci) => (
                <ContainerFormSection
                  key={ci}
                  container={container}
                  containerIndex={ci}
                  canRemove={form.containers.length > 1}
                  onUpdate={updateContainer}
                  onRemove={removeContainer}
                />
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                placeholder="Any additional notes about this quote"
              />
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add quote
              </Button>
            </div>
          </form>
        </ModalOverlay>
      ) : null}
    </>
  );
}
