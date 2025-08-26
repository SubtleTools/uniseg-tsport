/**
 * Character width calculation for monospace fonts
 * Ported from github.com/rivo/uniseg
 */

import {
  prA,
  prControl,
  prCR,
  prExtend,
  prExtendedPictographic,
  prF,
  prLF,
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
      // Extended Pictographic characters default to width 2 (emoji presentation)
      // They only get width 1 if they have text presentation (vs15)
      // Most emoji should be width 2 unless specifically modified
      return 2;
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
 * Uses proper grapheme clustering to handle complex sequences correctly
 */
export function stringWidth(str: string): number {
  if (!str) return 0;

  let totalWidth = 0;
  let remaining = str;
  let state = -1;

  // Import here to avoid circular dependency
  const { stepString, ShiftWidth } = require('./step.js');

  while (remaining.length > 0) {
    const stepResult = stepString(remaining, state);
    if (!stepResult.segment) break;

    // Extract width from boundaries (it's stored in upper bits)
    const width = stepResult.boundaries >> ShiftWidth;
    totalWidth += width;

    remaining = stepResult.remainder;
    state = stepResult.newState;
  }

  return totalWidth;
}
