"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMockDataToggle } from "@/lib/data-context";
import { useCurrentMove } from "@/lib/move-context";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { relocation as mockRelocation, moveDate as mockMoveDate } from "@/lib/mock-data";
import type { Relocation } from "@/lib/types";

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
    void Promise.resolve().then(fetchRelocation);
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

export function useMoveDate(): string {
  const { relocation } = useRelocation();
  return relocation?.move_date || mockMoveDate;
}
