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

export const assertAdminAal2 = async (requiredRole?: AdminRole) => {
  if (!supabase) throw new Error("Secure admin authentication is not configured.");
  const [{ data: userData, error: userError }, { data: assurance, error: assuranceError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (userError || assuranceError || !userData.user || assurance?.currentLevel !== "aal2") {
    throw new Error("Authenticator verification is required before this action.");
  }
  const role = await fetchAdminRole(userData.user.id);
  if (!role || (requiredRole && role !== requiredRole)) throw new Error("This account is not authorized for that action.");
  return role;
};
