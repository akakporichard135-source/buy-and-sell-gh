import {
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth, type TotpEnrollment } from "../../admin/AdminAuth";
import { assertAdminAal2 } from "../../admin/adminAuthorization";
import { isValidTotpCode, normalizeTotpCode } from "../../admin/adminSecurity";
import { supabase } from "../../lib/supabase";

export function AdminAccountPage() {
  const {
    session,
    updatePassword,
    requestPasswordReset,
    requestEmailChange,
    beginTotpEnrollment,
    cancelTotpEnrollment,
    verifyTotp,
    removeVerifiedTotpFactor,
  } = useAdminAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("buyandsellgh@yahoo.com");
  const [confirmEmail, setConfirmEmail] = useState("buyandsellgh@yahoo.com");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [authEmailStatus, setAuthEmailStatus] = useState<{ email: string; pendingEmail: string | null } | null>(null);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(false);
  const approvedEmailChangeAccount = session?.userId === "950ec818-3b39-4e28-a02c-01f0597b5455" &&
    session.email.toLowerCase() === "akakporichard135@gmail.com";

  // MFA Handover state (never stores or renders raw TOTP secrets)
  const [mfaEnrollment, setMfaEnrollment] = useState<TotpEnrollment | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaMessage, setMfaMessage] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [factorToRemoveId, setFactorToRemoveId] = useState<string | null>(null);
  const [removalVerifyCode, setRemovalVerifyCode] = useState("");

  const checkAuthEmailStatus = useCallback(async () => {
    if (!supabase || session?.mode !== "supabase" || session.assuranceLevel !== "aal2") return;
    setCheckingEmailStatus(true);
    try {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user?.email || data.user.id !== session.userId) {
        throw new Error("Could not verify the current Auth account. Sign in again.");
      }
      setAuthEmailStatus({ email: data.user.email, pendingEmail: data.user.new_email || null });
      setEmailError("");
    } catch (statusError) {
      setEmailError(statusError instanceof Error ? statusError.message : "Could not check email status.");
    } finally {
      setCheckingEmailStatus(false);
    }
  }, [session?.userId, session?.mode, session?.assuranceLevel]);

  useEffect(() => {
    setAuthEmailStatus(null);
    void checkAuthEmailStatus();
  }, [checkAuthEmailStatus]);

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
        await checkAuthEmailStatus();
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

  const handleStartNewMfaEnrollment = async () => {
    setMfaBusy(true);
    setMfaError("");
    setMfaMessage("");
    setFactorToRemoveId(null);
    setRemovalVerifyCode("");
    try {
      const enrollment = await beginTotpEnrollment("Buy & Sell GH Admin (Primary)");
      setMfaEnrollment(enrollment);
      setMfaCode("");
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : "Authenticator enrollment could not be started.");
    } finally {
      setMfaBusy(false);
    }
  };

  const handleCancelNewMfaEnrollment = async () => {
    if (!mfaEnrollment) return;
    setMfaBusy(true);
    setMfaError("");
    try {
      await cancelTotpEnrollment(mfaEnrollment.factorId);
      setMfaEnrollment(null);
      setMfaCode("");
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : "Authenticator enrollment could not be cancelled.");
    } finally {
      setMfaBusy(false);
    }
  };

  const handleVerifyNewMfaEnrollment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mfaEnrollment || !isValidTotpCode(mfaCode)) {
      setMfaError("Enter the 6-digit code generated by the new administrator's authenticator app.");
      return;
    }
    setMfaBusy(true);
    setMfaError("");
    setMfaMessage("");
    try {
      const result = await verifyTotp(mfaEnrollment.factorId, normalizeTotpCode(mfaCode));
      if (!result.ok) {
        setMfaError(result.message);
        return;
      }
      setMfaEnrollment(null);
      setMfaCode("");
      setMfaMessage(
        "New administrator authenticator verified and active. You may now remove the previous phone's authenticator factor below."
      );
    } finally {
      setMfaBusy(false);
    }
  };

  const handleRemoveOldMfaFactor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorToRemoveId || !session) return;
    const activeNewFactor = session.verifiedTotpFactors.find((f) => f.id !== factorToRemoveId);
    if (!activeNewFactor) {
      setMfaError("Enroll and verify the new administrator's authenticator before removing this factor.");
      return;
    }
    if (!isValidTotpCode(removalVerifyCode)) {
      setMfaError("Enter a current 6-digit code from the new administrator's authenticator to authorize removal.");
      return;
    }
    setMfaBusy(true);
    setMfaError("");
    setMfaMessage("");
    try {
      const result = await removeVerifiedTotpFactor(
        factorToRemoveId,
        activeNewFactor.id,
        normalizeTotpCode(removalVerifyCode)
      );
      if (!result.ok) {
        setMfaError(result.message);
        return;
      }
      setFactorToRemoveId(null);
      setRemovalVerifyCode("");
      setMfaMessage(
        `Previous authenticator removed. Only "${activeNewFactor.friendlyName}" remains authorized for MFA.`
      );
    } finally {
      setMfaBusy(false);
    }
  };

  const verifiedFactors = session?.verifiedTotpFactors ?? [];

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

      {/* Authenticator MFA & Handover Card */}
      <div className="admin-card space-y-4">
        <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Authenticator MFA &amp; Handover</h3>
          </div>
          <span className="admin-badge admin-badge-emerald">
            {verifiedFactors.length} Verified {verifiedFactors.length === 1 ? "Factor" : "Factors"}
          </span>
        </div>

        <p className="text-xs text-slate-600">
          To transfer MFA to the new administrator&apos;s phone safely: first enroll and verify the new
          authenticator below while keeping your current authenticator active. Once both are verified,
          remove the previous authenticator by confirming a live 6-digit code from the new phone.
        </p>

        {mfaMessage && (
          <div role="status" className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{mfaMessage}</span>
          </div>
        )}

        {mfaError && (
          <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={15} />
            <span>{mfaError}</span>
          </div>
        )}

        {/* Active Verified Factors List */}
        <div className="space-y-2">
          {verifiedFactors.map((factor, idx) => (
            <div
              key={factor.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{factor.friendlyName}</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-emerald-800">
                    Active · AAL2 Verified
                  </span>
                </div>
                <div className="text-[0.7rem] text-slate-500 mt-0.5">
                  Factor #{idx + 1} {factor.createdAt ? `· Enrolled ${new Date(factor.createdAt).toLocaleString()}` : ""}
                </div>
              </div>

              {verifiedFactors.length >= 2 && session?.role === "owner" && (
                <button
                  type="button"
                  disabled={mfaBusy}
                  onClick={() => {
                    setFactorToRemoveId(factor.id);
                    setRemovalVerifyCode("");
                    setMfaError("");
                  }}
                  className="admin-btn admin-btn-secondary text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
                >
                  <Trash2 size={13} />
                  <span>Remove This Authenticator</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Confirm Removal of Old Factor Modal/Panel */}
        {factorToRemoveId && verifiedFactors.length >= 2 && (
          <form
            onSubmit={handleRemoveOldMfaFactor}
            className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 text-xs"
          >
            <div className="font-bold text-slate-900">
              Confirm Removal of &ldquo;{verifiedFactors.find((f) => f.id === factorToRemoveId)?.friendlyName}&rdquo;
            </div>
            <p className="text-slate-600">
              Enter a current 6-digit code from the <strong>remaining (new administrator&apos;s)</strong> authenticator
              to verify it is working before permanently unenrolling this factor.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="font-semibold text-slate-700">
                New Authenticator 6-Digit Code
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={removalVerifyCode}
                  onChange={(e) => setRemovalVerifyCode(normalizeTotpCode(e.target.value))}
                  placeholder="000000"
                  className="mt-1 block w-40 rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono tracking-widest"
                />
              </label>
              <button
                type="submit"
                disabled={mfaBusy || !isValidTotpCode(removalVerifyCode)}
                className="admin-btn admin-btn-primary text-xs"
              >
                {mfaBusy ? "Verifying & Removing..." : "Verify New Code & Remove Old Factor"}
              </button>
              <button
                type="button"
                disabled={mfaBusy}
                onClick={() => {
                  setFactorToRemoveId(null);
                  setRemovalVerifyCode("");
                }}
                className="admin-btn admin-btn-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Enroll New Authenticator Flow */}
        {!mfaEnrollment ? (
          session?.mode === "supabase" &&
          session.assuranceLevel === "aal2" && (
            <div>
              <button
                type="button"
                disabled={mfaBusy}
                onClick={() => void handleStartNewMfaEnrollment()}
                className="admin-btn admin-btn-secondary text-xs"
              >
                <QrCode size={14} />
                <span>{mfaBusy ? "Preparing QR Code..." : "Enroll New Administrator Authenticator"}</span>
              </button>
            </div>
          )
        ) : (
          <form
            onSubmit={handleVerifyNewMfaEnrollment}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs"
          >
            <div className="font-bold text-slate-900">
              Scan QR Code with New Administrator&apos;s Authenticator ({mfaEnrollment.friendlyName})
            </div>
            <p className="text-slate-600">
              Have the new administrator scan this QR code in Google Authenticator, Microsoft Authenticator, or
              Authy, then enter the 6-digit code generated on their phone.
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 inline-block">
              <img
                src={mfaEnrollment.qrCode}
                alt="New administrator TOTP QR code"
                className="w-44 h-44 object-contain"
              />
            </div>
            <div className="flex flex-wrap items-end gap-3 pt-1">
              <label className="font-semibold text-slate-700">
                6-Digit Code from New Phone
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(normalizeTotpCode(e.target.value))}
                  placeholder="000000"
                  className="mt-1 block w-40 rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono tracking-widest"
                />
              </label>
              <button
                type="submit"
                disabled={mfaBusy || !isValidTotpCode(mfaCode)}
                className="admin-btn admin-btn-primary text-xs"
              >
                {mfaBusy ? "Verifying..." : "Verify & Activate New Authenticator"}
              </button>
              <button
                type="button"
                disabled={mfaBusy}
                onClick={() => void handleCancelNewMfaEnrollment()}
                className="admin-btn admin-btn-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="admin-card space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Mail size={18} className="text-[#d4af37]" />
          <h3 className="font-bold text-slate-900 text-sm">Change Login Email</h3>
        </div>
        <p className="text-xs text-slate-600">
          Current login: <strong>{session?.email || "N/A"}</strong>. Approved destination: <strong>buyandsellgh@yahoo.com</strong>. Supabase will request email verification before changing this account. Your user ID and authenticator enrollment stay with the same account.
        </p>
        {session?.mode === "supabase" && session.assuranceLevel === "aal2" && (
          <div className="space-y-2 border-y border-slate-100 py-3 text-xs text-slate-600">
            <p>Verified Supabase Auth email: <strong>{authEmailStatus?.email || "Checking..."}</strong></p>
            {authEmailStatus?.pendingEmail && <p>Pending new email: <strong>{authEmailStatus.pendingEmail}</strong>. Complete every confirmation email from Supabase before signing in with it.</p>}
            <button type="button" onClick={checkAuthEmailStatus} disabled={checkingEmailStatus} className="admin-btn admin-btn-secondary">
              <RefreshCw size={14} /> {checkingEmailStatus ? "Checking..." : "Check Verification Status"}
            </button>
          </div>
        )}
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
