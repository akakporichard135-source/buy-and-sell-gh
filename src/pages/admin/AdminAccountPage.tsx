import {
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "../../admin/AdminAuth";

export function AdminAccountPage() {
  const { session, updatePassword, requestPasswordReset } = useAdminAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await updatePassword(newPassword);
      if (res.ok) {
        setMessage("Your admin password has been successfully updated.");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!session?.email) return;
    setResetSending(true);
    setMessage("");
    setError("");

    try {
      const res = await requestPasswordReset(session.email);
      if (res.ok) {
        setMessage(`A secure password recovery email has been sent to ${session.email}.`);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Security &amp; Profile
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Protected Administrator</span>
          </div>
          <h2>Admin Account &amp; Credentials</h2>
          <p>
            Review active multi-factor authentication status, session assurance, and manage secure
            account credentials.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Session Card */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Active Administrator Session</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Account Email</span>
              <span className="font-bold text-slate-900">{session?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Security Role</span>
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                {session?.role || "Administrator"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Assurance Level</span>
              <span className="admin-badge admin-badge-emerald">
                {session?.assuranceLevel === "aal2" ? "AAL2 (TOTP MFA Active)" : "AAL1"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Session Provider</span>
              <span className="font-semibold text-slate-700">Supabase Auth (PostgreSQL)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Account ID</span>
              <span className="font-mono text-slate-500 text-[0.7rem]">{session?.userId}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={resetSending}
              onClick={handleSendResetEmail}
              className="admin-btn admin-btn-secondary w-full text-xs"
            >
              <Mail size={14} />
              <span>{resetSending ? "Sending Link..." : "Email Password Recovery Link"}</span>
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Lock size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Change Admin Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">New Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Confirm New Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                placeholder="Repeat new password"
              />
            </div>

            <p className="text-[0.72rem] text-slate-500 leading-relaxed">
              Updating your password immediately syncs with Supabase Auth. Your AAL2 TOTP
              authenticator app will remain required at login.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary w-full text-xs mt-2"
            >
              <KeyRound size={14} />
              <span>{saving ? "Updating Password..." : "Save New Password"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
