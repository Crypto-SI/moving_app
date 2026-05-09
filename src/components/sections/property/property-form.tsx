"use client";

import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

const CURRENCIES = ["GBP", "USD", "EUR", "GHS"];

export interface PropertyFormData {
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

export const EMPTY_PROPERTY_FORM: PropertyFormData = {
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

export function propertyFormFromData(p: {
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
}): PropertyFormData {
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

export function PropertyFormFields({
  form,
  onChange,
  showDecisionToggles,
}: {
  form: PropertyFormData;
  onChange: <K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) => void;
  showDecisionToggles?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Property title *
        </label>
        <Input
          value={form.property_title}
          onChange={(e) => onChange("property_title", e.target.value)}
          placeholder="e.g. Palm Court Townhouse"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Location *
        </label>
        <Input
          value={form.location}
          onChange={(e) => onChange("location", e.target.value)}
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
          onChange={(e) => onChange("advert_link", e.target.value)}
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
            onChange={(e) => onChange("number_of_rooms", Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Boys quarters
          </label>
          <div className="mt-2">
            <Toggle
              checked={form.has_boys_quarters}
              onChange={(checked) => onChange("has_boys_quarters", checked)}
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
            onChange={(e) => onChange("rent", Math.max(0, Number(e.target.value)))}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Currency
          </label>
          <select
            value={form.currency}
            onChange={(e) => onChange("currency", e.target.value)}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
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
              onChange={(e) => onChange("landlord_or_agent_name", e.target.value)}
              placeholder="e.g. Ava Realty Ghana"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Contact details
            </label>
            <Input
              value={form.contact_details}
              onChange={(e) => onChange("contact_details", e.target.value)}
              placeholder="email or phone"
            />
          </div>
        </div>
      </div>

      {showDecisionToggles ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Viewed</label>
            <div className="mt-2">
              <Toggle
                checked={form.viewed}
                onChange={(checked) => onChange("viewed", checked)}
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
                onChange={(checked) => onChange("shortlisted", checked)}
                labelOn="Yes"
                labelOff="No"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
          placeholder="Optional notes about this property"
        />
      </div>
    </div>
  );
}
