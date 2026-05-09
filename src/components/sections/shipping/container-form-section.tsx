"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ShippingLeg } from "@/lib/types";

const SHIPPING_LEGS: Array<{ id: ShippingLeg; label: string; route: string }> = [
  { id: "first-leg", label: "First leg", route: "Home to UK port" },
  { id: "boat-leg", label: "Boat leg", route: "UK port to Tema port" },
  { id: "final-leg", label: "Final leg", route: "Tema port to residence" },
];

const CONTAINER_TYPES = ["20ft Container", "40ft Container", "Box", "Crate", "Other"];

export interface ContainerForm {
  container_label: string;
  tracking_number: string;
  container_type: string;
  leg_quotes: Array<{
    leg: ShippingLeg;
    enabled: boolean;
    amount: number;
    route: string;
    notes: string;
  }>;
}

export function makeDefaultContainer(index: number): ContainerForm {
  return {
    container_label: `Container ${index + 1}`,
    tracking_number: "",
    container_type: "20ft Container",
    leg_quotes: SHIPPING_LEGS.map((leg) => ({
      leg: leg.id,
      enabled: false,
      amount: 0,
      route: leg.route,
      notes: "",
    })),
  };
}

export { SHIPPING_LEGS, CONTAINER_TYPES };

export function ContainerFormSection({
  container,
  containerIndex,
  canRemove,
  onUpdate,
  onRemove,
}: {
  container: ContainerForm;
  containerIndex: number;
  canRemove: boolean;
  onUpdate: (index: number, updates: Partial<ContainerForm>) => void;
  onRemove: (index: number) => void;
}) {
  function updateLegQuote(
    legIndex: number,
    updates: Partial<ContainerForm["leg_quotes"][number]>,
  ) {
    onUpdate(containerIndex, {
      leg_quotes: container.leg_quotes.map((lq, li) =>
        li === legIndex ? { ...lq, ...updates } : lq,
      ),
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/70 dark:bg-white/5 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">{container.container_label}</p>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(containerIndex)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Label</label>
          <Input
            value={container.container_label}
            onChange={(e) => onUpdate(containerIndex, { container_label: e.target.value })}
            placeholder="Container 1"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Tracking number</label>
          <Input
            value={container.tracking_number}
            onChange={(e) => onUpdate(containerIndex, { tracking_number: e.target.value })}
            placeholder="e.g. GC-2026-4821"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Type</label>
          <select
            value={container.container_type}
            onChange={(e) => onUpdate(containerIndex, { container_type: e.target.value })}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
          >
            {CONTAINER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Leg pricing</p>
        {container.leg_quotes.map((lq, li) => (
          <div key={lq.leg} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-white/5 p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={lq.enabled}
                onChange={(e) => updateLegQuote(li, { enabled: e.target.checked })}
                className="rounded border-slate-300"
              />
              {SHIPPING_LEGS.find((sl) => sl.id === lq.leg)?.label}
            </label>
            {lq.enabled && (
              <div className="grid gap-3 sm:grid-cols-3 pl-0 sm:pl-6">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Amount</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={lq.amount || ""}
                    onChange={(e) => updateLegQuote(li, { amount: Math.max(0, Number(e.target.value)) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Route</label>
                  <Input
                    value={lq.route}
                    onChange={(e) => updateLegQuote(li, { route: e.target.value })}
                    placeholder="Route description"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Notes</label>
                  <Input
                    value={lq.notes}
                    onChange={(e) => updateLegQuote(li, { notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
