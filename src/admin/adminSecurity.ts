export const ADMIN_LOGIN_MAX_PASSWORD_LENGTH = 1024;
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

export const normalizeTotpCode = (value: string) => value.replace(/\D/g, "").slice(0, 6);

export const isValidTotpCode = (value: string) => /^\d{6}$/.test(normalizeTotpCode(value));

export const passwordStrengthError = (password: string) => {
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) return `Use at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > ADMIN_LOGIN_MAX_PASSWORD_LENGTH) return "Password is too long.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/\d/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one symbol.";
  return "";
};

export const loginBackoffMs = (failedAttempts: number) => {
  if (failedAttempts < 3) return 0;
  return Math.min(60_000, 5_000 * 2 ** (failedAttempts - 3));
};

export const safeAdminRedirect = (candidate: unknown) => {
  if (typeof candidate !== "string") return "/admin";
  if (!candidate.startsWith("/admin") || candidate.startsWith("//")) return "/admin";
  if (["/admin/login", "/admin/mfa"].includes(candidate)) return "/admin";
  return candidate;
};
