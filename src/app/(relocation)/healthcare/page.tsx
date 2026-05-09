"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { useFamilyMembers, useHealthcareEntries } from "@/lib/data-hooks";
import { formatCurrency } from "@/lib/utils";

export default function HealthcarePage() {
  const { data: familyMembers } = useFamilyMembers();
  const { data: healthcareEntries, refresh } = useHealthcareEntries();

  return (
    <div className="space-y-6">
      <PageHeader title="Healthcare" description="Per-person healthcare relationships are organised to make family coverage visible at a glance." actionLabel="Add provider" />
      <Card>
        <CardTitle title="Healthcare providers" subtitle="Linked by family member for clear accountability and quick onboarding once in Ghana." />
        <div className="grid gap-4 lg:grid-cols-2">
          {healthcareEntries.map((entry) => (
            <div key={entry.id} className="rounded-[28px] border border-[var(--border)] bg-white/80 dark:bg-white/5 p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-[var(--muted)]">{familyMembers.find((person) => person.id === entry.family_member_id)?.full_name}</p>
                <DeleteButton tableName="moving_healthcare_entries" itemId={entry.id} label="provider" onSuccess={refresh} />
              </div>
              <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{entry.doctor_name}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{entry.address}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{entry.contact_details}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Consultation fee</span>
                <span className="font-semibold text-[var(--foreground)]">{formatCurrency(entry.fee, "USD")}</span>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">{entry.notes}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
