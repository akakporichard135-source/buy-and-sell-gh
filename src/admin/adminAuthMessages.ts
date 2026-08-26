export type AdminSessionFailureReason = "missing" | "invalid" | "unauthorized" | "verification";

type SupabaseAuthErrorLike = {
  code?: string;
  status?: number;
};

export function getAdminSignInErrorMessage(error: SupabaseAuthErrorLike | null) {
  if (error?.code === "invalid_credentials" || error?.status === 400) return "Incorrect email or password.";
  return "Unable to sign in right now. Try again.";
}

export function getAdminSessionFailureMessage(reason: AdminSessionFailureReason) {
  if (reason === "unauthorized") return "This account does not have admin access.";
  if (reason === "verification") return "Unable to verify admin access right now. Try again.";
  if (reason === "invalid") return "Your secure session could not be verified. Sign in again.";
  return "Unable to sign in right now. Try again.";
}
