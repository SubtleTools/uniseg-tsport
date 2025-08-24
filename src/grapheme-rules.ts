/**
 * Grapheme cluster boundary detection state machine
 * Based on Unicode Standard Annex #29, Grapheme Cluster Boundaries
 * Ported from github.com/rivo/uniseg
 */

import {
  prAny,
  prControl,
  prCR,
  prExtend,
  prExtendedPictographic,
  prL,
  prLF,
  prLV,
  prLVT,
  prPrepend,
  prRegionalIndicator,
  prSpacingMark,
  prT,
  prV,
  prZWJ,
} from './properties.js';

// Grapheme cluster parser states
export const grAny = 0;
export const grCR = 1;
export const grControlLF = 2;
export const grL = 3;
export const grLVV = 4;
export const grLVTT = 5;
export const grPrepend = 6;
export const grExtendedPictographic = 7;
export const grExtendedPictographicZWJ = 8;
export const grRIOdd = 9;
export const grRIEven = 10;

// Breaking instructions
export const grNoBoundary = 0;
export const grBoundary = 1;

// Shift constants for packing properties in state
export const shiftGraphemePropState = 4;

/**
 * State transition type: [state, property] -> [newState, boundary, rule]
 */
type TransitionKey = string;
type TransitionResult = [number, number, number]; // [newState, boundary, rule]

/**
 * Grapheme cluster state transitions
 * Maps state and property to new state, breaking instruction, and rule number
 */
const grTransitionsMap = new Map<TransitionKey, TransitionResult>([
  // GB5 - Break before controls
  [`${grAny},${prCR}`, [grCR, grBoundary, 50]],
  [`${grAny},${prLF}`, [grControlLF, grBoundary, 50]],
  [`${grAny},${prControl}`, [grControlLF, grBoundary, 50]],

  // GB4 - Break after controls
  [`${grCR},${prAny}`, [grAny, grBoundary, 40]],
  [`${grControlLF},${prAny}`, [grAny, grBoundary, 40]],

  // GB3 - Don't break CR x LF
  [`${grCR},${prLF}`, [grControlLF, grNoBoundary, 30]],

  // GB6 - Don't break Hangul L x (L|V|LV|LVT)
  [`${grAny},${prL}`, [grL, grBoundary, 9990]],
  [`${grL},${prL}`, [grL, grNoBoundary, 60]],
  [`${grL},${prV}`, [grLVV, grNoBoundary, 60]],
  [`${grL},${prLV}`, [grLVV, grNoBoundary, 60]],
  [`${grL},${prLVT}`, [grLVTT, grNoBoundary, 60]],

  // GB7 - Don't break Hangul (LV|V) x (V|T)
  [`${grAny},${prLV}`, [grLVV, grBoundary, 9990]],
  [`${grAny},${prV}`, [grLVV, grBoundary, 9990]],
  [`${grLVV},${prV}`, [grLVV, grNoBoundary, 70]],
  [`${grLVV},${prT}`, [grLVTT, grNoBoundary, 70]],

  // GB8 - Don't break Hangul (LVT|T) x T
  [`${grAny},${prLVT}`, [grLVTT, grBoundary, 9990]],
  [`${grAny},${prT}`, [grLVTT, grBoundary, 9990]],
  [`${grLVTT},${prT}`, [grLVTT, grNoBoundary, 80]],

  // GB9 - Don't break before Extend or ZWJ
  [`${grAny},${prExtend}`, [grAny, grNoBoundary, 90]],
  [`${grAny},${prZWJ}`, [grAny, grNoBoundary, 90]],

  // GB9a - Don't break before SpacingMark
  [`${grAny},${prSpacingMark}`, [grAny, grNoBoundary, 91]],

  // GB9b - Don't break after Prepend
  [`${grAny},${prPrepend}`, [grPrepend, grBoundary, 9990]],
  [`${grPrepend},${prAny}`, [grAny, grNoBoundary, 92]],

  // GB11 - Don't break within emoji modifier sequences or emoji ZWJ sequences
  [`${grAny},${prExtendedPictographic}`, [grExtendedPictographic, grBoundary, 9990]],
  [`${grExtendedPictographic},${prExtend}`, [grExtendedPictographic, grNoBoundary, 110]],
  [`${grExtendedPictographic},${prZWJ}`, [grExtendedPictographicZWJ, grNoBoundary, 110]],
  [
    `${grExtendedPictographicZWJ},${prExtendedPictographic}`,
    [grExtendedPictographic, grNoBoundary, 110],
  ],

  // GB12/GB13 - Don't break within emoji flag sequences
  [`${grAny},${prRegionalIndicator}`, [grRIOdd, grBoundary, 9990]],
  [`${grRIOdd},${prRegionalIndicator}`, [grRIEven, grNoBoundary, 120]],
  [`${grRIEven},${prRegionalIndicator}`, [grRIOdd, grBoundary, 120]],
]);

/**
 * Look up state transition
 */
function grTransitions(state: number, prop: number): [number, number, number] | null {
  const key = `${state},${prop}`;
  return grTransitionsMap.get(key) || null;
}

/**
 * Determine the new state of the grapheme cluster parser
 */
export function transitionGraphemeState(
  state: number,
  codePoint: number
): [number, number, boolean] {
  // Determine the property of the next character
  const prop = getGraphemeProperty(codePoint);

  // Find the applicable transition
  const nextTransition = grTransitions(state, prop);
  if (nextTransition) {
    const [newState, boundary, _rule] = nextTransition;
    return [newState, prop, boundary === grBoundary];
  }

  // Try less specific transitions
  const anyPropTransition = grTransitions(state, prAny);
  const anyStateTransition = grTransitions(grAny, prop);

  if (anyPropTransition && anyStateTransition) {
    // Both apply - use state from anyStateTransition, boundary from lower rule number
    const [, anyPropBoundary, anyPropRule] = anyPropTransition;
    const [anyStateState, anyStateBoundary, anyStateRule] = anyStateTransition;

    const newState = anyStateState;
    let boundary = anyStateBoundary === grBoundary;

    if (anyPropRule < anyStateRule) {
      boundary = anyPropBoundary === grBoundary;
    }

    return [newState, prop, boundary];
  }

  if (anyPropTransition) {
    // Only specific state transition
    const [newState, boundary, _rule] = anyPropTransition;
    return [newState, prop, boundary === grBoundary];
  }

  if (anyStateTransition) {
    // Only specific property transition
    const [newState, boundary, _rule] = anyStateTransition;
    return [newState, prop, boundary === grBoundary];
  }

  // GB999: Any ÷ Any - default boundary
  return [grAny, prop, true];
}

/**
 * Get grapheme property for a code point (inline implementation to avoid circular dependency)
 */
function getGraphemeProperty(codePoint: number): number {
  // Fast track ASCII printable characters
  if (codePoint >= 0x20 && codePoint <= 0x7e) {
    return prAny;
  }

  // Fast track common control characters
  if (codePoint === 0x0a) return prLF;
  if (codePoint === 0x0d) return prCR;
  if ((codePoint >= 0x00 && codePoint <= 0x1f) || codePoint === 0x7f) {
    return prControl;
  }

  // Zero width joiner
  if (codePoint === 0x200d) return prZWJ;

  // Variation selectors
  if (codePoint === 0xfe0e || codePoint === 0xfe0f) return prExtend;

  // Combining diacriticals
  if (codePoint >= 0x0300 && codePoint <= 0x036f) return prExtend;
  if (codePoint >= 0x0483 && codePoint <= 0x0489) return prExtend; // Cyrillic
  if (codePoint >= 0x0591 && codePoint <= 0x05bd) return prExtend; // Hebrew
  if (codePoint === 0x05bf) return prExtend;
  if (codePoint >= 0x05c1 && codePoint <= 0x05c2) return prExtend;
  if (codePoint >= 0x05c4 && codePoint <= 0x05c5) return prExtend;
  if (codePoint === 0x05c7) return prExtend;

  // Devanagari combining marks
  if (codePoint === 0x093c) return prExtend; // nukta
  if (codePoint === 0x094d) return prExtend; // virama
  if (codePoint >= 0x0941 && codePoint <= 0x0948) return prExtend; // vowel signs
  if (codePoint >= 0x0951 && codePoint <= 0x0957) return prExtend; // stress signs
  if (codePoint >= 0x0962 && codePoint <= 0x0963) return prExtend; // vocalic marks

  // Bengali combining marks
  if (codePoint === 0x09bc) return prExtend;
  if (codePoint === 0x09cd) return prExtend; // virama
  if (codePoint >= 0x09c1 && codePoint <= 0x09c4) return prExtend;
  if (codePoint === 0x09d7) return prExtend;
  if (codePoint >= 0x09e2 && codePoint <= 0x09e3) return prExtend;
  if (codePoint === 0x09fe) return prExtend;

  // Devanagari spacing marks
  if (codePoint === 0x0903) return prSpacingMark; // visarga
  if (codePoint === 0x093b) return prSpacingMark;
  if (codePoint >= 0x093e && codePoint <= 0x0940) return prSpacingMark;
  if (codePoint >= 0x0949 && codePoint <= 0x094c) return prSpacingMark;
  if (codePoint >= 0x094e && codePoint <= 0x094f) return prSpacingMark;

  // Hangul Jamo
  if (codePoint >= 0x1100 && codePoint <= 0x115f) return prL;
  if (codePoint >= 0x1160 && codePoint <= 0x11a7) return prV;
  if (codePoint >= 0x11a8 && codePoint <= 0x11ff) return prT;
  if (codePoint >= 0xa960 && codePoint <= 0xa97f) return prL; // Extended-A
  if (codePoint >= 0xd7b0 && codePoint <= 0xd7c6) return prV; // Extended-B
  if (codePoint >= 0xd7cb && codePoint <= 0xd7fb) return prT; // Extended-B

  // Hangul syllables - derive LV/LVT properties
  if (codePoint >= 0xac00 && codePoint <= 0xd7a3) {
    const syllableIndex = codePoint - 0xac00;
    const tIndex = syllableIndex % 28;
    if (tIndex === 0) {
      return prLV; // LV syllable
    } else {
      return prLVT; // LVT syllable
    }
  }

  // Regional indicators (flag emojis)
  if (codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff) return prRegionalIndicator;

  // Emoji modifiers
  if (codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) return prExtend;

  // Extended pictographic ranges
  if (codePoint >= 0x1f000 && codePoint <= 0x1f02f) return prExtendedPictographic; // Mahjong Tiles
  if (codePoint >= 0x1f030 && codePoint <= 0x1f09f) return prExtendedPictographic; // Domino Tiles
  if (codePoint >= 0x1f0a0 && codePoint <= 0x1f0ff) return prExtendedPictographic; // Playing Cards
  if (codePoint >= 0x1f100 && codePoint <= 0x1f1e5) return prExtendedPictographic; // Enclosed characters before regional indicators
  // Regional indicators are handled separately above
  // Continue after regional indicators range
  if (codePoint >= 0x1f200 && codePoint <= 0x1f2ff) return prExtendedPictographic; // Enclosed Ideographic Supplement
  if (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) return prExtendedPictographic; // Misc Symbols and Pictographs
  if (codePoint >= 0x1f600 && codePoint <= 0x1f64f) return prExtendedPictographic; // Emoticons
  if (codePoint >= 0x1f650 && codePoint <= 0x1f67f) return prExtendedPictographic; // Ornamental Dingbats
  if (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) return prExtendedPictographic; // Transport and Map Symbols
  if (codePoint >= 0x1f700 && codePoint <= 0x1f77f) return prExtendedPictographic; // Alchemical Symbols
  if (codePoint >= 0x1f780 && codePoint <= 0x1f7ff) return prExtendedPictographic; // Geometric Shapes Extended
  if (codePoint >= 0x1f800 && codePoint <= 0x1f8ff) return prExtendedPictographic; // Supplemental Arrows-C
  if (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) return prExtendedPictographic; // Supplemental Symbols and Pictographs
  if (codePoint >= 0x1fa00 && codePoint <= 0x1fa6f) return prExtendedPictographic; // Chess Symbols
  if (codePoint >= 0x1fa70 && codePoint <= 0x1faff) return prExtendedPictographic; // Symbols and Pictographs Extended-A

  // Common extended pictographic single code points
  if (codePoint === 0x00a9 || codePoint === 0x00ae) return prExtendedPictographic;
  if (codePoint === 0x203c || codePoint === 0x2049) return prExtendedPictographic;
  if (codePoint === 0x2122 || codePoint === 0x2139) return prExtendedPictographic;
  if (codePoint >= 0x2194 && codePoint <= 0x2199) return prExtendedPictographic;
  if (codePoint >= 0x21a9 && codePoint <= 0x21aa) return prExtendedPictographic;
  if (codePoint >= 0x231a && codePoint <= 0x231b) return prExtendedPictographic;
  if (codePoint === 0x2328) return prExtendedPictographic;
  if (codePoint === 0x23cf) return prExtendedPictographic;
  if (codePoint >= 0x23e9 && codePoint <= 0x23f3) return prExtendedPictographic;
  if (codePoint >= 0x23f8 && codePoint <= 0x23fa) return prExtendedPictographic;
  if (codePoint === 0x24c2) return prExtendedPictographic;
  if (codePoint >= 0x25aa && codePoint <= 0x25ab) return prExtendedPictographic;
  if (codePoint === 0x25b6 || codePoint === 0x25c0) return prExtendedPictographic;
  if (codePoint >= 0x25fb && codePoint <= 0x25fe) return prExtendedPictographic;
  if (codePoint >= 0x2600 && codePoint <= 0x2604) return prExtendedPictographic;
  if (codePoint === 0x260e || codePoint === 0x2611) return prExtendedPictographic;
  if (codePoint >= 0x2614 && codePoint <= 0x2615) return prExtendedPictographic;
  if (codePoint === 0x2618 || codePoint === 0x261d) return prExtendedPictographic;
  if (codePoint === 0x2620) return prExtendedPictographic;
  if (codePoint >= 0x2622 && codePoint <= 0x2623) return prExtendedPictographic;
  if (codePoint === 0x2626 || codePoint === 0x262a) return prExtendedPictographic;
  if (codePoint >= 0x262e && codePoint <= 0x262f) return prExtendedPictographic;
  if (codePoint >= 0x2638 && codePoint <= 0x263a) return prExtendedPictographic;
  if (codePoint === 0x2640 || codePoint === 0x2642) return prExtendedPictographic;
  if (codePoint >= 0x2648 && codePoint <= 0x2653) return prExtendedPictographic;
  if (codePoint >= 0x265f && codePoint <= 0x2660) return prExtendedPictographic;
  if (codePoint === 0x2663) return prExtendedPictographic;
  if (codePoint >= 0x2665 && codePoint <= 0x2666) return prExtendedPictographic;
  if (codePoint === 0x2668) return prExtendedPictographic;
  if (codePoint === 0x267b) return prExtendedPictographic;
  if (codePoint >= 0x267e && codePoint <= 0x267f) return prExtendedPictographic;
  if (codePoint >= 0x2692 && codePoint <= 0x2697) return prExtendedPictographic;
  if (codePoint === 0x2699) return prExtendedPictographic;
  if (codePoint >= 0x269b && codePoint <= 0x269c) return prExtendedPictographic;
  if (codePoint >= 0x26a0 && codePoint <= 0x26a1) return prExtendedPictographic;
  if (codePoint === 0x26a7) return prExtendedPictographic;
  if (codePoint >= 0x26aa && codePoint <= 0x26ab) return prExtendedPictographic;
  if (codePoint >= 0x26b0 && codePoint <= 0x26b1) return prExtendedPictographic;
  if (codePoint >= 0x26bd && codePoint <= 0x26be) return prExtendedPictographic;
  if (codePoint >= 0x26c4 && codePoint <= 0x26c5) return prExtendedPictographic;
  if (codePoint === 0x26c8) return prExtendedPictographic;
  if (codePoint >= 0x26ce && codePoint <= 0x26cf) return prExtendedPictographic;
  if (codePoint === 0x26d1) return prExtendedPictographic;
  if (codePoint >= 0x26d3 && codePoint <= 0x26d4) return prExtendedPictographic;
  if (codePoint >= 0x26e9 && codePoint <= 0x26ea) return prExtendedPictographic;
  if (codePoint >= 0x26f0 && codePoint <= 0x26f5) return prExtendedPictographic;
  if (codePoint >= 0x26f7 && codePoint <= 0x26fa) return prExtendedPictographic;
  if (codePoint === 0x26fd) return prExtendedPictographic;

  // Default to Any
  return prAny;
}

/**
 * Bit masks for extracting state information
 */
export const maskGraphemeState = 0xf;
