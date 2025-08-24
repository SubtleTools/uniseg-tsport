/**
 * Utility functions for Unicode text processing
 */

/**
 * Convert a string to an array of Unicode code points
 */
export function stringToRunes(str: string): number[] {
  const runes: number[] = [];
  for (const char of str) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      runes.push(codePoint);
    }
  }
  return runes;
}

/**
 * Convert an array of Unicode code points to a string
 */
export function runesToString(runes: number[]): string {
  return String.fromCodePoint(...runes);
}

/**
 * Get the display width of a character (0, 1, or 2)
 */
export function charWidth(codePoint: number): number {
  // This is a simplified implementation
  // The actual implementation would need full Unicode width tables

  // ASCII characters (except control chars) have width 1
  if (codePoint >= 0x20 && codePoint < 0x7f) {
    return 1;
  }

  // Control characters have width 0
  if (codePoint < 0x20 || (codePoint >= 0x7f && codePoint < 0xa0)) {
    return 0;
  }

  // CJK characters typically have width 2
  if (
    (codePoint >= 0x1100 && codePoint <= 0x115f) || // Hangul Jamo
    (codePoint >= 0x2e80 && codePoint <= 0x2eff) || // CJK Radicals
    (codePoint >= 0x2f00 && codePoint <= 0x2fdf) || // Kangxi Radicals
    (codePoint >= 0x3000 && codePoint <= 0x303e) || // CJK Symbols
    (codePoint >= 0x3040 && codePoint <= 0x309f) || // Hiragana
    (codePoint >= 0x30a0 && codePoint <= 0x30ff) || // Katakana
    (codePoint >= 0x3100 && codePoint <= 0x312f) || // Bopomofo
    (codePoint >= 0x3130 && codePoint <= 0x318f) || // Hangul Compatibility Jamo
    (codePoint >= 0x3190 && codePoint <= 0x319f) || // Kanbun
    (codePoint >= 0x31a0 && codePoint <= 0x31bf) || // Bopomofo Extended
    (codePoint >= 0x31c0 && codePoint <= 0x31ef) || // CJK Strokes
    (codePoint >= 0x31f0 && codePoint <= 0x31ff) || // Katakana Phonetic Extensions
    (codePoint >= 0x3200 && codePoint <= 0x32ff) || // Enclosed CJK Letters
    (codePoint >= 0x3300 && codePoint <= 0x33ff) || // CJK Compatibility
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) || // CJK Extension A
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) || // CJK Unified Ideographs
    (codePoint >= 0xa000 && codePoint <= 0xa48f) || // Yi Syllables
    (codePoint >= 0xa490 && codePoint <= 0xa4cf) || // Yi Radicals
    (codePoint >= 0xac00 && codePoint <= 0xd7af) // Hangul Syllables
  ) {
    return 2;
  }

  // Default to width 1
  return 1;
}

/**
 * Check if a code point is a combining mark
 */
export function isCombiningMark(codePoint: number): boolean {
  // Simplified implementation - would need full Unicode combining class tables
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) || // Combining Diacritical Marks
    (codePoint >= 0x1ab0 && codePoint <= 0x1aff) || // Combining Diacritical Marks Extended
    (codePoint >= 0x1dc0 && codePoint <= 0x1dff) || // Combining Diacritical Marks Supplement
    (codePoint >= 0x20d0 && codePoint <= 0x20ff) || // Combining Diacritical Marks for Symbols
    (codePoint >= 0xfe20 && codePoint <= 0xfe2f) // Combining Half Marks
  );
}

/**
 * Check if a code point is a line break character
 */
export function isLineBreak(codePoint: number): boolean {
  return codePoint === 0x0a || codePoint === 0x0d; // LF or CR
}

/**
 * Check if a code point is whitespace
 */
export function isWhitespace(codePoint: number): boolean {
  return (
    codePoint === 0x20 || // Space
    codePoint === 0x09 || // Tab
    codePoint === 0x0a || // LF
    codePoint === 0x0d || // CR
    codePoint === 0x0c || // FF
    codePoint === 0x0b || // VT
    (codePoint >= 0x2000 && codePoint <= 0x200a) || // Various spaces
    codePoint === 0x202f || // Narrow no-break space
    codePoint === 0x205f || // Medium mathematical space
    codePoint === 0x3000 // Ideographic space
  );
}
