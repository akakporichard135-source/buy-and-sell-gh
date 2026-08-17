import { Clock3, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { useAdminAuth, isAdminLoginAvailable, isLocalAdminEnabled, isSupabaseConfigured } from "../../admin/AdminAuth";
import { ADMIN_LOGIN_MAX_PASSWORD_LENGTH, loginBackoffMs, safeAdminRedirect } from "../../admin/adminSecurity";

export function AdminLoginPage() {
  const { login, requestPasswordReset, session } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [retryAt, setRetryAt] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeAdminRedirect((location.state as { from?: string } | null)?.from);

  useEffect(() => {
    if (retryAt <= Date.now()) {
      setSecondsRemaining(0);
      return;
    }
    const update = () => setSecondsRemaining(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  if (session) {
    return <Navigate to={session.assuranceLevel === "aal2" ? from : "/admin/mfa"} replace state={{ from }} />;
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (secondsRemaining > 0) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      const nextAttempts = failedAttempts + 1;
      const delay = loginBackoffMs(nextAttempts);
      setFailedAttempts(nextAttempts);
      if (delay > 0) setRetryAt(Date.now() + delay);
      setError(result.message);
      return;
    }
    setFailedAttempts(0);
    navigate(from, { replace: true });
  };

  const handleRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await requestPasswordReset(email);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNotice("If an eligible admin account exists for that email, a secure recovery link has been sent.");
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Logo />
        <div>
          <p className="eyebrow-dark">{recoveryMode ? "Password Recovery" : "Admin Login"}</p>
          <h1>{recoveryMode ? "Reset admin access" : "Manage Buy & Sell GH"}</h1>
          <p>{recoveryMode ? "Request a single-use Supabase recovery link for an authorized account." : "Password sign-in and authenticator verification are both required before protected data can be accessed."}</p>
        </div>

        <div className="admin-warning">
          <ShieldCheck size={18} />
          <span>{getAdminAuthMessage()}</span>
        </div>

        <form className="admin-login-form" noValidate onSubmit={recoveryMode ? handleRecovery : handleLogin}>
          <label>Email
            <input aria-label="Admin email" type="email" required maxLength={254} autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" />
          </label>
          {!recoveryMode && (
            <label>Password
              <input aria-label="Admin password" type="password" required maxLength={ADMIN_LOGIN_MAX_PASSWORD_LENGTH} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
            </label>
          )}
          {error && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{error}</p>}
          {notice && <p className="admin-success" role="status">{notice}</p>}
          <button className="btn-primary w-full" type="submit" disabled={submitting || !isAdminLoginAvailable() || secondsRemaining > 0}>
            {recoveryMode ? <Mail size={18} /> : secondsRemaining > 0 ? <Clock3 size={18} /> : <LockKeyhole size={18} />}
            {submitting ? "Please wait..." : secondsRemaining > 0 ? `Try again in ${secondsRemaining}s` : recoveryMode ? "Send Recovery Link" : "Continue Securely"}
          </button>
          <button className="btn-ghost w-full" type="button" onClick={() => { setRecoveryMode((current) => !current); setError(""); setNotice(""); }}>
            <KeyRound size={17} /> {recoveryMode ? "Return to Login" : "Forgot Password"}
          </button>
        </form>
      </section>
    </main>
  );
}

function getAdminAuthMessage() {
  if (isLocalAdminEnabled()) return "Development-only local access is enabled. Production still requires Supabase Auth and MFA.";
  if (isSupabaseConfigured()) return "Supabase Auth is connected. Authorized accounts must complete TOTP verification at assurance level AAL2.";
  return "Production admin login is locked until Supabase Auth is configured.";
}
