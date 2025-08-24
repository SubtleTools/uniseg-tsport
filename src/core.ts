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
 * Get the first word from a string (simplified implementation)
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
  let inWord = false;

  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i];

    if (rune === undefined) {
      break;
    }

    if (isWhitespace(rune)) {
      if (inWord) {
        // End of word
        break;
      }
      // Skip leading whitespace
      endIndex = i + 1;
    } else {
      inWord = true;
      endIndex = i + 1;
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
 * Get the first sentence from a string (simplified implementation)
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

    // Simple sentence terminators
    if (rune === 0x2e || rune === 0x21 || rune === 0x3f) {
      // . ! ?
      endIndex = i + 1;

      // Include following whitespace
      while (endIndex < runes.length) {
        const nextRune = runes[endIndex];
        if (nextRune === undefined || !isWhitespace(nextRune)) {
          break;
        }
        endIndex++;
      }

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
