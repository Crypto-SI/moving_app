"use client";

import { useDataFetcher, type DataResult } from "@/lib/hooks/use-data-fetcher";
import {
  familyMembers as mockFamilyMembers,
  documents as mockDocuments,
  budgetItems as mockBudgetItems,
  miscNotes as mockMiscNotes,
  recentActivity as mockRecentActivity,
  moveDate as mockMoveDate,
} from "@/lib/mock-data";
import type {
  BudgetItem,
  FamilyMember,
  RelocationDocument,
} from "@/lib/types";

export { useRelocation, useMoveDate } from "@/lib/hooks/use-relocation";
export { useShippingQuotes, useHousingOptions, useInventoryRooms, useInventoryItems, useSchoolEntries, useHealthcareEntries } from "@/lib/hooks/use-shipping-quotes";
export { ensureDocuments } from "@/lib/hooks/ensure-documents";
export { useDataFetcher, type DataResult } from "@/lib/hooks/use-data-fetcher";

export function useFamilyMembers(): DataResult<FamilyMember> {
  return useDataFetcher<FamilyMember>("moving_family_members", mockFamilyMembers, "created_at");
}

export function useDocuments(): DataResult<RelocationDocument> {
  return useDataFetcher<RelocationDocument>("moving_documents", mockDocuments, "created_at");
}

export function useBudgetItems(): DataResult<BudgetItem> {
  return useDataFetcher<BudgetItem>("moving_budget_items", mockBudgetItems, "due_date");
}

export function useMiscNotes(): DataResult<MiscNote> {
  return useDataFetcher<MiscNote>("moving_misc_notes", mockMiscNotes, "date_added");
}

export { mockRecentActivity, mockMoveDate };

import type { MiscNote } from "@/lib/types";
