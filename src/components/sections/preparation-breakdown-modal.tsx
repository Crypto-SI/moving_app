"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { cn } from "@/lib/utils";

interface CategoryDef {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  hasData: boolean;
  isComplete: boolean;
  completedItems: string[];
  remainingItems: string[];
}

export function PreparationBreakdownModal({
  categories,
  categoryShare,
  totalPercentage,
  onClose,
}: {
  categories: CategoryDef[];
  categoryShare: number;
  totalPercentage: number;
  onClose: () => void;
}) {
  return (
    <ModalOverlay label="Preparation Breakdown" title={`Move Preparation — ${totalPercentage}% Complete`} onClose={onClose} wide>
      <div className="mt-2 flex overflow-hidden rounded-full">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={cn(
              "h-3 first:rounded-l-full last:rounded-r-full",
              cat.isComplete ? cat.color : "bg-slate-200 dark:bg-slate-700",
            )}
            style={{ width: `${categoryShare}%` }}
          />
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={cn(
              "rounded-3xl border border-[var(--border)] p-4",
              cat.bgColor,
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("inline-block h-3 w-3 rounded-full", cat.dotColor)} />
              <h4 className="font-semibold text-[var(--foreground)]">{cat.label}</h4>
              <Badge tone={cat.isComplete ? "success" : "warning"}>
                {cat.isComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Completed ({cat.completedItems.length})
                </p>
                {cat.completedItems.length > 0 ? (
                  <ul className="mt-1.5 space-y-1">
                    {cat.completedItems.map((item, i) => (
                      <li key={i} className="text-sm leading-5 text-[var(--foreground)]">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-sm text-[var(--muted)]">None yet</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Remaining ({cat.remainingItems.length})
                </p>
                {cat.remainingItems.length > 0 ? (
                  <ul className="mt-1.5 space-y-1">
                    {cat.remainingItems.map((item, i) => (
                      <li key={i} className="text-sm leading-5 text-[var(--foreground)]">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-sm text-[var(--muted)]">All done</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </ModalOverlay>
  );
}

export type { CategoryDef };
