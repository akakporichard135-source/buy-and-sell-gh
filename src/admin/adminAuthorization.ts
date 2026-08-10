import { supabase } from "../lib/supabase";

export type AdminRole = "owner" | "admin";

export const fetchAdminRole = async (userId: string): Promise<AdminRole | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["owner", "admin"])
    .maybeSingle();
  if (error) throw error;
  return (data?.role as AdminRole | undefined) ?? null;
};

