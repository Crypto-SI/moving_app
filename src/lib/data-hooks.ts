"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMockDataToggle } from "@/lib/data-context";
import { useCurrentMove, getMoveIdForUser } from "@/lib/move-context";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMissingDocumentTypes } from "@/lib/document-requirements";
import {
  familyMembers as mockFamilyMembers,
  documents as mockDocuments,
  shippingQuotes as mockShippingQuotes,
  housingOptions as mockHousingOptions,
  inventoryRooms as mockInventoryRooms,
  inventoryItems as mockInventoryItems,
  schoolEntries as mockSchoolEntries,
  healthcareEntries as mockHealthcareEntries,
  budgetItems as mockBudgetItems,
  miscNotes as mockMiscNotes,
  recentActivity as mockRecentActivity,
  moveDate as mockMoveDate,
  relocation as mockRelocation,
} from "@/lib/mock-data";
import type {
  BudgetItem,
  FamilyMember,
  HealthcareEntry,
  HousingOption,
  InventoryItem,
  InventoryRoom,
  MiscNote,
  Relocation,
  RelocationDocument,
  SchoolEntry,
  ShippingContainerWithLegs,
  ShippingLeg as ShippingLegType,
  ShippingLegQuote,
  ShippingQuote,
} from "@/lib/types";

interface DataResult<T> {
  data: T[];
  loading: boolean;
  refresh: () => void;
}

function useDataFetcher<T>(tableName: string, mockData: T[], orderBy: string = "created_at"): DataResult<T> {
  const { useMockData } = useMockDataToggle();
  const { moveId } = useCurrentMove();
  const [data, setData] = useState<T[]>(useMockData ? mockData : []);
  const [loading, setLoading] = useState(!useMockData);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (useMockData) {
      setData(mockData);
      setLoading(false);
      return;
    }

    if (!moveId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const { data: rows } = await supabase
      .from(tableName)
      .select("*")
      .eq("move_id", moveId)
      .order(orderBy);

    if (mounted.current) {
      setData(rows ?? []);
      setLoading(false);
    }
  }, [useMockData, moveId, tableName, mockData, orderBy]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}

export function useFamilyMembers(): DataResult<FamilyMember> {
  return useDataFetcher<FamilyMember>("moving_family_members", mockFamilyMembers, "created_at");
}

export function useDocuments(): DataResult<RelocationDocument> {
  return useDataFetcher<RelocationDocument>("moving_documents", mockDocuments, "created_at");
}

interface ShippingQuoteWithLegs {
  quote: ShippingQuote;
  legs: { leg: string; amount: number; route: string; notes: string }[];
}

interface RawContainer {
  id: string;
  shipping_quote_id: string;
  container_label: string;
  tracking_number: string;
  container_type: string;
}

export function useShippingQuotes(): DataResult<ShippingQuote> & { quotesWithLegs: ShippingQuoteWithLegs[] } {
  const { useMockData } = useMockDataToggle();
  const { moveId } = useCurrentMove();
  const [data, setData] = useState<ShippingQuote[]>(useMockData ? mockShippingQuotes : []);
  const [quotesWithLegs, setQuotesWithLegs] = useState<ShippingQuoteWithLegs[]>([]);
  const [loading, setLoading] = useState(!useMockData);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (useMockData) {
      setData(mockShippingQuotes);
      setQuotesWithLegs(
        mockShippingQuotes.map((q) => ({
          quote: q,
          legs: q.leg_quotes,
        })),
      );
      setLoading(false);
      return;
    }

    if (!moveId) {
      setData([]);
      setQuotesWithLegs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const [quotesRes, legsRes, containersRes] = await Promise.all([
      supabase.from("moving_shipping_quotes").select("*").eq("move_id", moveId).order("created_at"),
      supabase.from("moving_shipping_leg_quotes").select("*").eq("move_id", moveId).order("created_at"),
      supabase.from("moving_shipping_containers").select("*").eq("move_id", moveId).order("created_at"),
    ]);

    const quotes = quotesRes.data ?? [];
    const legs = legsRes.data ?? [];
    const containers = containersRes.data ?? [];

    const built: ShippingQuoteWithLegs[] = quotes.map((q) => ({
      quote: { ...q, leg_quotes: [] },
      legs: legs
        .filter((l: { shipping_quote_id: string }) => l.shipping_quote_id === q.id)
        .map((l: { leg: string; amount: number; route: string; notes: string }): ShippingLegQuote => ({
          leg: l.leg as ShippingLegType,
          amount: l.amount,
          route: l.route,
          notes: l.notes,
        })),
    }));

    const enrichedQuotes = quotes.map((q: Record<string, unknown>) => {
      const quoteId = (q as { id: string }).id;
      const quoteLegs = built.find((b) => b.quote.id === quoteId)?.legs ?? [];

      const quoteContainers: ShippingContainerWithLegs[] = containers
        .filter((c: RawContainer) => c.shipping_quote_id === quoteId)
        .map((c: RawContainer): ShippingContainerWithLegs => ({
          id: c.id,
          shipping_quote_id: c.shipping_quote_id,
          container_label: c.container_label,
          tracking_number: c.tracking_number,
          container_type: c.container_type,
          leg_quotes: legs
            .filter((l: { container_id: string | null }) => l.container_id === c.id)
            .map((l: { leg: string; amount: number; route: string; notes: string }): ShippingLegQuote => ({
              leg: l.leg as ShippingLegType,
              amount: l.amount,
              route: l.route,
              notes: l.notes,
            })),
        }));

      return { ...q, leg_quotes: quoteLegs, containers: quoteContainers } as ShippingQuote;
    });

    if (mounted.current) {
      setData(enrichedQuotes);
      setQuotesWithLegs(built);
      setLoading(false);
    }
  }, [useMockData, moveId]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, loading, quotesWithLegs, refresh: fetchData };
}

export function useHousingOptions(): DataResult<HousingOption> {
  return useDataFetcher<HousingOption>("moving_housing_options", mockHousingOptions, "created_at");
}

export function useInventoryRooms(): DataResult<InventoryRoom> {
  return useDataFetcher<InventoryRoom>("moving_inventory_rooms", mockInventoryRooms, "sort_order");
}

export function useInventoryItems(): DataResult<InventoryItem> {
  return useDataFetcher<InventoryItem>("moving_inventory_items", mockInventoryItems, "created_at");
}

export function useSchoolEntries(): DataResult<SchoolEntry> {
  return useDataFetcher<SchoolEntry>("moving_school_entries", mockSchoolEntries, "created_at");
}

export function useHealthcareEntries(): DataResult<HealthcareEntry> {
  return useDataFetcher<HealthcareEntry>("moving_healthcare_entries", mockHealthcareEntries, "created_at");
}

export function useBudgetItems(): DataResult<BudgetItem> {
  return useDataFetcher<BudgetItem>("moving_budget_items", mockBudgetItems, "due_date");
}

export function useMiscNotes(): DataResult<MiscNote> {
  return useDataFetcher<MiscNote>("moving_misc_notes", mockMiscNotes, "date_added");
}

export function useMoveDate(): string {
  const { relocation } = useRelocation();
  return relocation?.move_date || mockMoveDate;
}

interface RelocationResult {
  relocation: Relocation | null;
  loading: boolean;
  updateRelocation: (updates: Partial<Pick<Relocation, "move_date" | "destination" | "notes">>) => Promise<void>;
}

export function useRelocation(): RelocationResult {
  const { useMockData } = useMockDataToggle();
  const { moveId } = useCurrentMove();
  const [relocation, setRelocation] = useState<Relocation | null>(useMockData ? mockRelocation : null);
  const [loading, setLoading] = useState(!useMockData);
  const mounted = useRef(true);

  const fetchRelocation = useCallback(async () => {
    if (useMockData) {
      setRelocation(mockRelocation);
      setLoading(false);
      return;
    }

    if (!moveId) {
      setRelocation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const { data } = await supabase
      .from("moving_moves")
      .select("*")
      .eq("id", moveId)
      .maybeSingle();

    if (mounted.current) {
      setRelocation(data as Relocation | null);
      setLoading(false);
    }
  }, [useMockData, moveId]);

  useEffect(() => {
    mounted.current = true;
    fetchRelocation();
    return () => {
      mounted.current = false;
    };
  }, [fetchRelocation]);

  const updateRelocation = useCallback(
    async (updates: Partial<Pick<Relocation, "move_date" | "destination" | "notes">>) => {
      if (useMockData) {
        setRelocation((prev) => (prev ? { ...prev, ...updates } : { id: "reloc-1", move_date: "", destination: "", notes: "", invite_code: "", created_at: "", updated_at: "", ...updates }));
        return;
      }

      if (!moveId) {
        throw new Error("No move found — cannot save.");
      }

      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from("moving_moves")
        .update(updates)
        .eq("id", moveId)
        .select()
        .single();

      if (error) throw error;
      if (mounted.current && data) {
        setRelocation(data as Relocation);
      }
    },
    [useMockData, moveId],
  );

  return { relocation, loading, updateRelocation };
}

export { mockRecentActivity, mockMoveDate };

export async function ensureDocuments(
  familyMembers: FamilyMember[],
  existingDocs: RelocationDocument[],
): Promise<void> {
  const moveId = await getMoveIdForUser();
  if (!moveId) return;

  const inserts: {
    move_id: string;
    family_member_id: string;
    document_type: string;
    status: string;
  }[] = [];

  for (const member of familyMembers) {
    const memberDocs = existingDocs.filter((d) => d.family_member_id === member.id);
    const missing = getMissingDocumentTypes(member.relationship, memberDocs);
    for (const docType of missing) {
      inserts.push({
        move_id: moveId,
        family_member_id: member.id,
        document_type: docType,
        status: "not started",
      });
    }
  }

  if (inserts.length > 0) {
    const supabase = createBrowserClient();
    await supabase.from("moving_documents").insert(inserts);
  }
}
