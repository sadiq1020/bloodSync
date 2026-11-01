/**
 * Normalizes Eastern Arabic-Indic / Bengali numerals (০-৯) into standard ASCII digits (0-9).
 * E.g. "০১৭XXXXXXXX" becomes "017XXXXXXXX".
 */
const BANGLA_DIGITS_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export function normalizeDigits(input: string): string {
  if (!input) return "";
  return input.replace(/[০-৯]/g, (char) => BANGLA_DIGITS_MAP[char] ?? char);
}
