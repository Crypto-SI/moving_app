import type { ShippingLeg, ShippingQuote, ShippingContainerWithLegs } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export const shippingLegs: Array<{ id: ShippingLeg; label: string; route: string }> = [
  { id: "first-leg", label: "First leg", route: "Home to UK port" },
  { id: "boat-leg", label: "Boat leg", route: "UK port to Tema port" },
  { id: "final-leg", label: "Final leg", route: "Tema port to residence" },
];

export function getContainerTotal(container: ShippingContainerWithLegs) {
  return container.leg_quotes.reduce((total, lq) => total + lq.amount, 0);
}

export function getQuoteTotal(quote: ShippingQuote) {
  if (quote.containers && quote.containers.length > 0) {
    return quote.containers.reduce((total, c) => total + getContainerTotal(c), 0);
  }
  return quote.leg_quotes.reduce((total, legQuote) => total + legQuote.amount, 0);
}

export function getLegQuote(quote: ShippingQuote, leg: ShippingLeg) {
  return quote.leg_quotes.find((legQuote) => legQuote.leg === leg);
}

export function buildPreferredBlocks(shippingQuotes: ShippingQuote[]) {
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

export function ContainerBreakdown({ containers, currency }: { containers: ShippingContainerWithLegs[]; currency: string }) {
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
