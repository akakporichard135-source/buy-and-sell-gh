import { LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { useAdminAuth, isSupabaseConfigured } from "../../admin/AdminAuth";

export function AdminLoginPage() {
  const { login, session } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  if (session) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Logo />
        <div>
          <p className="eyebrow-dark">Admin Login</p>
          <h1>Manage Buy & Sell GH</h1>
          <p>Temporary dashboard access is enabled because Supabase authentication is not configured yet.</p>
        </div>

        <div className="admin-warning">
          <ShieldCheck size={18} />
          <span>{isSupabaseConfigured() ? "Supabase credentials detected. Real auth can replace temporary access next." : "Supabase is not configured. Use any admin email and a password of 6+ characters for temporary local access."}</span>
        </div>

        <form className="admin-login-form" noValidate onSubmit={handleSubmit}>
          <label>Email
            <input aria-label="Admin email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" />
          </label>
          <label>Password
            <input aria-label="Admin password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6+ characters" />
          </label>
          {error && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            <LockKeyhole size={18} />
            {submitting ? "Opening dashboard..." : "Login to Admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
