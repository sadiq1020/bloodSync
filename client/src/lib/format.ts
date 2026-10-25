// Pure utility formatters using standard browser/Node Intl APIs (no external date libraries)

/**
 * Formats a blood group string for display using a typographic minus sign (U+2212)
 * instead of a standard ASCII hyphen-minus. Handles both shorthand ('O-', 'AB+')
 * and Prisma enum values ('O_NEGATIVE', 'A_POSITIVE').
 */
export function formatBloodGroup(group: string | null | undefined): string {
  if (!group) return "";

  let display = group;

  // Handle Prisma enum representations
  if (display === "A_POSITIVE") display = "A+";
  else if (display === "A_NEGATIVE") display = "A-";
  else if (display === "B_POSITIVE") display = "B+";
  else if (display === "B_NEGATIVE") display = "B-";
  else if (display === "AB_POSITIVE") display = "AB+";
  else if (display === "AB_NEGATIVE") display = "AB-";
  else if (display === "O_POSITIVE") display = "O+";
  else if (display === "O_NEGATIVE") display = "O-";

  // Replace ASCII '-' (U+002D) with mathematical minus '−' (U+2212)
  return display.replace(/-/g, "\u2212");
}

/**
 * Formats a relative timestamp (e.g. '2 hours ago', 'in 3 days') using Intl.RelativeTimeFormat.
 */
export function formatRelativeTime(
  dateInput: Date | string | number | null | undefined,
  locale: string = "en"
): string {
  if (!dateInput) return "";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const absSeconds = Math.abs(diffInSeconds);

  if (absSeconds < 60) {
    return rtf.format(diffInSeconds, "second");
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, "day");
  }

  const diffInWeeks = Math.round(diffInDays / 7);
  if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(diffInWeeks, "week");
  }

  const diffInMonths = Math.round(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, "month");
  }

  const diffInYears = Math.round(diffInDays / 365);
  return rtf.format(diffInYears, "year");
}

/**
 * Formats a calendar date using Intl.DateTimeFormat without external date libraries.
 */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "en-US"
): string {
  if (!dateInput) return "";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * Returns a stable short display code derived from a request ID (e.g. 'REQ-0142')
 * taking the last 4 alphanumeric characters uppercased.
 */
export function formatRequestCode(id: string | null | undefined): string {
  if (!id) return "REQ-0000";

  const alphanumericOnly = id.trim().replace(/[^a-zA-Z0-9]/g, "");
  const suffix = alphanumericOnly.slice(-4).toUpperCase().padStart(4, "0");

  return `REQ-${suffix}`;
}
