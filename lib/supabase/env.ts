export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    const missing = [
      !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
      !supabasePublishableKey
        ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        : null,
    ].filter(Boolean);

    throw new Error(
      `Missing Supabase environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}
