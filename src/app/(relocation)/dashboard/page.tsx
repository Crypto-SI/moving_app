"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MovePreparationChart } from "@/components/sections/move-preparation-chart";
import { Card } from "@/components/ui/card";
import {
  useBudgetItems,
  useDocuments,
  useFamilyMembers,
  useHealthcareEntries,
  useHousingOptions,
  useInventoryItems,
  useInventoryRooms,
  useSchoolEntries,
  useShippingQuotes,
} from "@/lib/data-hooks";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: familyMembers } = useFamilyMembers();
  const { data: documents } = useDocuments();
  const { data: shippingQuotes } = useShippingQuotes();
  const { data: housingOptions } = useHousingOptions();
  const { data: schoolEntries } = useSchoolEntries();
  const { data: healthcareEntries } = useHealthcareEntries();
  const { data: budgetItems } = useBudgetItems();
  const { data: inventoryRooms } = useInventoryRooms();
  const { data: inventoryItems } = useInventoryItems();

  const stats = [
    { label: "Total family members", value: familyMembers.length.toString() },
    { label: "Documents completed", value: documents.filter((item) => item.status === "approved" || item.status === "received").length.toString() },
    { label: "Shipping quotes collected", value: shippingQuotes.length.toString() },
    { label: "Housing options saved", value: housingOptions.length.toString() },
    { label: "Yearly school cost total", value: formatCurrency(schoolEntries.reduce((total, item) => total + item.fee_per_year, 0), "USD") },
    { label: "Healthcare providers added", value: healthcareEntries.length.toString() },
    { label: "Current moving budget total", value: formatCurrency(budgetItems.reduce((total, item) => total + item.planned_cost, 0), "GBP") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="A calm overview of the family move, with the critical path, cost signals, and next decisions surfaced immediately." actionLabel="Create task" />

      <MovePreparationChart familyMembers={familyMembers} documents={documents} inventoryRooms={inventoryRooms} inventoryItems={inventoryItems} />

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-4 break-words font-serif text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">{stat.value}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
