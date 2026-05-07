"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { getMoveIdForUser } from "@/lib/move-context";
import { ShippingLeg } from "@/lib/types";

const SHIPPING_LEGS: Array<{ id: ShippingLeg; label: string; route: string }> = [
  { id: "first-leg", label: "First leg", route: "Home to UK port" },
  { id: "boat-leg", label: "Boat leg", route: "UK port to Tema port" },
  { id: "final-leg", label: "Final leg", route: "Tema port to residence" },
];

const CONTAINER_TYPES = ["20ft Container", "40ft Container", "Box", "Crate", "Other"];

interface ContainerForm {
  container_label: string;
  tracking_number: string;
  container_type: string;
  leg_quotes: Array<{
    leg: ShippingLeg;
    enabled: boolean;
    amount: number;
    route: string;
    notes: string;
  }>;
}

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

function makeDefaultContainer(index: number): ContainerForm {
  return {
    container_label: `Container ${index + 1}`,
    tracking_number: "",
    container_type: "20ft Container",
    leg_quotes: SHIPPING_LEGS.map((leg) => ({
      leg: leg.id,
      enabled: false,
      amount: 0,
      route: leg.route,
      notes: "",
    })),
  };
}

const CURRENCIES = ["GBP", "USD", "EUR", "GHS"];

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

  function updateLegQuote(
    containerIndex: number,
    legIndex: number,
    updates: Partial<ContainerForm["leg_quotes"][number]>,
  ) {
    setForm((prev) => ({
      ...prev,
      containers: prev.containers.map((c, i) => {
        if (i !== containerIndex) return c;
        return {
          ...c,
          leg_quotes: c.leg_quotes.map((lq, li) => (li === legIndex ? { ...lq, ...updates } : lq)),
        };
      }),
    }));
  }

  function addContainer() {
    setForm((prev) => ({
      ...prev,
      containers: [...prev.containers, makeDefaultContainer(prev.containers.length)],
    }));
  }

  function removeContainer(index: number) {
    setForm((prev) => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index),
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
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:px-4"
          onClick={() => setOpen(false)}
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Add shipping quote</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">New quote</h3>
              </div>
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 space-y-4">
                <p className="text-sm font-semibold text-slate-900">Shipper details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Company name *</label>
                    <Input
                      value={form.company_name}
                      onChange={(e) => updateForm("company_name", e.target.value)}
                      placeholder="e.g. Gold Coast Movers"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Contact name</label>
                    <Input
                      value={form.contact_name}
                      onChange={(e) => updateForm("contact_name", e.target.value)}
                      placeholder="e.g. Naana Botchway"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="naana@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      placeholder="+233 20 555 0114"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 space-y-4">
                <p className="text-sm font-semibold text-slate-900">Quote details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => updateForm("currency", e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:bg-white"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Shipment type</label>
                    <Input
                      value={form.shipment_type}
                      onChange={(e) => updateForm("shipment_type", e.target.value)}
                      placeholder="e.g. Door-to-door"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Collection date</label>
                    <Input
                      type="date"
                      value={form.collection_date}
                      onChange={(e) => updateForm("collection_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Estimated delivery</label>
                    <Input
                      type="date"
                      value={form.estimated_delivery_date}
                      onChange={(e) => updateForm("estimated_delivery_date", e.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.insurance_included}
                    onChange={(e) => updateForm("insurance_included", e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Insurance included
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Containers</p>
                  <Button variant="secondary" type="button" onClick={addContainer} className="text-xs px-3 py-1.5">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add container
                  </Button>
                </div>

                {form.containers.map((container, ci) => (
                  <div
                    key={ci}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{container.container_label}</p>
                      {form.containers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContainer(ci)}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Label</label>
                        <Input
                          value={container.container_label}
                          onChange={(e) => updateContainer(ci, { container_label: e.target.value })}
                          placeholder="Container 1"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Tracking number</label>
                        <Input
                          value={container.tracking_number}
                          onChange={(e) => updateContainer(ci, { tracking_number: e.target.value })}
                          placeholder="e.g. GC-2026-4821"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                        <select
                          value={container.container_type}
                          onChange={(e) => updateContainer(ci, { container_type: e.target.value })}
                          className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:bg-white"
                        >
                          {CONTAINER_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Leg pricing</p>
                      {container.leg_quotes.map((lq, li) => (
                        <div key={lq.leg} className="rounded-xl border border-slate-100 bg-white/50 p-3 space-y-3">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={lq.enabled}
                              onChange={(e) => updateLegQuote(ci, li, { enabled: e.target.checked })}
                              className="rounded border-slate-300"
                            />
                            {SHIPPING_LEGS.find((sl) => sl.id === lq.leg)?.label}
                          </label>
                          {lq.enabled && (
                            <div className="grid gap-3 sm:grid-cols-3 pl-0 sm:pl-6">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Amount</label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={lq.amount || ""}
                                  onChange={(e) =>
                                    updateLegQuote(ci, li, { amount: Math.max(0, Number(e.target.value)) })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Route</label>
                                <Input
                                  value={lq.route}
                                  onChange={(e) => updateLegQuote(ci, li, { route: e.target.value })}
                                  placeholder="Route description"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
                                <Input
                                  value={lq.notes}
                                  onChange={(e) => updateLegQuote(ci, li, { notes: e.target.value })}
                                  placeholder="Optional notes"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
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
          </Card>
        </div>
      ) : null}
    </>
  );
}
