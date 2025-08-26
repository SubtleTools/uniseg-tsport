/**
 * Main step function combining all boundary detection algorithms
 * Ported from github.com/rivo/uniseg step.go
 */

import { maskGraphemeState, transitionGraphemeState } from './grapheme-rules.js';
import {
  prExtendedPictographic,
  prL,
  propertyGraphemes,
  prRegionalIndicator,
  vs15,
  vs16,
} from './properties.js';
import { runeWidth } from './width.js';

// Bit masks for boundary information
export const MaskLine = 3;
export const MaskWord = 4;
export const MaskSentence = 8;

// Shift for width information
export const ShiftWidth = 4;

// Line break constants
export const LineDontBreak = 0;
export const LineCanBreak = 1;
export const LineMustBreak = 2;

// State shift constants
export const shiftWordState = 4;
export const shiftSentenceState = 9;
export const shiftLineState = 13;
export const shiftPropState = 21;

// State masks
export const maskWordState = 0x1f;
export const maskSentenceState = 0xf;
export const maskLineState = 0xff;

// Default states for when no specific algorithm is available
const wbAny = 0;
const sbAny = 0;
const lbAny = 0;

/**
 * Result of stepping through text
 */
export interface StepResult {
  segment: string;
  remainder: string;
  boundaries: number;
  newState: number;
}

/**
 * Decode first code point from string
 */
function decodeCodePoint(str: string): [number, number] {
  if (!str.length) return [0, 0];

  const codePoint = str.codePointAt(0);
  if (codePoint === undefined) return [0, 0];

  // Calculate byte length in UTF-16
  const length = codePoint > 0xffff ? 2 : 1;
  return [codePoint, length];
}

/**
 * Step through string to get next grapheme cluster with all boundary information
 * This is the main function combining grapheme, word, sentence, and line breaking
 */
export function stepString(str: string, state: number): StepResult {
  // Empty string returns nothing
  if (!str.length) {
    return {
      segment: '',
      remainder: '',
      boundaries: 0,
      newState: state,
    };
  }

  // Extract first code point
  const [codePoint, length] = decodeCodePoint(str);

  // If this is the only character, handle it specially
  if (str.length <= length) {
    let prop: number;
    if (state < 0) {
      prop = propertyGraphemes(codePoint);
    } else {
      prop = state >> shiftPropState;
    }

    // Final character gets mandatory breaks and width
    const width = runeWidth(codePoint, prop);
    const boundaries = LineMustBreak | (1 << 2) | (1 << 3) | (width << ShiftWidth); // word and sentence boundaries
    const newState =
      0 |
      (wbAny << shiftWordState) |
      (sbAny << shiftSentenceState) |
      (lbAny << shiftLineState) |
      (prop << shiftPropState);

    return {
      segment: str,
      remainder: '',
      boundaries,
      newState,
    };
  }

  // Initialize or extract states
  let graphemeState: number;
  let wordState: number;
  let sentenceState: number;
  let lineState: number;
  let firstProp: number;

  if (state < 0) {
    // Initial state - determine from first character
    const transition = transitionGraphemeState(state, codePoint);
    graphemeState = transition[0];
    firstProp = transition[1];
    wordState = wbAny; // Simplified - would use transitionWordBreakState
    sentenceState = sbAny; // Simplified - would use transitionSentenceBreakState
    lineState = lbAny; // Simplified - would use transitionLineBreakState
  } else {
    // Extract states from packed state
    graphemeState = state & maskGraphemeState;
    wordState = (state >> shiftWordState) & maskWordState;
    sentenceState = (state >> shiftSentenceState) & maskSentenceState;
    lineState = (state >> shiftLineState) & maskLineState;
    firstProp = state >> shiftPropState;
  }

  // Calculate initial width
  let width = runeWidth(codePoint, firstProp);
  let currentLength = length;

  // Transition until we find a grapheme boundary
  while (currentLength < str.length) {
    const [nextCodePoint, nextLength] = decodeCodePoint(str.slice(currentLength));

    // Transition states
    const [newGraphemeState, prop, graphemeBoundary] = transitionGraphemeState(
      graphemeState,
      nextCodePoint
    );

    // For now, assume word and sentence boundaries align with grapheme boundaries (simplified)
    const wordBoundary = graphemeBoundary;
    const sentenceBoundary = graphemeBoundary;
    const lineBreak = graphemeBoundary ? LineCanBreak : LineDontBreak;

    if (graphemeBoundary) {
      // Found a boundary - return result
      let boundary = lineBreak | (width << ShiftWidth);
      if (wordBoundary) {
        boundary |= 1 << 2; // shiftWord = 2
      }
      if (sentenceBoundary) {
        boundary |= 1 << 3; // shiftSentence = 3
      }

      const newState =
        newGraphemeState |
        (wordState << shiftWordState) |
        (sentenceState << shiftSentenceState) |
        (lineState << shiftLineState) |
        (prop << shiftPropState);

      return {
        segment: str.slice(0, currentLength),
        remainder: str.slice(currentLength),
        boundaries: boundary,
        newState,
      };
    }

    // Update width based on emoji presentation rules
    if (firstProp === prExtendedPictographic) {
      // For Extended Pictographic sequences, only variation selectors change the width
      if (nextCodePoint === vs15) {
        width = 1; // Text presentation
      } else if (nextCodePoint === vs16) {
        width = 2; // Emoji presentation
      }
      // Don't accumulate width for other characters (like skin tone modifiers)
    } else if (firstProp !== prRegionalIndicator && firstProp !== prL) {
      // Add width for this character (regional indicators and Hangul L don't accumulate)
      width += runeWidth(nextCodePoint, prop);
    }

    // Update states
    graphemeState = newGraphemeState;
    currentLength += nextLength;
  }

  // End of string - return everything with mandatory line break
  const boundaries = LineMustBreak | (1 << 2) | (1 << 3) | (width << ShiftWidth);
  const newState =
    0 | (wbAny << shiftWordState) | (sbAny << shiftSentenceState) | (lbAny << shiftLineState);

  return {
    segment: str,
    remainder: '',
    boundaries,
    newState,
  };
}

/**
 * Step through byte array (converts to string first)
 */
export function step(bytes: Uint8Array, state: number): StepResult {
  const str = new TextDecoder('utf-8').decode(bytes);
  return stepString(str, state);
}
