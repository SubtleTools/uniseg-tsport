/**
 * Character width calculation for monospace fonts
 * Ported from github.com/rivo/uniseg
 */

import {
  emojiPresentation,
  prA,
  prControl,
  prCR,
  prEmojiPresentation,
  prExtend,
  prExtendedPictographic,
  prF,
  prLF,
  property,
  propertyEastAsianWidth,
  propertyGraphemes,
  prRegionalIndicator,
  prW,
  prZWJ,
} from './properties.js';

/**
 * Width for East Asian Ambiguous characters (default: 1, some fonts: 2)
 */
export let eastAsianAmbiguousWidth = 1;

/**
 * Set the width for East Asian Ambiguous characters
 */
export function setEastAsianAmbiguousWidth(width: number): void {
  eastAsianAmbiguousWidth = width;
}

/**
 * Calculate the monospace width for a given code point
 *
 * Width rules (evaluated in order):
 * - Control, CR, LF, Extend, ZWJ: Width 0
 * - U+2E3A (TWO-EM DASH): Width 3
 * - U+2E3B (THREE-EM DASH): Width 4
 * - East Asian Fullwidth and Wide: Width 2
 * - East Asian Ambiguous: Width 1 (configurable)
 * - Regional Indicator: Width 2
 * - Extended Pictographic: Width 2 (unless text presentation)
 * - Everything else: Width 1
 */
export function runeWidth(codePoint: number, graphemeProperty?: number): number {
  // Use provided property or look it up
  const prop = graphemeProperty ?? propertyGraphemes(codePoint);

  // Zero width characters
  switch (prop) {
    case prControl:
    case prCR:
    case prLF:
    case prExtend:
    case prZWJ:
      return 0;
    case prRegionalIndicator:
      return 2;
    case prExtendedPictographic: {
      // Check if emoji has text presentation
      const emojiProp = property(emojiPresentation, codePoint);
      if (emojiProp === prEmojiPresentation) {
        return 2;
      }
      return 1;
    }
  }

  // Special wide dashes
  switch (codePoint) {
    case 0x2e3a: // TWO-EM DASH
      return 3;
    case 0x2e3b: // THREE-EM DASH
      return 4;
  }

  // East Asian Width
  const eaWidth = propertyEastAsianWidth(codePoint);
  switch (eaWidth) {
    case prW: // Wide
    case prF: // Fullwidth
      return 2;
    case prA: // Ambiguous
      return eastAsianAmbiguousWidth;
  }

  // Default width
  return 1;
}

/**
 * Calculate the total width of a string in monospace font
 */
export function stringWidth(str: string): number {
  if (!str) return 0;

  let width = 0;
  let remaining = str;

  // Simple implementation without full grapheme clustering for now
  // This avoids circular dependency while providing basic functionality
  while (remaining.length > 0) {
    const codePoint = remaining.codePointAt(0);
    if (codePoint === undefined) break;

    width += runeWidth(codePoint);

    // Move to next character
    const charLength = codePoint > 0xffff ? 2 : 1;
    remaining = remaining.slice(charLength);
  }

  return width;
}
