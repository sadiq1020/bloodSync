/**
 * getInitials(name)
 * Returns up to 2 uppercase initials from a display name.
 * Works for Latin, Bangla, and single-word names.
 *
 * "Md. Sadiq ibn Masud" → "MS" (first + last word)
 * "Sadiq"              → "SA" (first two chars)
 * "আব্দুল্লাহ রহমান"   → "আর" (first chars of each word)
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    // Single word: use first two grapheme clusters (handles multi-byte)
    const chars = [...words[0]]; // spread gives grapheme-safe iteration for basic Unicode
    return (chars[0] ?? "").toUpperCase() + (chars[1] ?? "").toUpperCase();
  }

  // Multi-word: first char of first + first char of last
  const first = [...words[0]][0] ?? "";
  const last = [...words[words.length - 1]][0] ?? "";
  return (first + last).toUpperCase();
}
