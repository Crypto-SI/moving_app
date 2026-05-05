"use client";

import { Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddSchoolModal, EditSchoolModal } from "@/components/sections/add-school-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useFamilyMembers, useSchoolEntries } from "@/lib/data-hooks";
import { formatCurrency } from "@/lib/utils";
import type { SchoolEntry } from "@/lib/types";

function EditButton({
  entry,
  onEdit,
}: {
  entry: SchoolEntry;
  onEdit: (e: SchoolEntry) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(entry)}
      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
      title="Edit school option"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

export default function SchoolingPage() {
  const { data: familyMembers } = useFamilyMembers();
  const { data: schoolEntries, refresh } = useSchoolEntries();
  const [editEntry, setEditEntry] = useState<SchoolEntry | null>(null);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleEditClose = useCallback(() => {
    setEditEntry(null);
  }, []);

  return (
    <div className="space-y-6">
      {editEntry ? (
        <EditSchoolModal
          entry={editEntry}
          onSuccess={handleRefresh}
          onClose={handleEditClose}
        />
      ) : null}

      <PageHeader
        title="Schooling"
        description="Entries are grouped by child so application progress, yearly cost, and school-fit notes stay easy for parents to review quickly."
        actions={<AddSchoolModal onSuccess={handleRefresh} />}
      />

      <div className="grid gap-4">
        {schoolEntries.map((entry) => (
          <Card key={entry.id}>
            <CardTitle
              title={familyMembers.find((person) => person.id === entry.family_member_id)?.full_name ?? "Child"}
              subtitle={`${entry.school_name} • ${entry.year_group}`}
              action={
                <div className="flex items-center gap-2">
                  <EditButton entry={entry} onEdit={setEditEntry} />
                  <Badge tone="accent">{entry.application_status}</Badge>
                </div>
              }
            />
            <div className="grid gap-4 xl:grid-cols-[1fr,1fr,0.8fr]">
              <div>
                <p className="text-sm font-semibold text-slate-700">School details</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.address}</p>
                <p className="mt-2 text-sm text-slate-500">{entry.contact_name} • {entry.contact_details}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.notes}</p>
              </div>
              <div className="rounded-[24px] bg-slate-900 p-5 text-white">
                <p className="text-sm text-slate-300">Fee per year</p>
                <p className="mt-3 font-serif text-4xl">{formatCurrency(entry.fee_per_year, "USD")}</p>
                <p className="mt-2 text-sm text-slate-300">Distance from home: {entry.distance_from_home}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
