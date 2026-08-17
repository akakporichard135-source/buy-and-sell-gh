import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export const productImagesBucket = (import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET as string | undefined) || "product-images";

const authStorage = (() => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
})();

export const supabase: SupabaseClient | null = isSupabaseConfigured() && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        persistSession: Boolean(authStorage),
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;

export const getSupabaseOrThrow = () => {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
};
