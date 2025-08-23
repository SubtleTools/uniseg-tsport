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
  if (codePoint >= 0x20 && codePoint < 0x7F) {
    return 1;
  }
  
  // Control characters have width 0
  if (codePoint < 0x20 || (codePoint >= 0x7F && codePoint < 0xA0)) {
    return 0;
  }
  
  // CJK characters typically have width 2
  if (
    (codePoint >= 0x1100 && codePoint <= 0x115F) ||  // Hangul Jamo
    (codePoint >= 0x2E80 && codePoint <= 0x2EFF) ||  // CJK Radicals
    (codePoint >= 0x2F00 && codePoint <= 0x2FDF) ||  // Kangxi Radicals
    (codePoint >= 0x3000 && codePoint <= 0x303E) ||  // CJK Symbols
    (codePoint >= 0x3040 && codePoint <= 0x309F) ||  // Hiragana
    (codePoint >= 0x30A0 && codePoint <= 0x30FF) ||  // Katakana
    (codePoint >= 0x3100 && codePoint <= 0x312F) ||  // Bopomofo
    (codePoint >= 0x3130 && codePoint <= 0x318F) ||  // Hangul Compatibility Jamo
    (codePoint >= 0x3190 && codePoint <= 0x319F) ||  // Kanbun
    (codePoint >= 0x31A0 && codePoint <= 0x31BF) ||  // Bopomofo Extended
    (codePoint >= 0x31C0 && codePoint <= 0x31EF) ||  // CJK Strokes
    (codePoint >= 0x31F0 && codePoint <= 0x31FF) ||  // Katakana Phonetic Extensions
    (codePoint >= 0x3200 && codePoint <= 0x32FF) ||  // Enclosed CJK Letters
    (codePoint >= 0x3300 && codePoint <= 0x33FF) ||  // CJK Compatibility
    (codePoint >= 0x3400 && codePoint <= 0x4DBF) ||  // CJK Extension A
    (codePoint >= 0x4E00 && codePoint <= 0x9FFF) ||  // CJK Unified Ideographs
    (codePoint >= 0xA000 && codePoint <= 0xA48F) ||  // Yi Syllables
    (codePoint >= 0xA490 && codePoint <= 0xA4CF) ||  // Yi Radicals
    (codePoint >= 0xAC00 && codePoint <= 0xD7AF)     // Hangul Syllables
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
    (codePoint >= 0x0300 && codePoint <= 0x036F) ||  // Combining Diacritical Marks
    (codePoint >= 0x1AB0 && codePoint <= 0x1AFF) ||  // Combining Diacritical Marks Extended
    (codePoint >= 0x1DC0 && codePoint <= 0x1DFF) ||  // Combining Diacritical Marks Supplement
    (codePoint >= 0x20D0 && codePoint <= 0x20FF) ||  // Combining Diacritical Marks for Symbols
    (codePoint >= 0xFE20 && codePoint <= 0xFE2F)     // Combining Half Marks
  );
}

/**
 * Check if a code point is a line break character
 */
export function isLineBreak(codePoint: number): boolean {
  return codePoint === 0x0A || codePoint === 0x0D; // LF or CR
}

/**
 * Check if a code point is whitespace
 */
export function isWhitespace(codePoint: number): boolean {
  return (
    codePoint === 0x20 ||   // Space
    codePoint === 0x09 ||   // Tab
    codePoint === 0x0A ||   // LF
    codePoint === 0x0D ||   // CR
    codePoint === 0x0C ||   // FF
    codePoint === 0x0B ||   // VT
    (codePoint >= 0x2000 && codePoint <= 0x200A) || // Various spaces
    codePoint === 0x202F || // Narrow no-break space
    codePoint === 0x205F || // Medium mathematical space
    codePoint === 0x3000    // Ideographic space
  );
}