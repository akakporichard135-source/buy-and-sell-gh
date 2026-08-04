import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AdminSession {
  email: string;
  mode: "temporary";
}

interface AdminAuthValue {
  session: AdminSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
}

const STORAGE_KEY = "buyandsell-gh-temp-admin-session";
const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSession(JSON.parse(saved) as AdminSession);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      session,
      loading,
      login: async (email, password) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail.includes("@")) {
          return { ok: false, message: "Enter an admin email address." };
        }
        if (password.trim().length < 6) {
          return { ok: false, message: "Enter at least 6 characters for temporary access." };
        }

        const nextSession: AdminSession = { email: trimmedEmail, mode: "temporary" };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
        return { ok: true };
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
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

export const isSupabaseConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
