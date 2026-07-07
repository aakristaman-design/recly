import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the secret key — RLS denies all writes
// to the publishable key, so every write goes through here.
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
