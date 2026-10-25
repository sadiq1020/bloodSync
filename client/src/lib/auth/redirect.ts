/**
 * Validates and sanitizes a redirect target URL to prevent Open Redirect vulnerabilities.
 *
 * Open redirect attacks occur when an attacker crafts a malicious link like:
 * `/login?next=https://malicious-site.com` or `/login?next=//malicious-site.com`
 * which redirects unsuspecting users outside the application after authentication.
 *
 * This pure function enforces that target destinations must be internal relative paths
 * beginning with a single forward slash ('/'), not double slashes ('//'), not backslashes ('/\'),
 * and contains no protocol scheme indicators. Any invalid input safely falls back to '/requests'.
 */
export function getSafeRedirect(next: string | null | undefined): string {
  if (!next || typeof next !== "string") {
    return "/requests";
  }

  const trimmed = next.trim();

  // Must start with exactly one forward slash
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/requests";
  }

  // Prevent protocol-relative bypasses or embedded URL protocols (e.g., http:, javascript:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/requests";
  }

  return trimmed;
}
