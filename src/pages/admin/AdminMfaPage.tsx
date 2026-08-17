import { KeyRound, LockKeyhole, LogOut, QrCode, ShieldCheck } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth, type TotpEnrollment } from "../../admin/AdminAuth";
import { isValidTotpCode, normalizeTotpCode, safeAdminRedirect } from "../../admin/adminSecurity";
import { Logo } from "../../components/Logo";

export function AdminMfaPage() {
  const { beginTotpEnrollment, cancelTotpEnrollment, loading, logout, session, verifyTotp } = useAdminAuth();
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeAdminRedirect((location.state as { from?: string } | null)?.from);
  const manageMode = new URLSearchParams(location.search).get("manage") === "1";
  const verifiedFactor = useMemo(() => session?.verifiedTotpFactors[0] ?? null, [session]);

  if (loading) return <div className="admin-loading" role="status">Validating secure session...</div>;
  if (!session) return <Navigate to="/admin/login" replace state={{ from }} />;
  if (session.mode === "local") return <Navigate to={from} replace />;
  if (session.assuranceLevel === "aal2" && !manageMode && !enrollment) return <Navigate to={from} replace />;

  const startEnrollment = async () => {
    setSubmitting(true);
    setError("");
    try {
      setEnrollment(await beginTotpEnrollment());
      setCode("");
      setShowSecret(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Authenticator enrollment could not be started.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEnrollment = async () => {
    if (!enrollment) return;
    setSubmitting(true);
    setError("");
    try {
      await cancelTotpEnrollment(enrollment.factorId);
      setEnrollment(null);
      setCode("");
      setShowSecret(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Authenticator enrollment could not be cancelled.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const factorId = enrollment?.factorId ?? verifiedFactor?.id;
    if (!factorId || !isValidTotpCode(code)) {
      setError("Enter the current 6-digit code from your authenticator app.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await verifyTotp(factorId, normalizeTotpCode(code));
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setEnrollment(null);
    setCode("");
    navigate(from, { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const needsEnrollment = !verifiedFactor || Boolean(enrollment);

  return (
    <main className="admin-login-page">
      <section className="admin-login-card admin-mfa-card">
        <Logo />
        <div>
          <p className="eyebrow-dark">Admin Security</p>
          <h1>{needsEnrollment ? "Set up authenticator MFA" : "Verify your identity"}</h1>
          <p>{needsEnrollment ? "Add Buy & Sell GH to a compatible authenticator app, then enter the generated code." : "Enter the current code from your authenticator app to unlock protected admin data."}</p>
        </div>

        <div className="admin-warning"><ShieldCheck size={18} /><span>Admin access remains locked until Supabase confirms assurance level AAL2.</span></div>

        {!verifiedFactor && !enrollment && (
          <button className="btn-primary w-full" type="button" onClick={() => void startEnrollment()} disabled={submitting}>
            <QrCode size={18} /> {submitting ? "Starting setup..." : "Set Up Authenticator"}
          </button>
        )}

        {session.assuranceLevel === "aal2" && manageMode && verifiedFactor && !enrollment && (
          <div className="admin-security-summary">
            <ShieldCheck size={20} />
            <div><strong>MFA is active</strong><span>{verifiedFactor.friendlyName} is verified for this account.</span></div>
          </div>
        )}

        {session.assuranceLevel === "aal2" && manageMode && verifiedFactor && !enrollment && (
          <button className="btn-secondary w-full" type="button" onClick={() => void startEnrollment()} disabled={submitting}>
            <QrCode size={18} /> Add Another Authenticator
          </button>
        )}

        {enrollment && (
          <div className="admin-mfa-enrollment">
            <img className="admin-mfa-qr" src={enrollment.qrCode} alt="Authenticator enrollment QR code" />
            <p>Scan this QR code with Google Authenticator, Microsoft Authenticator, Authy, or another compatible TOTP app.</p>
            <button className="btn-ghost w-full" type="button" onClick={() => setShowSecret((current) => !current)}>
              <KeyRound size={17} /> {showSecret ? "Hide Manual Setup Key" : "Show Manual Setup Key"}
            </button>
            {showSecret && <code className="admin-mfa-secret">{enrollment.secret}</code>}
          </div>
        )}

        {(verifiedFactor || enrollment) && (
          <form className="admin-login-form" onSubmit={submitCode}>
            <label>Authenticator code
              <input aria-label="Authenticator code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(normalizeTotpCode(event.target.value))} placeholder="000000" />
            </label>
            {error && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={submitting || !isValidTotpCode(code)}>
              <LockKeyhole size={18} /> {submitting ? "Verifying..." : "Verify and Continue"}
            </button>
          </form>
        )}

        {error && !verifiedFactor && !enrollment && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{error}</p>}

        <div className="admin-security-actions">
          {enrollment && <button className="btn-ghost" type="button" onClick={() => void cancelEnrollment()} disabled={submitting}>Cancel Setup</button>}
          {session.assuranceLevel === "aal2" && manageMode && !enrollment && <button className="btn-ghost" type="button" onClick={() => navigate("/admin/account", { replace: true })}>Back to Account</button>}
          <button className="btn-ghost" type="button" onClick={() => void handleLogout()}><LogOut size={17} /> Sign Out</button>
        </div>
      </section>
    </main>
  );
}
