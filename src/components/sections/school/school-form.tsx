"use client";

import { Input } from "@/components/ui/input";
import { useFamilyMembers } from "@/lib/data-hooks";

const APPLICATION_STATUSES = [
  "not started",
  "researching",
  "documents requested",
  "interview scheduled",
  "applied",
  "offered",
  "accepted",
  "declined",
  "waitlisted",
];

export interface SchoolFormData {
  family_member_id: string;
  school_name: string;
  address: string;
  contact_name: string;
  contact_details: string;
  fee_per_year: number;
  application_status: string;
  year_group: string;
  distance_from_home: string;
  notes: string;
}

export const EMPTY_SCHOOL_FORM: SchoolFormData = {
  family_member_id: "",
  school_name: "",
  address: "",
  contact_name: "",
  contact_details: "",
  fee_per_year: 0,
  application_status: "not started",
  year_group: "",
  distance_from_home: "",
  notes: "",
};

export function schoolFormFromEntry(entry: {
  family_member_id: string;
  school_name: string;
  address: string;
  contact_name: string;
  contact_details: string;
  fee_per_year: number;
  application_status: string;
  year_group: string;
  distance_from_home: string;
  notes: string;
}): SchoolFormData {
  return {
    family_member_id: entry.family_member_id,
    school_name: entry.school_name,
    address: entry.address,
    contact_name: entry.contact_name,
    contact_details: entry.contact_details,
    fee_per_year: entry.fee_per_year,
    application_status: entry.application_status,
    year_group: entry.year_group,
    distance_from_home: entry.distance_from_home,
    notes: entry.notes,
  };
}

export function SchoolFormFields({
  form,
  onChange,
}: {
  form: SchoolFormData;
  onChange: <K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) => void;
}) {
  const { data: familyMembers } = useFamilyMembers();
  const children = familyMembers.filter((m) => m.relationship.toLowerCase() === "child");

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Child</label>
        <select
          value={form.family_member_id}
          onChange={(e) => onChange("family_member_id", e.target.value)}
          className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
        >
          <option value="">Select a child</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>{child.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">School name *</label>
        <Input
          value={form.school_name}
          onChange={(e) => onChange("school_name", e.target.value)}
          placeholder="e.g. Lincoln Community School"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Address</label>
        <Input
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="e.g. 126 Jungle Rd, East Legon, Accra"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Contact name</label>
          <Input
            value={form.contact_name}
            onChange={(e) => onChange("contact_name", e.target.value)}
            placeholder="e.g. Admissions Office"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Contact details</label>
          <Input
            value={form.contact_details}
            onChange={(e) => onChange("contact_details", e.target.value)}
            placeholder="email or phone"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Fee per year</label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={form.fee_per_year || ""}
            onChange={(e) => onChange("fee_per_year", Math.max(0, Number(e.target.value)))}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Application status</label>
          <select
            value={form.application_status}
            onChange={(e) => onChange("application_status", e.target.value)}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Year group</label>
          <Input
            value={form.year_group}
            onChange={(e) => onChange("year_group", e.target.value)}
            placeholder="e.g. Year 8"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Distance from home</label>
          <Input
            value={form.distance_from_home}
            onChange={(e) => onChange("distance_from_home", e.target.value)}
            placeholder="e.g. 14 mins"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
          placeholder="Optional notes about this school"
        />
      </div>
    </div>
  );
}
