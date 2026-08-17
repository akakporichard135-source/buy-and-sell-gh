import { KeyRound, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../admin/AdminAuth";
import { ADMIN_LOGIN_MAX_PASSWORD_LENGTH, passwordStrengthError } from "../../admin/adminSecurity";
import { Logo } from "../../components/Logo";

export function AdminResetPasswordPage() {
  const { loading, logout, session, updatePassword } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const strengthError = passwordStrengthError(password);
    if (strengthError) {
      setError(strengthError);
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await updatePassword(password);
    if (!result.ok) {
      setSubmitting(false);
      setError(result.message);
      return;
    }
    setPassword("");
    setConfirmation("");
    await logout();
    setSubmitting(false);
    setComplete(true);
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Logo />
        <div>
          <p className="eyebrow-dark">Password Recovery</p>
          <h1>Create a new password</h1>
          <p>Use a unique password that is not reused for email, social media, or other business systems.</p>
        </div>
        <div className="admin-warning"><ShieldCheck size={18} /><span>Use at least 12 characters with uppercase, lowercase, a number, and a symbol.</span></div>

        {complete ? (
          <div className="admin-security-summary">
            <ShieldCheck size={20} />
            <div><strong>Password updated</strong><span>All admin access still requires authenticator verification.</span></div>
            <Link className="btn-primary mt-4" to="/admin/login">Return to Login</Link>
          </div>
        ) : loading ? (
          <p className="admin-empty-copy" role="status">Validating recovery session...</p>
        ) : !session ? (
          <div className="admin-empty-state">
            <KeyRound size={22} />
            <strong>Open a valid recovery link</strong>
            <span>Request a fresh link from the admin login page if this one has expired.</span>
            <Link className="btn-secondary mt-3" to="/admin/login">Request Recovery Link</Link>
          </div>
        ) : session.assuranceLevel !== "aal2" ? (
          <div className="admin-empty-state">
            <ShieldCheck size={22} />
            <strong>Authenticator verification required</strong>
            <span>Complete MFA before changing the password for this admin account.</span>
            <Link className="btn-primary mt-3" to="/admin/mfa" state={{ from: "/admin/reset-password" }}>Verify Authenticator</Link>
          </div>
        ) : (
          <form className="admin-login-form" onSubmit={submit}>
            <label>New password
              <input type="password" required autoComplete="new-password" maxLength={ADMIN_LOGIN_MAX_PASSWORD_LENGTH} value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <label>Confirm new password
              <input type="password" required autoComplete="new-password" maxLength={ADMIN_LOGIN_MAX_PASSWORD_LENGTH} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            {error && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={submitting}>
              <KeyRound size={18} /> {submitting ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
