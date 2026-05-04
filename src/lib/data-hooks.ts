"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMockDataToggle } from "@/lib/data-context";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import {
  familyMembers as mockFamilyMembers,
  documents as mockDocuments,
  timelineTasks as mockTimelineTasks,
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
  ShippingLeg as ShippingLegType,
  ShippingLegQuote,
  ShippingQuote,
  TimelineTask,
} from "@/lib/types";

interface DataResult<T> {
  data: T[];
  loading: boolean;
}

function useDataFetcher<T>(tableName: string, mockData: T[], orderBy: string = "created_at"): DataResult<T> {
  const { useMockData } = useMockDataToggle();
  const [data, setData] = useState<T[]>(useMockData ? mockData : []);
  const [loading, setLoading] = useState(!useMockData);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (useMockData) {
      setData(mockData);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const { data: rows } = await supabase
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .order(orderBy);

    if (mounted.current) {
      setData(rows ?? []);
      setLoading(false);
    }
  }, [useMockData, tableName, mockData, orderBy]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, loading };
}

export function useFamilyMembers(): DataResult<FamilyMember> {
  return useDataFetcher<FamilyMember>("moving_family_members", mockFamilyMembers, "created_at");
}

export function useDocuments(): DataResult<RelocationDocument> {
  return useDataFetcher<RelocationDocument>("moving_documents", mockDocuments, "created_at");
}

export function useTimelineTasks(): DataResult<TimelineTask> {
  return useDataFetcher<TimelineTask>("moving_timeline_tasks", mockTimelineTasks, "due_date");
}

interface ShippingQuoteWithLegs {
  quote: ShippingQuote;
  legs: { leg: string; amount: number; route: string; notes: string }[];
}

export function useShippingQuotes(): DataResult<ShippingQuote> & { quotesWithLegs: ShippingQuoteWithLegs[] } {
  const { useMockData } = useMockDataToggle();
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

    setLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setData([]);
      setQuotesWithLegs([]);
      setLoading(false);
      return;
    }

    const [quotesRes, legsRes] = await Promise.all([
      supabase.from("moving_shipping_quotes").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("moving_shipping_leg_quotes").select("*").eq("user_id", user.id).order("created_at"),
    ]);

    const quotes = quotesRes.data ?? [];
    const legs = legsRes.data ?? [];

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

    if (mounted.current) {
      setData(quotes.map((q: Record<string, unknown>) => {
        const quoteLegs = built.find((b) => b.quote.id === (q as { id: string }).id)?.legs ?? [];
        return { ...q, leg_quotes: quoteLegs } as ShippingQuote;
      }));
      setQuotesWithLegs(built);
      setLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, loading, quotesWithLegs };
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
  const [relocation, setRelocation] = useState<Relocation | null>(useMockData ? mockRelocation : null);
  const [loading, setLoading] = useState(!useMockData);
  const mounted = useRef(true);

  const fetchRelocation = useCallback(async () => {
    if (useMockData) {
      setRelocation(mockRelocation);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRelocation(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("moving_relocations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mounted.current) {
      setRelocation(data as Relocation | null);
      setLoading(false);
    }
  }, [useMockData]);

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
        setRelocation((prev) => (prev ? { ...prev, ...updates } : { id: "reloc-1", move_date: "", destination: "Accra, Ghana", notes: "", ...updates }));
        return;
      }

      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const existing = relocation;
      if (existing?.id) {
        const { data } = await supabase
          .from("moving_relocations")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        if (mounted.current && data) {
          setRelocation(data as Relocation);
        }
      } else {
        const { data } = await supabase
          .from("moving_relocations")
          .insert({ user_id: user.id, ...updates })
          .select()
          .single();
        if (mounted.current && data) {
          setRelocation(data as Relocation);
        }
      }
    },
    [useMockData, relocation],
  );

  return { relocation, loading, updateRelocation };
}

export { mockRecentActivity, mockMoveDate };
