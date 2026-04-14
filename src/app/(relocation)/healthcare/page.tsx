import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { familyMembers, healthcareEntries } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function HealthcarePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Healthcare" description="Per-person healthcare relationships are organised to make family coverage visible at a glance." actionLabel="Add provider" />
      <Card>
        <CardTitle title="Healthcare providers" subtitle="Linked by family member for clear accountability and quick onboarding once in Ghana." />
        <div className="grid gap-4 lg:grid-cols-2">
          {healthcareEntries.map((entry) => (
            <div key={entry.id} className="rounded-[28px] border border-white/70 bg-white/80 p-5">
              <p className="text-sm text-slate-500">{familyMembers.find((person) => person.id === entry.family_member_id)?.full_name}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{entry.doctor_name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{entry.address}</p>
              <p className="mt-2 text-sm text-slate-500">{entry.contact_details}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">Consultation fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(entry.fee, "USD")}</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">{entry.notes}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
