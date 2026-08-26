import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { assertAdminAal2, fetchAdminRole, type AdminRole } from "./adminAuthorization";
import { getAdminSessionFailureMessage, getAdminSignInErrorMessage, type AdminSessionFailureReason } from "./adminAuthMessages";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type AdminAssuranceLevel = "aal1" | "aal2" | null;

export interface AdminMfaFactor {
  id: string;
  friendlyName: string;
}

export interface AdminSession {
  userId: string;
  email: string;
  mode: "supabase" | "local";
  role: AdminRole;
  assuranceLevel: AdminAssuranceLevel;
  verifiedTotpFactors: AdminMfaFactor[];
}

export interface TotpEnrollment {
  factorId: string;
  qrCode: string;
  secret: string;
}

type AdminAuthResult = { ok: true } | { ok: false; message: string };

interface AdminAuthValue {
  session: AdminSession | null;
  loading: boolean;
  mfaRequired: boolean;
  login: (email: string, password: string) => Promise<AdminAuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AdminSession | null>;
  beginTotpEnrollment: () => Promise<TotpEnrollment>;
  cancelTotpEnrollment: (factorId: string) => Promise<void>;
  verifyTotp: (factorId: string, code: string) => Promise<AdminAuthResult>;
  requestPasswordReset: (email: string) => Promise<AdminAuthResult>;
  updatePassword: (password: string) => Promise<AdminAuthResult>;
}

const STORAGE_KEY = "buyandsell-gh-temp-admin-session";
const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);
const LOCAL_ADMIN_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOCAL_ADMIN === "true";

const clearAdminClientState = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const notifyAdminSessionCleared = () => {
  window.dispatchEvent(new Event("buyandsell-gh:admin-session-cleared"));
};

const signOutInvalidSession = async () => {
  clearAdminClientState();
  await supabase?.auth.signOut({ scope: "local" });
  notifyAdminSessionCleared();
};

type AdminSessionValidation =
  | { ok: true; session: AdminSession }
  | { ok: false; reason: AdminSessionFailureReason };

const validateSupabaseSession = async (candidate: Session | null): Promise<AdminSessionValidation> => {
  if (!supabase || !candidate?.user.email) return { ok: false, reason: "missing" };

  const { data: userData, error: userError } = await supabase.auth.getUser(candidate.access_token);
  if (userError || !userData.user || userData.user.id !== candidate.user.id || !userData.user.email) {
    return { ok: false, reason: "invalid" };
  }

  let role: AdminRole | null;
  try {
    role = await fetchAdminRole(userData.user.id);
  } catch {
    return { ok: false, reason: "verification" };
  }
  if (!role) {
    return { ok: false, reason: "unauthorized" };
  }

  const [{ data: assurance, error: assuranceError }, { data: factors, error: factorsError }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(candidate.access_token),
    supabase.auth.mfa.listFactors(),
  ]);
  if (assuranceError || factorsError || !assurance) {
    return { ok: false, reason: "verification" };
  }

  return {
    ok: true,
    session: {
      userId: userData.user.id,
      email: userData.user.email,
      mode: "supabase",
      role,
      assuranceLevel: assurance.currentLevel === "aal2" ? "aal2" : "aal1",
      verifiedTotpFactors: (factors?.totp ?? []).map((factor) => ({
        id: factor.id,
        friendlyName: factor.friendly_name || "Authenticator app",
      })),
    },
  };
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const validationSequence = useRef(0);

  const applySupabaseSession = useCallback(async (candidate: Session | null) => {
    const sequence = ++validationSequence.current;
    try {
      const validation = await validateSupabaseSession(candidate);
      if (!validation.ok && candidate && (validation.reason === "invalid" || validation.reason === "unauthorized")) {
        await signOutInvalidSession();
      }
      if (sequence === validationSequence.current) setSession(validation.ok ? validation.session : null);
      return validation;
    } catch {
      if (sequence === validationSequence.current) setSession(null);
      return { ok: false, reason: "verification" } as const;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!supabase) return session;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      await signOutInvalidSession();
      setSession(null);
      return null;
    }
    const validation = await applySupabaseSession(data.session);
    return validation.ok ? validation.session : null;
  }, [applySupabaseSession, session]);

  useEffect(() => {
    let active = true;

    if (supabase) {
      supabase.auth.getSession()
        .then(({ data, error }) => {
          if (error) throw error;
          return applySupabaseSession(data.session);
        })
        .catch(() => {
          if (active) setSession(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        window.setTimeout(() => {
          if (active) void applySupabaseSession(nextSession);
        }, 0);
      });

      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    }

    try {
      if (!isAdminLoginAvailable()) {
        clearAdminClientState();
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSession(JSON.parse(saved) as AdminSession);
    } catch {
      clearAdminClientState();
    } finally {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [applySupabaseSession]);

  const value = useMemo<AdminAuthValue>(() => ({
    session,
    loading,
    mfaRequired: Boolean(session?.mode === "supabase" && session.assuranceLevel !== "aal2"),
    login: async (email, password) => {
      const trimmedEmail = email.trim();
      if (!isAdminLoginAvailable()) {
        return { ok: false, message: "Secure admin authentication is not configured." };
      }
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
          if (error || !data.session) return { ok: false, message: getAdminSignInErrorMessage(error) };
          const validation = await applySupabaseSession(data.session);
          if (!validation.ok) return { ok: false, message: getAdminSessionFailureMessage(validation.reason) };
          setSession(validation.session);
          return { ok: true };
        } catch {
          await signOutInvalidSession();
          return { ok: false, message: "Unable to sign in right now. Try again." };
        }
      }

      if (!LOCAL_ADMIN_ENABLED) return { ok: false, message: "Secure admin authentication is not configured." };
      const allowedEmail = import.meta.env.VITE_LOCAL_ADMIN_EMAIL;
      const allowedPassword = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD;
      if (!allowedEmail || !allowedPassword || trimmedEmail !== allowedEmail || password !== allowedPassword) {
        return { ok: false, message: "Incorrect email or password." };
      }

      const nextSession: AdminSession = {
        userId: "local-development",
        email: trimmedEmail,
        mode: "local",
        role: "owner",
        assuranceLevel: "aal2",
        verifiedTotpFactors: [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return { ok: true };
    },
    logout: async () => {
      validationSequence.current += 1;
      setSession(null);
      clearAdminClientState();
      await supabase?.auth.signOut({ scope: "global" });
      notifyAdminSessionCleared();
    },
    refreshSession,
    beginTotpEnrollment: async () => {
      if (!supabase || !session || session.mode !== "supabase") throw new Error("A verified admin session is required.");
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Buy & Sell GH Admin" });
      if (error || !data || data.type !== "totp") throw new Error("Authenticator enrollment could not be started.");
      return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
    },
    cancelTotpEnrollment: async (factorId) => {
      if (!supabase) return;
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw new Error("Authenticator enrollment could not be cancelled.");
    },
    verifyTotp: async (factorId, code) => {
      if (!supabase || !session || session.mode !== "supabase") return { ok: false, message: "A verified admin session is required." };
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) return { ok: false, message: "The verification code is invalid or expired." };
      const nextSession = await refreshSession();
      if (!nextSession || nextSession.assuranceLevel !== "aal2") return { ok: false, message: "MFA verification could not be confirmed." };
      return { ok: true };
    },
    requestPasswordReset: async (email) => {
      if (!supabase || !email.trim()) return { ok: false, message: "Enter your admin email address." };
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      return { ok: true };
    },
    updatePassword: async (password) => {
      if (!supabase) return { ok: false, message: "Secure password recovery is not configured." };
      try {
        await assertAdminAal2();
      } catch {
        return { ok: false, message: "Authenticator verification is required before changing the password." };
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { ok: false, message: "The password could not be updated. Request a fresh recovery link and try again." };
      return { ok: true };
    },
  }), [applySupabaseSession, loading, refreshSession, session]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
};

export const isLocalAdminEnabled = () => LOCAL_ADMIN_ENABLED;
export const isAdminLoginAvailable = () => isSupabaseConfigured() || LOCAL_ADMIN_ENABLED;

export { isSupabaseConfigured };
