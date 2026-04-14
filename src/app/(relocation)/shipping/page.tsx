import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { shippingQuotes } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Shipping" description="Quote comparison is clear on both cards and tables, with service differences and best-value signals kept explicit." actionLabel="Add quote" />

      <div className="grid gap-4 xl:grid-cols-3">
        {shippingQuotes.map((quote, index) => (
          <Card key={quote.id}>
            <CardTitle title={quote.company_name} subtitle={quote.contact_name} action={index === 0 ? <Badge tone="success">Best value</Badge> : null} />
            <p className="font-serif text-4xl font-semibold">{formatCurrency(quote.quote_amount, quote.currency)}</p>
            <p className="mt-2 text-sm text-slate-500">{quote.shipment_type} • Collects {formatDate(quote.collection_date)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quote.included_services.map((service) => (
                <Badge key={service} tone="neutral">{service}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">{quote.notes}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="Quote comparison" subtitle="Door-to-door and port-only options are distinguished clearly for practical decision-making." />
        <div className="grid gap-3 md:hidden">
          {shippingQuotes.map((quote, index) => (
            <div key={quote.id} className="rounded-[28px] border border-white/70 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{quote.company_name}</p>
                {index === 0 ? <Badge tone="success">Best value</Badge> : null}
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p>{quote.contact_name} • {quote.phone}</p>
                <p>{quote.email}</p>
                <p>{formatCurrency(quote.quote_amount, quote.currency)} • {quote.shipment_type}</p>
                <p>Collection {formatDate(quote.collection_date)} • Delivery {formatDate(quote.estimated_delivery_date)}</p>
                <p>Insurance: {quote.insurance_included ? "Included" : "Not included"}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="hidden min-w-full text-left text-sm md:table">
            <thead className="text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Company</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Quote</th>
                <th className="px-3 py-3 font-medium">Collection</th>
                <th className="px-3 py-3 font-medium">Delivery</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Insurance</th>
              </tr>
            </thead>
            <tbody>
              {shippingQuotes.map((quote) => (
                <tr key={quote.id} className="border-t border-white/70">
                  <td className="px-3 py-4 font-semibold text-slate-900">{quote.company_name}</td>
                  <td className="px-3 py-4 text-slate-600">{quote.contact_name}<br />{quote.email}<br />{quote.phone}</td>
                  <td className="px-3 py-4">{formatCurrency(quote.quote_amount, quote.currency)}</td>
                  <td className="px-3 py-4">{formatDate(quote.collection_date)}</td>
                  <td className="px-3 py-4">{formatDate(quote.estimated_delivery_date)}</td>
                  <td className="px-3 py-4">{quote.shipment_type}</td>
                  <td className="px-3 py-4">{quote.insurance_included ? "Included" : "Not included"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
