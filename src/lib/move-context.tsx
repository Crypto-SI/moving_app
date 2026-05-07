"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

export interface MoveMember {
  id: string;
  move_id: string;
  user_id: string;
  role: "owner" | "collaborator";
  joined_at: string;
}

interface MoveContextValue {
  moveId: string | null;
  role: "owner" | "collaborator" | null;
  loading: boolean;
  refresh: () => void;
}

const MoveContext = createContext<MoveContextValue | null>(null);

export function MoveProvider({ children }: { children: ReactNode }) {
  const [moveId, setMoveId] = useState<string | null>(null);
  const [role, setRole] = useState<"owner" | "collaborator" | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchMove = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (mounted.current) {
        setMoveId(null);
        setRole(null);
        setLoading(false);
      }
      return;
    }

    const { data } = await supabase
      .from("moving_move_members")
      .select("move_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mounted.current) {
      if (data) {
        setMoveId(data.move_id);
        setRole(data.role);
      } else {
        setMoveId(null);
        setRole(null);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchMove();
    return () => {
      mounted.current = false;
    };
  }, [fetchMove]);

  return (
    <MoveContext.Provider value={{ moveId, role, loading, refresh: fetchMove }}>
      {children}
    </MoveContext.Provider>
  );
}

export function useCurrentMove(): MoveContextValue {
  const context = useContext(MoveContext);
  if (!context) {
    throw new Error("useCurrentMove must be used within a MoveProvider");
  }
  return context;
}

export async function getMoveIdForUser(): Promise<string | null> {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("moving_move_members")
    .select("move_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.move_id ?? null;
}
