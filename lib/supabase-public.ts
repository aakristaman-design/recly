import { createClient } from "@supabase/supabase-js";

// Read-only client on the publishable key — RLS allows SELECT and nothing
// else, so this is safe wherever it runs.
export function createPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        // Next 14 caches fetch in server components by default; dashboard
        // reads must always reflect the latest saves.
        fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
      },
    },
  );
}
