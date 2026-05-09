"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  FamilyMember,
  InventoryItem,
  InventoryRoom,
  RelocationDocument,
} from "@/lib/types";
import { PreparationBreakdownModal, type CategoryDef } from "@/components/sections/preparation-breakdown-modal";

interface MovePreparationChartProps {
  familyMembers: FamilyMember[];
  documents: RelocationDocument[];
  inventoryRooms: InventoryRoom[];
  inventoryItems: InventoryItem[];
}

function buildCategories(
  familyMembers: FamilyMember[],
  documents: RelocationDocument[],
  inventoryRooms: InventoryRoom[],
  inventoryItems: InventoryItem[],
): CategoryDef[] {
  const completedDocStatuses = new Set(["approved", "received"]);

  const peopleCompleted = familyMembers.map((m) => m.full_name);
  const peopleRemaining: string[] = [];

  const docsCompleted = documents
    .filter((d) => completedDocStatuses.has(d.status))
    .map((d) => `${d.document_type}${d.family_member_id ? ` (${d.reference_number || d.id.slice(0, 8)})` : ""}`);
  const docsRemaining = documents
    .filter((d) => !completedDocStatuses.has(d.status))
    .map((d) => `${d.document_type} — ${d.status}`);

  const roomsCompleted = inventoryRooms.map((r) => r.room_name);
  const roomsRemaining: string[] = [];

  const furnitureCompleted = inventoryItems.filter((i) => i.status === "present").map((i) => i.item_name);
  const furnitureRemaining = inventoryItems.filter((i) => i.status !== "present").map((i) => `${i.item_name} (${i.status})`);

  return [
    { key: "people", label: "People", color: "bg-teal-500", bgColor: "bg-teal-500/15", dotColor: "bg-teal-500", hasData: familyMembers.length > 0, isComplete: familyMembers.length >= 1, completedItems: peopleCompleted, remainingItems: peopleRemaining },
    { key: "documents", label: "Documents", color: "bg-amber-400", bgColor: "bg-amber-400/15", dotColor: "bg-amber-400", hasData: documents.length > 0, isComplete: documents.some((d) => completedDocStatuses.has(d.status)), completedItems: docsCompleted, remainingItems: docsRemaining },
    { key: "rooms", label: "Rooms", color: "bg-indigo-500", bgColor: "bg-indigo-500/15", dotColor: "bg-indigo-500", hasData: inventoryRooms.length > 0, isComplete: inventoryRooms.length >= 1, completedItems: roomsCompleted, remainingItems: roomsRemaining },
    { key: "furniture", label: "Furniture", color: "bg-rose-400", bgColor: "bg-rose-400/15", dotColor: "bg-rose-400", hasData: inventoryItems.length > 0, isComplete: inventoryItems.some((i) => i.status === "present"), completedItems: furnitureCompleted, remainingItems: furnitureRemaining },
  ];
}

export function MovePreparationChart({
  familyMembers,
  documents,
  inventoryRooms,
  inventoryItems,
}: MovePreparationChartProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const allCategories = buildCategories(familyMembers, documents, inventoryRooms, inventoryItems);
  const activeCategories = allCategories.filter((c) => c.hasData);

  if (activeCategories.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">
          Add family members, documents, rooms, or furniture to start tracking move preparation progress.
        </p>
      </Card>
    );
  }

  const categoryShare = 100 / activeCategories.length;
  const totalPercentage = Math.round(activeCategories.filter((c) => c.isComplete).length * categoryShare);

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Move Preparation</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-[var(--foreground)]">{totalPercentage}%</p>
          </div>
          <Badge tone={totalPercentage === 100 ? "success" : "accent"}>
            {activeCategories.filter((c) => c.isComplete).length} of {activeCategories.length} categories complete
          </Badge>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full cursor-pointer overflow-hidden rounded-full"
          onClick={() => setModalOpen(true)}
          aria-label="View preparation breakdown"
        >
          {activeCategories.map((cat) => (
            <div
              key={cat.key}
              className={cn(
                "h-5 first:rounded-l-full last:rounded-r-full",
                cat.isComplete ? cat.color : "bg-slate-200 dark:bg-slate-700",
              )}
              style={{ width: `${categoryShare}%` }}
              title={`${cat.label}: ${cat.isComplete ? "Complete" : "Incomplete"}`}
            />
          ))}
        </button>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {activeCategories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1.5">
              <span className={cn("inline-block h-2.5 w-2.5 rounded-full", cat.dotColor)} />
              <span className="text-xs font-medium text-[var(--muted)]">{cat.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">Click the bar to see a detailed breakdown</p>
      </Card>

      {modalOpen ? (
        <PreparationBreakdownModal
          categories={activeCategories}
          categoryShare={categoryShare}
          totalPercentage={totalPercentage}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
