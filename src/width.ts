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
 *
 * For now, we'll implement a simpler approach that handles the most common
 * cases correctly while avoiding circular dependencies. This will be improved
 * once we refactor the module structure.
 */
export function stringWidth(str: string): number {
  if (!str) return 0;

  let width = 0;
  let i = 0;

  while (i < str.length) {
    const codePoint = str.codePointAt(i);
    if (codePoint === undefined) break;

    const charLength = codePoint > 0xffff ? 2 : 1;

    // For complex sequences, we need to look ahead to handle them properly
    let clusterWidth: number;
    let skipNext = 0;

    // Handle regional indicators (flags) - they come in pairs
    if (propertyGraphemes(codePoint) === prRegionalIndicator) {
      // Look for second regional indicator
      const nextIndex = i + charLength;
      if (nextIndex < str.length) {
        const nextCodePoint = str.codePointAt(nextIndex);
        if (
          nextCodePoint !== undefined &&
          propertyGraphemes(nextCodePoint) === prRegionalIndicator
        ) {
          // This is a flag emoji - width 2 for the pair
          clusterWidth = 2;
          skipNext = nextCodePoint > 0xffff ? 2 : 1;
        } else {
          // Single regional indicator
          clusterWidth = runeWidth(codePoint);
        }
      } else {
        clusterWidth = runeWidth(codePoint);
      }
    }
    // Handle complex sequences (variation selectors, ZWJ sequences, etc.)
    else {
      let j = i + charLength;
      let foundZWJ = false;
      let hasModifiers = false;

      // Look ahead for variation selectors or ZWJ
      while (j < str.length) {
        const nextCP = str.codePointAt(j);
        if (nextCP === undefined) break;

        const nextLen = nextCP > 0xffff ? 2 : 1;

        if (nextCP === 0xfe0e || nextCP === 0xfe0f) {
          // Variation Selectors
          hasModifiers = true;
          j += nextLen;
        } else if (nextCP === 0x200d) {
          // ZWJ
          foundZWJ = true;
          hasModifiers = true;
          j += nextLen;
        } else if (foundZWJ) {
          // This is part of a ZWJ sequence, continue
          j += nextLen;
          foundZWJ = false; // Reset, looking for next ZWJ
        } else {
          break;
        }
      }

      if (hasModifiers) {
        // This is a complex emoji sequence
        clusterWidth = 2;
        skipNext = j - i - charLength;
      } else {
        clusterWidth = runeWidth(codePoint);
      }
    }

    width += clusterWidth;
    i += charLength + skipNext;
  }

  return width;
}
