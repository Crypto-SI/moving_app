"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useShippingQuotes } from "@/lib/data-hooks";
import { ShippingLeg, ShippingQuote } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const shippingLegs: Array<{ id: ShippingLeg; label: string; route: string }> = [
  { id: "first-leg", label: "First leg", route: "Home to UK port" },
  { id: "boat-leg", label: "Boat leg", route: "UK port to Tema port" },
  { id: "final-leg", label: "Final leg", route: "Tema port to residence" },
];

function getQuoteTotal(quote: ShippingQuote) {
  return quote.leg_quotes.reduce((total, legQuote) => total + legQuote.amount, 0);
}

function getLegQuote(quote: ShippingQuote, leg: ShippingLeg) {
  return quote.leg_quotes.find((legQuote) => legQuote.leg === leg);
}

function buildPreferredBlocks(shippingQuotes: ShippingQuote[]) {
  const preferredByLeg = shippingLegs.map((leg) => {
    const best = shippingQuotes
      .map((quote) => ({ quote, legQuote: getLegQuote(quote, leg.id) }))
      .filter((entry): entry is { quote: ShippingQuote; legQuote: NonNullable<ReturnType<typeof getLegQuote>> } => Boolean(entry.legQuote))
      .sort((a, b) => a.legQuote.amount - b.legQuote.amount)[0];

    return { leg, ...best };
  });

  return preferredByLeg.reduce<Array<{
    quote: ShippingQuote;
    start: number;
    span: number;
    legs: typeof preferredByLeg;
    amount: number;
  }>>((blocks, preferred, index) => {
    const previous = blocks[blocks.length - 1];

    if (previous && previous.quote.id === preferred.quote.id) {
      previous.span += 1;
      previous.legs.push(preferred);
      previous.amount += preferred.legQuote.amount;
      return blocks;
    }

    blocks.push({
      quote: preferred.quote,
      start: index + 1,
      span: 1,
      legs: [preferred],
      amount: preferred.legQuote.amount,
    });

    return blocks;
  }, []);
}

export default function ShippingPage() {
  const { data: shippingQuotes } = useShippingQuotes();
  const preferredBlocks = shippingQuotes.length > 0 ? buildPreferredBlocks(shippingQuotes) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Quotes are split by first leg, boat leg, and final leg so every shipper offer maps to the exact section of the journey it covers."
        actionLabel="Add quote"
      />

      <Card>
        <CardTitle
          title="Preferred quotes"
          subtitle="Lowest current quote for each leg. When the same shipper leads adjacent legs, their quote spans those sections."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {shippingLegs.map((leg) => (
            <div key={leg.id} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-900">{leg.label}</p>
              <p className="mt-1 text-xs text-slate-500">{leg.route}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {preferredBlocks.map((block) => (
            <div
              key={`${block.quote.id}-${block.start}`}
              className={cn(
                "rounded-2xl border border-teal-200 bg-teal-50/80 p-4",
                block.span === 2 && "md:col-span-2",
                block.span === 3 && "md:col-span-3",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{block.quote.company_name}</p>
                  <p className="mt-1 text-sm text-slate-600">{block.legs.map((entry) => entry.leg.label).join(" + ")}</p>
                </div>
                <Badge tone="success">{formatCurrency(block.amount, block.quote.currency)}</Badge>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {block.legs.map((entry) => (
                  <div key={entry.leg.id} className="rounded-xl bg-white/75 p-3 text-sm">
                    <p className="font-medium text-slate-900">{entry.leg.label}</p>
                    <p className="mt-1 text-slate-600">{formatCurrency(entry.legQuote.amount, block.quote.currency)}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{entry.legQuote.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {shippingQuotes.map((quote) => (
          <Card key={quote.id}>
            <CardTitle
              title={quote.company_name}
              subtitle={quote.contact_name}
              action={<Badge tone="accent">{quote.leg_quotes.length} of 3 legs</Badge>}
            />
            <p className="font-serif text-4xl font-semibold">{formatCurrency(getQuoteTotal(quote), quote.currency)}</p>
            <p className="mt-2 text-sm text-slate-500">
              {quote.shipment_type} - Collects {formatDate(quote.collection_date)}
            </p>
            <div className="mt-4 grid gap-2">
              {shippingLegs.map((leg) => {
                const legQuote = getLegQuote(quote, leg.id);

                return (
                  <div key={leg.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{leg.label}</p>
                      <p className="text-xs text-slate-500">{leg.route}</p>
                    </div>
                    {legQuote ? (
                      <span className="font-semibold text-slate-900">{formatCurrency(legQuote.amount, quote.currency)}</span>
                    ) : (
                      <Badge>Not quoted</Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-slate-600">{quote.notes}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="Quote comparison" subtitle="Each column shows whether the shipper is definitely quoting that section of the trip." />
        <div className="grid gap-3 md:hidden">
          {shippingQuotes.map((quote) => (
            <div key={quote.id} className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{quote.company_name}</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(getQuoteTotal(quote), quote.currency)}</p>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                {shippingLegs.map((leg) => {
                  const legQuote = getLegQuote(quote, leg.id);

                  return (
                    <p key={leg.id}>
                      <span className="font-medium text-slate-900">{leg.label}:</span>{" "}
                      {legQuote ? `${formatCurrency(legQuote.amount, quote.currency)} - ${legQuote.route}` : "Not quoted"}
                    </p>
                  );
                })}
                <p>Collection {formatDate(quote.collection_date)} - Delivery {formatDate(quote.estimated_delivery_date)}</p>
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
                {shippingLegs.map((leg) => (
                  <th key={leg.id} className="px-3 py-3 font-medium">{leg.label}</th>
                ))}
                <th className="px-3 py-3 font-medium">Total quoted</th>
                <th className="px-3 py-3 font-medium">Dates</th>
                <th className="px-3 py-3 font-medium">Insurance</th>
              </tr>
            </thead>
            <tbody>
              {shippingQuotes.map((quote) => (
                <tr key={quote.id} className="border-t border-white/70 align-top">
                  <td className="px-3 py-4 font-semibold text-slate-900">{quote.company_name}</td>
                  <td className="px-3 py-4 text-slate-600">{quote.contact_name}<br />{quote.email}<br />{quote.phone}</td>
                  {shippingLegs.map((leg) => {
                    const legQuote = getLegQuote(quote, leg.id);

                    return (
                      <td key={leg.id} className="px-3 py-4">
                        {legQuote ? (
                          <>
                            <p className="font-semibold text-slate-900">{formatCurrency(legQuote.amount, quote.currency)}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{legQuote.route}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">Not quoted</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-4 font-semibold text-slate-900">{formatCurrency(getQuoteTotal(quote), quote.currency)}</td>
                  <td className="px-3 py-4 text-slate-600">{formatDate(quote.collection_date)}<br />{formatDate(quote.estimated_delivery_date)}</td>
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
