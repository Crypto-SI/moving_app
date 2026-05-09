"use client";

import { useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddShippingQuoteModal } from "@/components/sections/add-shipping-quote-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useShippingQuotes } from "@/lib/data-hooks";
import { ShippingLeg, ShippingQuote, ShippingContainerWithLegs } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const shippingLegs: Array<{ id: ShippingLeg; label: string; route: string }> = [
  { id: "first-leg", label: "First leg", route: "Home to UK port" },
  { id: "boat-leg", label: "Boat leg", route: "UK port to Tema port" },
  { id: "final-leg", label: "Final leg", route: "Tema port to residence" },
];

function getContainerTotal(container: ShippingContainerWithLegs) {
  return container.leg_quotes.reduce((total, lq) => total + lq.amount, 0);
}

function getQuoteTotal(quote: ShippingQuote) {
  if (quote.containers && quote.containers.length > 0) {
    return quote.containers.reduce((total, c) => total + getContainerTotal(c), 0);
  }
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

function ContainerBreakdown({ containers, currency }: { containers: ShippingContainerWithLegs[]; currency: string }) {
  if (!containers || containers.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {containers.map((container) => (
        <div key={container.id} className="rounded-xl border dark:border-slate-700 dark:bg-white/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{container.container_label}</p>
              <p className="text-xs text-[var(--muted)]">{container.container_type}</p>
            </div>
            <div className="flex items-center gap-2">
              {container.tracking_number && (
                <span className="rounded-full dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
                  {container.tracking_number}
                </span>
              )}
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {formatCurrency(getContainerTotal(container), currency)}
              </span>
            </div>
          </div>
          {container.leg_quotes.length > 0 && (
            <div className="mt-2 grid gap-1.5">
              {container.leg_quotes.map((lq) => (
                <div key={lq.leg} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)]">
                    {shippingLegs.find((sl) => sl.id === lq.leg)?.label ?? lq.leg}
                  </span>
                  <span className="font-medium text-[var(--foreground)]">{formatCurrency(lq.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ShippingPage() {
  const { data: shippingQuotes, refresh } = useShippingQuotes();

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const preferredBlocks = shippingQuotes.length > 0 ? buildPreferredBlocks(shippingQuotes) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Quotes are split by first leg, boat leg, and final leg so every shipper offer maps to the exact section of the journey it covers."
        actions={<AddShippingQuoteModal onSuccess={handleRefresh} />}
      />

      <Card>
        <CardTitle
          title="Preferred quotes"
          subtitle="Lowest current quote for each leg. When the same shipper leads adjacent legs, their quote spans those sections."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {shippingLegs.map((leg) => (
            <div key={leg.id} className="rounded-2xl border border-[var(--border)] dark:bg-white/10 p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">{leg.label}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{leg.route}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {preferredBlocks.map((block) => (
            <div
              key={`${block.quote.id}-${block.start}`}
              className={cn(
                "rounded-2xl border dark:border-teal-700 dark:bg-teal-900/20 p-4",
                block.span === 2 && "md:col-span-2",
                block.span === 3 && "md:col-span-3",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{block.quote.company_name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{block.legs.map((entry) => entry.leg.label).join(" + ")}</p>
                </div>
                <Badge tone="success">{formatCurrency(block.amount, block.quote.currency)}</Badge>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {block.legs.map((entry) => (
                  <div key={entry.leg.id} className="rounded-xl dark:bg-white/10 p-3 text-sm">
                    <p className="font-medium text-[var(--foreground)]">{entry.leg.label}</p>
                    <p className="mt-1 text-[var(--muted)]">{formatCurrency(entry.legQuote.amount, block.quote.currency)}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{entry.legQuote.notes}</p>
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
            <p className="break-words font-serif text-3xl font-semibold sm:text-4xl">{formatCurrency(getQuoteTotal(quote), quote.currency)}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {quote.shipment_type} - Collects {formatDate(quote.collection_date)}
            </p>

            {quote.containers && quote.containers.length > 0 ? (
              <ContainerBreakdown containers={quote.containers} currency={quote.currency} />
            ) : (
              <div className="mt-4 grid gap-2">
                {shippingLegs.map((leg) => {
                  const legQuote = getLegQuote(quote, leg.id);

                  return (
                    <div key={leg.id} className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] dark:bg-white/10 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--foreground)]">{leg.label}</p>
                        <p className="text-xs text-[var(--muted)]">{leg.route}</p>
                      </div>
                      {legQuote ? (
                        <span className="break-words font-semibold text-[var(--foreground)]">{formatCurrency(legQuote.amount, quote.currency)}</span>
                      ) : (
                        <Badge>Not quoted</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-sm text-[var(--muted)]">{quote.notes}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="Quote comparison" subtitle="Each column shows whether the shipper is definitely quoting that section of the trip." />
        <div className="grid gap-3 md:hidden">
          {shippingQuotes.map((quote) => (
            <div key={quote.id} className="rounded-2xl border border-[var(--border)] dark:bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[var(--foreground)]">{quote.company_name}</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(getQuoteTotal(quote), quote.currency)}</p>
              </div>
              {(quote.containers && quote.containers.length > 0 ? quote.containers : []).map((container) => (
                <div key={container.id} className="mt-3 rounded-xl dark:bg-white/5 p-3">
                  <p className="text-xs font-semibold text-[var(--foreground)]">{container.container_label} ({container.container_type})</p>
                  {container.tracking_number && (
                    <p className="text-xs text-[var(--muted)]">Tracking: {container.tracking_number}</p>
                  )}
                  <div className="mt-2 grid gap-1 text-xs text-[var(--muted)]">
                    {container.leg_quotes.map((lq) => (
                      <p key={lq.leg}>
                        <span className="font-medium text-[var(--foreground)]">
                          {shippingLegs.find((sl) => sl.id === lq.leg)?.label ?? lq.leg}:
                        </span>{" "}
                        {formatCurrency(lq.amount, quote.currency)} - {lq.route}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                {shippingLegs.map((leg) => {
                  const legQuote = getLegQuote(quote, leg.id);

                  return (
                    <p key={leg.id}>
                      <span className="font-medium text-[var(--foreground)]">{leg.label}:</span>{" "}
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
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="px-3 py-3 font-medium">Company</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Containers</th>
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
                <tr key={quote.id} className="border-t border-[var(--border)] align-top">
                  <td className="px-3 py-4 font-semibold text-[var(--foreground)]">{quote.company_name}</td>
                  <td className="px-3 py-4 text-[var(--muted)]">{quote.contact_name}<br />{quote.email}<br />{quote.phone}</td>
                  <td className="px-3 py-4">
                    {(quote.containers ?? []).map((c) => (
                      <div key={c.id} className="mb-1 last:mb-0">
                        <p className="text-xs font-medium text-[var(--foreground)]">{c.container_label}</p>
                        <p className="text-xs text-[var(--muted)]">{c.container_type}</p>
                        {c.tracking_number && (
                          <p className="text-xs text-teal-600">{c.tracking_number}</p>
                        )}
                      </div>
                    ))}
                    {(!quote.containers || quote.containers.length === 0) && (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  {shippingLegs.map((leg) => {
                    const legQuote = getLegQuote(quote, leg.id);

                    return (
                      <td key={leg.id} className="px-3 py-4">
                        {legQuote ? (
                          <>
                            <p className="font-semibold text-[var(--foreground)]">{formatCurrency(legQuote.amount, quote.currency)}</p>
                            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{legQuote.route}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">Not quoted</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-4 font-semibold text-[var(--foreground)]">{formatCurrency(getQuoteTotal(quote), quote.currency)}</td>
                  <td className="px-3 py-4 text-[var(--muted)]">{formatDate(quote.collection_date)}<br />{formatDate(quote.estimated_delivery_date)}</td>
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
