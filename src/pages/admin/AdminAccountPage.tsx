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
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../admin/AdminAuth";
import { assertAdminAal2 } from "../../admin/adminAuthorization";
import { supabase } from "../../lib/supabase";

export function AdminAccountPage() {
  const { session, updatePassword, requestPasswordReset, requestEmailChange } = useAdminAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [syncingProfile, setSyncingProfile] = useState(false);
  const approvedEmailChangeAccount = session?.userId === "950ec818-3b39-4e28-a02c-01f0597b5455" &&
    session.email.toLowerCase() === "akakporichard135@gmail.com";

  useEffect(() => {
    setProfileEmail(null);
    if (!supabase || session?.mode !== "supabase" || session.assuranceLevel !== "aal2") return;
    let active = true;
    supabase.from("admin_profiles").select("email").eq("user_id", session.userId).maybeSingle()
      .then(({ data, error }) => {
        if (active && !error) setProfileEmail(data?.email ?? null);
      });
    return () => { active = false; };
  }, [session?.userId, session?.mode, session?.assuranceLevel, session?.email]);

  const handleRequestEmailChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError("");
    setEmailMessage("");
    if (newEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setEmailError("Email addresses do not match.");
      return;
    }
    setEmailSending(true);
    try {
      const result = await requestEmailChange(newEmail);
      if (!result.ok) {
        setEmailError(result.message);
      } else {
        setEmailMessage("Verification requested. Your login email has not changed yet. Confirm the message sent to the new inbox, and the current inbox if Supabase requests it. Then sign in again with MFA.");
        setNewEmail("");
        setConfirmEmail("");
      }
    } catch {
      setEmailError("Could not request an email change. Try again later.");
    } finally {
      setEmailSending(false);
    }
  };

  const syncVerifiedProfileEmail = async () => {
    if (!supabase || !session || session.mode !== "supabase") return;
    setSyncingProfile(true);
    setEmailError("");
    try {
      await assertAdminAal2("owner");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.email || userData.user.id !== session.userId ||
          userData.user.email !== session.email) {
        throw new Error("The verified Auth email could not be confirmed. Sign in again.");
      }
      const { data, error: updateError } = await supabase.from("admin_profiles")
        .update({ email: userData.user.email })
        .eq("user_id", userData.user.id)
        .select("email")
        .single();
      if (updateError || !data) throw new Error("Could not synchronize the admin profile email.");
      setProfileEmail(data.email);
      setEmailMessage("Verified admin profile email synchronized.");
    } catch (syncError) {
      setEmailError(syncError instanceof Error ? syncError.message : "Could not synchronize the admin profile email.");
    } finally {
      setSyncingProfile(false);
    }
  };

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

      <div className="admin-card space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Mail size={18} className="text-[#d4af37]" />
          <h3 className="font-bold text-slate-900 text-sm">Change Login Email</h3>
        </div>
        <p className="text-xs text-slate-600">
          Current login: <strong>{session?.email || "N/A"}</strong>. Approved destination: <strong>buyandsellgh@yahoo.com</strong>. Supabase will request email verification before changing this account. Your user ID and authenticator enrollment stay with the same account.
        </p>
        <form onSubmit={handleRequestEmailChange} className="grid gap-3 text-xs sm:grid-cols-2">
          <label className="font-semibold text-slate-700">New email
            <input required type="email" maxLength={254} autoComplete="off" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" />
          </label>
          <label className="font-semibold text-slate-700">Confirm new email
            <input required type="email" maxLength={254} autoComplete="off" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" />
          </label>
          <button type="submit" disabled={emailSending || !approvedEmailChangeAccount || session?.mode !== "supabase" || session.assuranceLevel !== "aal2"} className="admin-btn admin-btn-primary w-full justify-center sm:w-fit">
            <Mail size={14} /> {emailSending ? "Requesting..." : "Send Verification Emails"}
          </button>
        </form>
        {emailMessage && <p role="status" className="text-xs text-emerald-700">{emailMessage}</p>}
        {emailError && <p role="alert" className="text-xs text-rose-700">{emailError}</p>}
        {profileEmail && session?.email && profileEmail.toLowerCase() !== session.email.toLowerCase() && (
          <div className="border-t border-slate-100 pt-3 text-xs text-slate-600">
            <p>The admin profile still records a different email. Synchronize it only after the verified new email appears above.</p>
            {session.role === "owner" && (
              <button type="button" onClick={syncVerifiedProfileEmail} disabled={syncingProfile} className="admin-btn admin-btn-secondary mt-2">
                <RefreshCw size={14} /> {syncingProfile ? "Synchronizing..." : "Sync Verified Profile Email"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
