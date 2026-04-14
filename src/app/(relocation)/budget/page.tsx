import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { budgetItems } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BudgetPage() {
  const totalPlanned = budgetItems.reduce((total, item) => total + item.planned_cost, 0);
  const totalActual = budgetItems.reduce((total, item) => total + item.actual_cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Budget" description="Relocation costs are separated into readable categories with a simple visual summary and enough structure for future reporting." actionLabel="Add budget item" />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total planned</p>
          <p className="mt-4 font-serif text-4xl">{formatCurrency(totalPlanned, "GBP")}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total actual</p>
          <p className="mt-4 font-serif text-4xl">{formatCurrency(totalActual, "GBP")}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Remaining difference</p>
          <p className="mt-4 font-serif text-4xl">{formatCurrency(totalPlanned - totalActual, "GBP")}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardTitle title="Category snapshot" subtitle="A lightweight chart treatment without adding a charting library yet." />
          <div className="space-y-4">
            {budgetItems.map((item) => {
              const fill = item.actual_cost > 0 ? Math.max(8, (item.actual_cost / Math.max(item.planned_cost, 1)) * 100) : 6;
              return (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{item.item_name}</span>
                    <span className="text-slate-500">{item.category}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/70">
                    <div className="h-3 rounded-full bg-gradient-to-r from-teal-600 to-amber-400" style={{ width: `${Math.min(fill, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle title="Budget detail" subtitle="Planned cost, actual cost, status, due date, and notes." />
          <div className="grid gap-3 md:hidden">
            {budgetItems.map((item) => (
              <div key={item.id} className="rounded-[28px] border border-white/70 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{item.item_name}</p>
                  <span className="text-sm capitalize text-slate-500">{item.status}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <p className="capitalize">{item.category}</p>
                  <p>Planned: {formatCurrency(item.planned_cost, item.currency)}</p>
                  <p>Actual: {formatCurrency(item.actual_cost, item.currency)}</p>
                  <p>Due: {formatDate(item.due_date)}</p>
                  <p>{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="hidden min-w-full text-left text-sm md:table">
              <thead className="text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Item</th>
                  <th className="px-3 py-3 font-medium">Planned</th>
                  <th className="px-3 py-3 font-medium">Actual</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Due date</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item) => (
                  <tr key={item.id} className="border-t border-white/70">
                    <td className="px-3 py-4 capitalize">{item.category}</td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-slate-900">{item.item_name}</p>
                      <p className="text-slate-500">{item.notes}</p>
                    </td>
                    <td className="px-3 py-4">{formatCurrency(item.planned_cost, item.currency)}</td>
                    <td className="px-3 py-4">{formatCurrency(item.actual_cost, item.currency)}</td>
                    <td className="px-3 py-4 capitalize">{item.status}</td>
                    <td className="px-3 py-4">{formatDate(item.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
