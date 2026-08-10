import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchAdminRole, type AdminRole } from "./adminAuthorization";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface AdminSession {
  email: string;
  mode: "supabase" | "local";
  role?: AdminRole;
}

interface AdminAuthValue {
  session: AdminSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
}

const STORAGE_KEY = "buyandsell-gh-temp-admin-session";
const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);
const LOCAL_ADMIN_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOCAL_ADMIN === "true";

const sessionToAdminSession = async (session: Session | null): Promise<AdminSession | null> => {
  if (!session?.user.email) return null;
  const role = await fetchAdminRole(session.user.id);
  if (!role) {
    await supabase?.auth.signOut();
    return null;
  }
  return { email: session.user.email, mode: "supabase", role };
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (supabase) {
      supabase.auth.getSession()
        .then(async ({ data }) => {
          const nextSession = await sessionToAdminSession(data.session);
          if (active) setSession(nextSession);
        })
        .catch(() => {
          if (active) setSession(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
        void sessionToAdminSession(next).then((adminSession) => {
          if (active) setSession(adminSession);
        });
      });
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    }

    try {
      if (!isAdminLoginAvailable()) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSession(JSON.parse(saved) as AdminSession);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      session,
      loading,
      login: async (email, password) => {
        const trimmedEmail = email.trim();
        if (!isAdminLoginAvailable()) {
          return { ok: false, message: "Production admin authentication is not configured yet. Connect Supabase Auth or enable local admin only in development." };
        }
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
          if (error) return { ok: false, message: "Invalid admin credentials or inactive account." };
          const nextSession = await sessionToAdminSession(data.session);
          if (!nextSession) return { ok: false, message: "This account is not authorized for admin access." };
          setSession(nextSession);
          return { ok: true };
        }
        if (!LOCAL_ADMIN_ENABLED) {
          return { ok: false, message: "Supabase environment variables are detected, but the frontend auth client is not installed yet." };
        }
        const allowedEmail = import.meta.env.VITE_LOCAL_ADMIN_EMAIL;
        const allowedPassword = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD;
        if (!allowedEmail || !allowedPassword) {
          return { ok: false, message: "Set VITE_LOCAL_ADMIN_EMAIL and VITE_LOCAL_ADMIN_PASSWORD for local admin testing." };
        }
        if (trimmedEmail !== allowedEmail || password !== allowedPassword) {
          return { ok: false, message: "Invalid admin credentials." };
        }

        const nextSession: AdminSession = { email: trimmedEmail, mode: "local" };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
        return { ok: true };
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        void supabase?.auth.signOut();
        setSession(null);
      },
    }),
    [loading, session],
  );

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
