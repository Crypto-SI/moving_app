"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

export function useInviteCode(moveId: string | null) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const prevMoveId = useRef<string | null>(null);

  const fetchCode = useCallback(async () => {
    if (!moveId) {
      setInviteCode(null);
      return;
    }

    const supabase = createBrowserClient();
    const { data } = await supabase
      .from("moving_moves")
      .select("invite_code")
      .eq("id", moveId)
      .single();
    setInviteCode(data?.invite_code ?? null);
  }, [moveId]);

  useEffect(() => {
    if (prevMoveId.current !== moveId) {
      prevMoveId.current = moveId;
      void Promise.resolve().then(fetchCode);
    }
  }, [moveId, fetchCode]);

  return { inviteCode };
}
