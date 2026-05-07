"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  FamilyMember,
  InventoryItem,
  InventoryRoom,
  RelocationDocument,
} from "@/lib/types";

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
    .map(
      (d) =>
        `${d.document_type}${d.family_member_id ? ` (${d.reference_number || d.id.slice(0, 8)})` : ""}`,
    );
  const docsRemaining = documents
    .filter((d) => !completedDocStatuses.has(d.status))
    .map((d) => `${d.document_type} — ${d.status}`);

  const roomsCompleted = inventoryRooms.map((r) => r.room_name);
  const roomsRemaining: string[] = [];

  const furnitureCompleted = inventoryItems
    .filter((i) => i.status === "present")
    .map((i) => i.item_name);
  const furnitureRemaining = inventoryItems
    .filter((i) => i.status !== "present")
    .map((i) => `${i.item_name} (${i.status})`);

  return [
    {
      key: "people",
      label: "People",
      color: "bg-teal-500",
      bgColor: "bg-teal-500/15",
      dotColor: "bg-teal-500",
      hasData: familyMembers.length > 0,
      isComplete: familyMembers.length >= 1,
      completedItems: peopleCompleted,
      remainingItems: peopleRemaining,
    },
    {
      key: "documents",
      label: "Documents",
      color: "bg-amber-400",
      bgColor: "bg-amber-400/15",
      dotColor: "bg-amber-400",
      hasData: documents.length > 0,
      isComplete: documents.some((d) => completedDocStatuses.has(d.status)),
      completedItems: docsCompleted,
      remainingItems: docsRemaining,
    },
    {
      key: "rooms",
      label: "Rooms",
      color: "bg-indigo-500",
      bgColor: "bg-indigo-500/15",
      dotColor: "bg-indigo-500",
      hasData: inventoryRooms.length > 0,
      isComplete: inventoryRooms.length >= 1,
      completedItems: roomsCompleted,
      remainingItems: roomsRemaining,
    },
    {
      key: "furniture",
      label: "Furniture",
      color: "bg-rose-400",
      bgColor: "bg-rose-400/15",
      dotColor: "bg-rose-400",
      hasData: inventoryItems.length > 0,
      isComplete: inventoryItems.some((i) => i.status === "present"),
      completedItems: furnitureCompleted,
      remainingItems: furnitureRemaining,
    },
  ];
}

export function MovePreparationChart({
  familyMembers,
  documents,
  inventoryRooms,
  inventoryItems,
}: MovePreparationChartProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const allCategories = buildCategories(
    familyMembers,
    documents,
    inventoryRooms,
    inventoryItems,
  );
  const activeCategories = allCategories.filter((c) => c.hasData);

  if (activeCategories.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-500">
          Add family members, documents, rooms, or furniture to start tracking
          move preparation progress.
        </p>
      </Card>
    );
  }

  const categoryShare = 100 / activeCategories.length;
  const totalPercentage = Math.round(
    activeCategories.filter((c) => c.isComplete).length * categoryShare,
  );

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Move Preparation
            </p>
            <p className="mt-1 font-serif text-3xl font-semibold text-slate-900">
              {totalPercentage}%
            </p>
          </div>
          <Badge tone={totalPercentage === 100 ? "success" : "accent"}>
            {activeCategories.filter((c) => c.isComplete).length} of{" "}
            {activeCategories.length} categories complete
          </Badge>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full cursor-pointer overflow-hidden rounded-full"
          onClick={() => setModalOpen(true)}
          aria-label="View preparation breakdown"
        >
          {activeCategories.map((cat) => {
            const width = categoryShare;
            return (
              <div
                key={cat.key}
                className={cn(
                  "h-5 first:rounded-l-full last:rounded-r-full",
                  cat.isComplete ? cat.color : "bg-slate-200",
                )}
                style={{ width: `${width}%` }}
                title={`${cat.label}: ${cat.isComplete ? "Complete" : "Incomplete"}`}
              />
            );
          })}
        </button>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {activeCategories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  cat.dotColor,
                )}
              />
              <span className="text-xs font-medium text-slate-600">
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Click the bar to see a detailed breakdown
        </p>
      </Card>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4"
          onClick={() => setModalOpen(false)}
        >
          <Card
            className="w-full max-w-2xl p-4 sm:p-6 my-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Preparation Breakdown
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Move Preparation — {totalPercentage}% Complete
                </h3>
              </div>
              <button
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2 flex overflow-hidden rounded-full">
              {activeCategories.map((cat) => (
                <div
                  key={cat.key}
                  className={cn(
                    "h-3 first:rounded-l-full last:rounded-r-full",
                    cat.isComplete ? cat.color : "bg-slate-200",
                  )}
                  style={{ width: `${categoryShare}%` }}
                />
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {activeCategories.map((cat) => (
                <div
                  key={cat.key}
                  className={cn(
                    "rounded-3xl border border-white/70 p-4",
                    cat.bgColor,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-3 w-3 rounded-full",
                        cat.dotColor,
                      )}
                    />
                    <h4 className="font-semibold text-slate-900">
                      {cat.label}
                    </h4>
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
                            <li
                              key={i}
                              className="text-sm leading-5 text-slate-700"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-sm text-slate-400">None yet</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        Remaining ({cat.remainingItems.length})
                      </p>
                      {cat.remainingItems.length > 0 ? (
                        <ul className="mt-1.5 space-y-1">
                          {cat.remainingItems.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm leading-5 text-slate-700"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-sm text-slate-400">
                          All done
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
