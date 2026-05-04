"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useFamilyMembers, useSchoolEntries } from "@/lib/data-hooks";
import { formatCurrency } from "@/lib/utils";

export default function SchoolingPage() {
  const { data: familyMembers } = useFamilyMembers();
  const { data: schoolEntries } = useSchoolEntries();

  return (
    <div className="space-y-6">
      <PageHeader title="Schooling" description="Entries are grouped by child so application progress, yearly cost, and school-fit notes stay easy for parents to review quickly." actionLabel="Add school option" />

      <div className="grid gap-4">
        {schoolEntries.map((entry) => (
          <Card key={entry.id}>
            <CardTitle
              title={familyMembers.find((person) => person.id === entry.family_member_id)?.full_name ?? "Child"}
              subtitle={`${entry.school_name} • ${entry.year_group}`}
              action={<Badge tone="accent">{entry.application_status}</Badge>}
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
