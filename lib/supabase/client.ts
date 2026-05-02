"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv();

  browserClient = createClient(supabaseUrl, supabasePublishableKey);

  return browserClient;
}
