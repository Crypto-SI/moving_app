"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMockDataToggle } from "@/lib/data-context";
import { useCurrentMove } from "@/lib/move-context";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import {
  shippingQuotes as mockShippingQuotes,
  housingOptions as mockHousingOptions,
  inventoryRooms as mockInventoryRooms,
  inventoryItems as mockInventoryItems,
  schoolEntries as mockSchoolEntries,
  healthcareEntries as mockHealthcareEntries,
} from "@/lib/mock-data";
import type {
  HealthcareEntry,
  HousingOption,
  InventoryItem,
  InventoryRoom,
  SchoolEntry,
  ShippingContainerWithLegs,
  ShippingLeg as ShippingLegType,
  ShippingLegQuote,
  ShippingQuote,
} from "@/lib/types";
import { useDataFetcher, type DataResult } from "@/lib/hooks/use-data-fetcher";

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
    void Promise.resolve().then(fetchData);
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
