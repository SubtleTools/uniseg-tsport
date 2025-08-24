/**
 * Core Unicode text segmentation implementation
 * Port of github.com/rivo/uniseg
 */

import { transitionGraphemeState } from './grapheme-rules.js';
import { propertyGraphemes } from './properties.js';
import type {
  GraphemeCluster,
  GraphemeIterator,
  SegmentationResult,
  SegmentationState,
} from './types.js';
import { isLineBreak, isWhitespace, runesToString, stringToRunes } from './utils.js';
import { stringWidth as calculateStringWidth } from './width.js';

/**
 * Initial state for segmentation algorithms
 */
export const INITIAL_STATE: SegmentationState = -1;

/**
 * Count the number of grapheme clusters in a string
 */
export function graphemeClusterCount(str: string): number {
  if (!str) return 0;

  let count = 0;
  let state = INITIAL_STATE;
  let remaining = str;

  while (remaining.length > 0) {
    const result = firstGraphemeClusterInString(remaining, state);
    if (result.segment.length === 0) break;

    count++;
    remaining = result.remainder;
    state = result.newState;
  }

  return count;
}

/**
 * Calculate the display width of a string in a monospace font
 */
export function stringWidth(str: string): number {
  return calculateStringWidth(str);
}

/**
 * Reverse a string while preserving grapheme clusters
 */
export function reverseString(str: string): string {
  if (!str) return '';

  const clusters: string[] = [];
  let state = INITIAL_STATE;
  let remaining = str;

  // Extract all grapheme clusters
  while (remaining.length > 0) {
    const result = firstGraphemeClusterInString(remaining, state);
    if (result.segment.length === 0) break;

    clusters.push(result.segment);
    remaining = result.remainder;
    state = result.newState;
  }

  // Reverse the array and join
  return clusters.reverse().join('');
}

/**
 * Convert code point to UTF-16 string
 */
/**
 * Decode first code point from string
 */
function decodeCodePoint(str: string): [number, number] {
  if (!str.length) return [0, 0];

  const codePoint = str.codePointAt(0);
  if (codePoint === undefined) return [0, 0];

  // Calculate character length in UTF-16 units
  const length = codePoint > 0xffff ? 2 : 1;
  return [codePoint, length];
}

/**
 * Get the first grapheme cluster from a string
 */
export function firstGraphemeClusterInString(
  str: string,
  state: SegmentationState
): SegmentationResult {
  if (!str) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state,
    };
  }

  // Extract first code point
  const [codePoint, length] = decodeCodePoint(str);
  if (length === 0) {
    return {
      segment: '',
      remainder: str,
      segmentLength: 0,
      newState: state,
    };
  }

  // If this is the only character
  if (str.length <= length) {
    let prop: number;
    if (state < 0) {
      prop = propertyGraphemes(codePoint);
    } else {
      // Extract property from state (simplified)
      prop = 0;
    }

    return {
      segment: str,
      remainder: '',
      segmentLength: str.length,
      newState: 0 | (prop << 21), // shiftPropState = 21
    };
  }

  // Determine initial state and property
  let currentState: number;
  let firstProp: number;

  if (state < 0) {
    [currentState, firstProp] = transitionGraphemeState(state, codePoint);
  } else {
    // Extract from packed state (simplified)
    currentState = state & 0xf; // maskGraphemeState
    firstProp = state >> 21; // shiftPropState
  }

  let currentLength = length;

  // Find grapheme cluster boundary
  while (currentLength < str.length) {
    const [nextCodePoint, nextLength] = decodeCodePoint(str.slice(currentLength));
    const [newState, prop, boundary] = transitionGraphemeState(currentState, nextCodePoint);

    if (boundary) {
      // Found boundary
      return {
        segment: str.slice(0, currentLength),
        remainder: str.slice(currentLength),
        segmentLength: currentLength,
        newState: newState | (prop << 21),
      };
    }

    currentState = newState;
    currentLength += nextLength;
  }

  // End of string
  return {
    segment: str,
    remainder: '',
    segmentLength: str.length,
    newState: 0 | (firstProp << 21),
  };
}

/**
 * Get the first word from a string (basic Unicode word boundary implementation)
 */
export function firstWordInString(str: string, state: SegmentationState): SegmentationResult {
  if (!str) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state,
    };
  }

  const runes = stringToRunes(str);
  let endIndex = 0;

  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];

    if (rune === undefined) {
      break;
    }

    // Get the character category
    const isLetter = isAlphabetic(rune);
    const isDigit = isNumeric(rune);
    const isSpace = isWhitespace(rune);
    const isPunct = isPunctuation(rune);

    if (i === 0) {
      // First character determines the type of segment
      if (isSpace) {
        // Whitespace segment - continue until non-whitespace
        for (let j = i + 1; j < runes.length; j++) {
          const currentRune = runes[j];
          if (currentRune !== undefined && !isWhitespace(currentRune)) {
            endIndex = j;
            break;
          }
        }
        if (endIndex === 0) endIndex = runes.length; // All whitespace
      } else if (isPunct) {
        // Single punctuation character
        endIndex = i + 1;
      } else if (isLetter || isDigit) {
        // Check if this is a CJK character (treat individually)
        if (isCJK(rune)) {
          endIndex = i + 1;
        } else {
          // Letter/digit sequence for non-CJK
          for (let j = i + 1; j < runes.length; j++) {
            const nextRune = runes[j];
            if (nextRune === undefined) break;
            if (!isAlphabetic(nextRune) && !isNumeric(nextRune)) {
              endIndex = j;
              break;
            }
          }
          if (endIndex === 0) endIndex = runes.length; // Rest of string is letters/digits
        }
      } else {
        // Other character types (single character)
        endIndex = i + 1;
      }
      break;
    }
  }

  if (endIndex === 0) endIndex = runes.length;

  const segment = runesToString(runes.slice(0, endIndex));
  const remainder = str.slice(segment.length);

  return {
    segment,
    remainder,
    segmentLength: segment.length,
    newState: state,
  };
}

/**
 * Check if a rune is alphabetic (basic implementation)
 */
function isAlphabetic(rune: number): boolean {
  // ASCII letters
  if ((rune >= 0x41 && rune <= 0x5a) || (rune >= 0x61 && rune <= 0x7a)) {
    return true;
  }

  // Extended Latin
  if (rune >= 0xc0 && rune <= 0xff) {
    return true;
  }

  // CJK Unified Ideographs
  if (rune >= 0x4e00 && rune <= 0x9fff) {
    return true;
  }

  // Hiragana and Katakana
  if ((rune >= 0x3040 && rune <= 0x309f) || (rune >= 0x30a0 && rune <= 0x30ff)) {
    return true;
  }

  // More Unicode letter ranges could be added here
  return false;
}

/**
 * Check if a rune is numeric (basic implementation)
 */
function isNumeric(rune: number): boolean {
  // ASCII digits
  return rune >= 0x30 && rune <= 0x39;
}

/**
 * Check if a rune is punctuation (basic implementation)
 */
function isPunctuation(rune: number): boolean {
  // ASCII punctuation
  return (
    (rune >= 0x21 && rune <= 0x2f) ||
    (rune >= 0x3a && rune <= 0x40) ||
    (rune >= 0x5b && rune <= 0x60) ||
    (rune >= 0x7b && rune <= 0x7e)
  );
}

/**
 * Check if a rune is CJK (Chinese, Japanese, Korean)
 */
function isCJK(rune: number): boolean {
  // CJK Unified Ideographs
  if (rune >= 0x4e00 && rune <= 0x9fff) {
    return true;
  }

  // Hiragana and Katakana
  if ((rune >= 0x3040 && rune <= 0x309f) || (rune >= 0x30a0 && rune <= 0x30ff)) {
    return true;
  }

  return false;
}

/**
 * Get the first sentence from a string (improved implementation)
 */
export function firstSentenceInString(str: string, state: SegmentationState): SegmentationResult {
  if (!str) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state,
    };
  }

  const runes = stringToRunes(str);
  let endIndex = runes.length;

  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];

    if (rune === undefined) {
      break;
    }

    // Look for sentence terminators: . ! ?
    if (rune === 0x2e || rune === 0x21 || rune === 0x3f) {
      let potentialEnd = i + 1;

      // Handle multiple consecutive punctuation (... !? etc.)
      while (potentialEnd < runes.length) {
        const nextRune = runes[potentialEnd];
        if (nextRune === 0x2e || nextRune === 0x21 || nextRune === 0x3f) {
          potentialEnd++;
        } else {
          break;
        }
      }

      // Skip whitespace after punctuation
      while (potentialEnd < runes.length) {
        const nextRune = runes[potentialEnd];
        if (nextRune === undefined || !isWhitespace(nextRune)) {
          break;
        }
        potentialEnd++;
      }

      // Check if this is likely an abbreviation
      if (rune === 0x2e && !isLikelySentenceEnd(runes, i)) {
        continue; // Don't break here, keep looking
      }

      endIndex = potentialEnd;
      break;
    }
  }

  const segment = runesToString(runes.slice(0, endIndex));
  const remainder = str.slice(segment.length);

  return {
    segment,
    remainder,
    segmentLength: segment.length,
    newState: state,
  };
}

/**
 * Check if a period is likely a sentence end (not an abbreviation)
 */
function isLikelySentenceEnd(runes: readonly number[], dotIndex: number): boolean {
  // Look at context before the dot
  if (dotIndex === 0) return true;

  // Get the character before the dot
  const prevChar = runes[dotIndex - 1];
  if (!prevChar) return true;

  // If preceded by lowercase letter, likely a sentence end
  if (prevChar >= 0x61 && prevChar <= 0x7a) {
    // a-z
    return true;
  }

  // If preceded by uppercase letter, check for common abbreviations
  if (prevChar >= 0x41 && prevChar <= 0x5a) {
    // A-Z
    // Look at what comes after the dot
    if (dotIndex + 1 < runes.length) {
      const nextChar = runes[dotIndex + 1];
      if (nextChar && isWhitespace(nextChar)) {
        // Period followed by whitespace after uppercase - could be abbreviation
        // Check for common patterns
        // const beforeDot = String.fromCharCode(prevChar);

        // Single letter abbreviations are common (Mr. Dr. U.S.A.)
        if (dotIndex === 1 || (dotIndex >= 2 && runes[dotIndex - 2] === 0x2e)) {
          return false; // Likely abbreviation
        }
      }
    }
  }

  // If preceded by digit, likely decimal number
  if (prevChar >= 0x30 && prevChar <= 0x39) {
    // 0-9
    return false;
  }

  return true;
}

/**
 * Get the first line segment from a string (simplified implementation)
 */
export function firstLineSegmentInString(
  str: string,
  state: SegmentationState
): SegmentationResult {
  if (!str) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state,
    };
  }

  const runes = stringToRunes(str);
  let endIndex = runes.length;

  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];

    if (rune === undefined) {
      break;
    }

    if (isLineBreak(rune)) {
      endIndex = i + 1;
      break;
    }
  }

  const segment = runesToString(runes.slice(0, endIndex));
  const remainder = str.slice(segment.length);

  return {
    segment,
    remainder,
    segmentLength: segment.length,
    newState: state,
  };
}

/**
 * Step through a string to get the next segment with boundary information
 * This is a compatibility wrapper for the stepString function
 */
export function stepString(str: string, state: SegmentationState): SegmentationResult {
  const result = firstGraphemeClusterInString(str, state);
  return {
    segment: result.segment,
    remainder: result.remainder,
    segmentLength: result.segmentLength,
    newState: result.newState,
  };
}

/**
 * Create a new grapheme cluster iterator
 */
export function newGraphemes(str: string): GraphemeIterator {
  return new GraphemesImpl(str);
}

/**
 * Convert string to array of code points
 */
function stringToCodePoints(str: string): number[] {
  const codePoints: number[] = [];
  for (const char of str) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      codePoints.push(codePoint);
    }
  }
  return codePoints;
}

/**
 * Implementation of GraphemeIterator
 */
class GraphemesImpl implements GraphemeIterator {
  private str: string;
  private pos: number = 0;
  private state: SegmentationState = INITIAL_STATE;

  constructor(str: string) {
    this.str = str;
  }

  next(): GraphemeCluster | null {
    if (this.pos >= this.str.length) {
      return null;
    }

    const startPos = this.pos;
    const remaining = this.str.slice(this.pos);
    const result = firstGraphemeClusterInString(remaining, this.state);

    if (result.segment.length === 0) {
      return null;
    }

    this.pos += result.segmentLength;
    this.state = result.newState;

    return {
      cluster: result.segment,
      startPos,
      length: result.segmentLength,
      runes: stringToCodePoints(result.segment),
    };
  }

  hasNext(): boolean {
    return this.pos < this.str.length;
  }

  position(): number {
    return this.pos;
  }

  string(): string {
    return this.str;
  }

  runes(): number[] {
    if (this.pos >= this.str.length) {
      return [];
    }
    return stringToCodePoints(this.str.slice(this.pos));
  }
}
