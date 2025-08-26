/**
 * Core Unicode text segmentation implementation
 * Port of github.com/rivo/uniseg
 */

import { transitionGraphemeState } from './grapheme-rules.js';
import { propertyGraphemes } from './properties.js';
import { sbAny, transitionSentenceBreakState } from './sentence-rules.js';
import type {
  GraphemeCluster,
  GraphemeIterator,
  SegmentationResult,
  SegmentationState,
} from './types.js';
import { isLineBreak, runesToString, stringToRunes } from './utils.js';
import { stringWidth as calculateStringWidth } from './width.js';
import { transitionWordBreakState, wbAny } from './word-rules.js';

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
 * Get the first word from a string using Unicode word boundary rules
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

  // Extract the first rune
  const codePoint = str.codePointAt(0);
  if (codePoint === undefined) {
    return {
      segment: '',
      remainder: str,
      segmentLength: 0,
      newState: state,
    };
  }

  const length = codePoint > 0xffff ? 2 : 1;

  // If this is the only character
  if (str.length <= length) {
    return {
      segment: str,
      remainder: '',
      segmentLength: str.length,
      newState: wbAny,
    };
  }

  // If we don't know the state, determine it now
  if (state < 0) {
    [state] = transitionWordBreakState(state, codePoint, null, str.slice(length));
  }

  // Transition until we find a boundary
  let currentLength = length;
  let currentState = state;

  while (currentLength < str.length) {
    const nextCP = str.codePointAt(currentLength);
    if (nextCP === undefined) break;

    const nextLength = nextCP > 0xffff ? 2 : 1;
    const [newState, boundary] = transitionWordBreakState(
      currentState,
      nextCP,
      null,
      str.slice(currentLength + nextLength)
    );

    if (boundary) {
      return {
        segment: str.slice(0, currentLength),
        remainder: str.slice(currentLength),
        segmentLength: currentLength,
        newState: newState,
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
    newState: wbAny,
  };
}

/**
 * Get the first sentence from a string using Unicode Standard Annex #29 rules
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

  // Extract the first rune
  const codePoint = str.codePointAt(0);
  if (codePoint === undefined) {
    return {
      segment: '',
      remainder: str,
      segmentLength: 0,
      newState: state,
    };
  }

  const length = codePoint > 0xffff ? 2 : 1;

  // If this is the only character
  if (str.length <= length) {
    return {
      segment: str,
      remainder: '',
      segmentLength: str.length,
      newState: sbAny,
    };
  }

  // If we don't know the state, determine it now
  if (state < 0) {
    const transition = transitionSentenceBreakState(state, codePoint, str, length);
    state = transition.newState;
  }

  // Transition until we find a boundary
  let currentLength = length;
  let currentState = state;

  while (currentLength < str.length) {
    const nextCP = str.codePointAt(currentLength);
    if (nextCP === undefined) break;

    const nextLength = nextCP > 0xffff ? 2 : 1;
    const transition = transitionSentenceBreakState(
      currentState,
      nextCP,
      str,
      currentLength + nextLength
    );

    if (transition.sentenceBreak) {
      return {
        segment: str.slice(0, currentLength),
        remainder: str.slice(currentLength),
        segmentLength: currentLength,
        newState: transition.newState,
      };
    }

    currentState = transition.newState;
    currentLength += nextLength;
  }

  // End of string
  return {
    segment: str,
    remainder: '',
    segmentLength: str.length,
    newState: sbAny,
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
 * Get the first grapheme cluster from a byte array
 */
export function firstGraphemeCluster(
  bytes: Uint8Array,
  state: SegmentationState
): { cluster: Uint8Array; rest: Uint8Array; width: number; newState: SegmentationState } {
  if (!bytes.length) {
    return {
      cluster: new Uint8Array(0),
      rest: bytes,
      width: 0,
      newState: state,
    };
  }

  // Convert bytes to string for processing
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const str = decoder.decode(bytes);

  const result = firstGraphemeClusterInString(str, state);

  // Convert back to bytes
  const encoder = new TextEncoder();
  const clusterBytes = encoder.encode(result.segment);
  const restBytes = bytes.slice(clusterBytes.length);

  return {
    cluster: clusterBytes,
    rest: restBytes,
    width: stringWidth(result.segment),
    newState: result.newState,
  };
}

/**
 * Get the first word from a byte array
 */
export function firstWord(
  bytes: Uint8Array,
  state: SegmentationState
): { word: Uint8Array; rest: Uint8Array; newState: SegmentationState } {
  if (!bytes.length) {
    return {
      word: new Uint8Array(0),
      rest: bytes,
      newState: state,
    };
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  const str = decoder.decode(bytes);

  const result = firstWordInString(str, state);

  const encoder = new TextEncoder();
  const wordBytes = encoder.encode(result.segment);
  const restBytes = bytes.slice(wordBytes.length);

  return {
    word: wordBytes,
    rest: restBytes,
    newState: result.newState,
  };
}

/**
 * Get the first sentence from a byte array
 */
export function firstSentence(
  bytes: Uint8Array,
  state: SegmentationState
): { sentence: Uint8Array; rest: Uint8Array; newState: SegmentationState } {
  if (!bytes.length) {
    return {
      sentence: new Uint8Array(0),
      rest: bytes,
      newState: state,
    };
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  const str = decoder.decode(bytes);

  const result = firstSentenceInString(str, state);

  const encoder = new TextEncoder();
  const sentenceBytes = encoder.encode(result.segment);
  const restBytes = bytes.slice(sentenceBytes.length);

  return {
    sentence: sentenceBytes,
    rest: restBytes,
    newState: result.newState,
  };
}

/**
 * Get the first line segment from a byte array
 */
export function firstLineSegment(
  bytes: Uint8Array,
  state: SegmentationState
): { segment: Uint8Array; rest: Uint8Array; mustBreak: boolean; newState: SegmentationState } {
  if (!bytes.length) {
    return {
      segment: new Uint8Array(0),
      rest: bytes,
      mustBreak: false,
      newState: state,
    };
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  const str = decoder.decode(bytes);

  const result = firstLineSegmentInString(str, state);

  const encoder = new TextEncoder();
  const segmentBytes = encoder.encode(result.segment);
  const restBytes = bytes.slice(segmentBytes.length);

  return {
    segment: segmentBytes,
    rest: restBytes,
    mustBreak: isLineBreak(result.segment.codePointAt(result.segment.length - 1) || 0),
    newState: result.newState,
  };
}

/**
 * Check if a byte array has a trailing line break
 */
export function hasTrailingLineBreak(bytes: Uint8Array): boolean {
  if (!bytes.length) return false;

  const decoder = new TextDecoder('utf-8', { fatal: false });
  const str = decoder.decode(bytes);

  return hasTrailingLineBreakInString(str);
}

/**
 * Check if a string has a trailing line break
 */
export function hasTrailingLineBreakInString(str: string): boolean {
  if (!str.length) return false;

  const lastCodePoint = str.codePointAt(
    str.length - (str.charCodeAt(str.length - 1) > 0xffff ? 2 : 1)
  );
  return lastCodePoint !== undefined && isLineBreak(lastCodePoint);
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
