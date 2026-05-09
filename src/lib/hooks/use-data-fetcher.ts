"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMockDataToggle } from "@/lib/data-context";
import { useCurrentMove } from "@/lib/move-context";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

export interface DataResult<T> {
  data: T[];
  loading: boolean;
  refresh: () => void;
}

export function useDataFetcher<T>(tableName: string, mockData: T[], orderBy: string = "created_at"): DataResult<T> {
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
    void Promise.resolve().then(fetchData);
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}
