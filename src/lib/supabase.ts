import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/env";

const { url, anonKey } = getSupabaseConfig();

export const supabase = createBrowserClient(url, anonKey);
