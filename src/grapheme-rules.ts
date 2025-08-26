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
  propertyGraphemes,
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
 * Get grapheme property for a code point - uses the proper property lookup
 */
function getGraphemeProperty(codePoint: number): number {
  return propertyGraphemes(codePoint);
}

/**
 * Bit masks for extracting state information
 */
export const maskGraphemeState = 0xf;
