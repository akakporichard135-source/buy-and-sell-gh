/**
 * Hostname classification and detection for Buy & Sell GH.
 * Separates the public storefront from the administration interface.
 */

export function isAdminHostname(hostname?: string): boolean {
  if (typeof window === "undefined" && !hostname) return false;
  const currentHost = (hostname || window.location.hostname).toLowerCase();

  // Explicit admin host override via environment variable (e.g. VITE_ADMIN_HOST="admin.buyandsellgh.com")
  const configuredAdminHost = (import.meta.env.VITE_ADMIN_HOST as string | undefined)?.toLowerCase();
  if (configuredAdminHost && currentHost === configuredAdminHost) {
    return true;
  }

  // Target production admin host
  if (currentHost === "admin.buyandsellgh.com") {
    return true;
  }

  // Local development admin host (RFC 6761: *.localhost automatically resolves to 127.0.0.1)
  if (currentHost === "admin.localhost") {
    return true;
  }

  // Support local test verification via ?admin_preview=1
  if (typeof window !== "undefined" && window.location.search.includes("admin_preview=1")) {
    return true;
  }

  // Any subdomain starting with admin. (e.g. admin.staging.example.com or Vercel preview subdomains)
  if (currentHost.startsWith("admin.")) {
    return true;
  }

  return false;
}

/**
 * Returns the public storefront origin URL.
 */
export function getPublicOrigin(): string {
  if (typeof window === "undefined") return "https://buyandsellgh.com";
  const { protocol, host, hostname, port } = window.location;
  if (isAdminHostname(hostname)) {
    if (hostname === "admin.localhost") {
      return `${protocol}//localhost${port ? `:${port}` : ""}`;
    }
    if (hostname.startsWith("admin.")) {
      const publicHost = host.replace(/^admin\./, "");
      return `${protocol}//${publicHost}`;
    }
    return "https://buyandsellgh.com";
  }
  return window.location.origin;
}

/**
 * Returns the administration portal origin URL.
 */
export function getAdminOrigin(): string {
  if (typeof window === "undefined") return "https://admin.buyandsellgh.com";
  const { protocol, host, hostname, port } = window.location;
  if (isAdminHostname(hostname)) {
    return window.location.origin;
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//admin.localhost${port ? `:${port}` : ""}`;
  }
  const configuredAdminHost = import.meta.env.VITE_ADMIN_HOST as string | undefined;
  if (configuredAdminHost) {
    return `${protocol}//${configuredAdminHost}`;
  }
  return "https://admin.buyandsellgh.com";
}
