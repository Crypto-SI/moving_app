import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SchemaPanel } from "@/components/sections/schema-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { budgetItems, documents, familyMembers, healthcareEntries, housingOptions, quickLinks, recentActivity, schoolEntries, shippingQuotes, timelineTasks } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const stats = [
  { label: "Total family members", value: familyMembers.length.toString() },
  { label: "Documents completed", value: documents.filter((item) => item.status === "approved" || item.status === "received").length.toString() },
  { label: "Tasks due soon", value: timelineTasks.filter((task) => task.status !== "done").slice(0, 3).length.toString() },
  { label: "Shipping quotes collected", value: shippingQuotes.length.toString() },
  { label: "Housing options saved", value: housingOptions.length.toString() },
  { label: "Yearly school cost total", value: formatCurrency(schoolEntries.reduce((total, item) => total + item.fee_per_year, 0), "USD") },
  { label: "Healthcare providers added", value: healthcareEntries.length.toString() },
  { label: "Current moving budget total", value: formatCurrency(budgetItems.reduce((total, item) => total + item.planned_cost, 0), "GBP") },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="A calm overview of the family move, with the critical path, cost signals, and next decisions surfaced immediately." actionLabel="Create task" />

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-4 font-serif text-4xl font-semibold text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.35fr,0.9fr]">
        <Card>
          <CardTitle title="Recent activity" subtitle="Mock updates that make the dashboard feel live and operational." />
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="rounded-3xl border border-white/70 bg-white/75 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{activity.title}</p>
                  <Badge tone="accent">{activity.timestamp}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{activity.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Quick links" subtitle="Jump straight into the highest-value sections." />
          <div className="grid gap-3">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-[28px] bg-slate-900 p-5 text-white">
            <p className="text-sm text-slate-300">At a glance</p>
            <p className="mt-3 font-serif text-3xl">Useful, calm, and future-ready</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">The shell already separates layout, typed data, and schemas so Supabase queries can slot in without reworking the UI hierarchy.</p>
          </div>
        </Card>
      </section>

      <SchemaPanel />
    </div>
  );
}
