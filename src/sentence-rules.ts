/**
 * Unicode Sentence Boundary Rules Implementation
 * Based on Unicode Standard Annex #29, Sentence Boundaries
 * Ported from github.com/rivo/uniseg/sentencerules.go
 */

import {
  prAny,
  prATerm,
  prClose,
  prCR,
  prExtend,
  prFormat,
  prLF,
  prLower,
  prNumeric,
  prOLetter,
  prSContinue,
  prSep,
  prSp,
  prSTerm,
  prUpper,
} from './properties.js';
import { propertySentenceBreak } from './sentence-properties.js';

// Sentence break parser states
export const sbAny = 0;
export const sbCR = 1;
export const sbParaSep = 2;
export const sbATerm = 3;
export const sbUpper = 4;
export const sbLower = 5;
export const sbSB7 = 6;
export const sbSB8Close = 7;
export const sbSB8Sp = 8;
export const sbSTerm = 9;
export const sbSB8aClose = 10;
export const sbSB8aSp = 11;

/**
 * Sentence break transition result
 */
export interface SentenceBreakTransition {
  newState: number;
  sentenceBreak: boolean;
  rule: number;
}

/**
 * Sentence break transition rules based on Unicode Standard Annex #29
 * Unicode version 15.0.0
 */
export function sbTransitions(state: number, prop: number): SentenceBreakTransition {
  const combined = BigInt(state) | (BigInt(prop) << 32n);

  switch (combined) {
    // SB3
    case BigInt(sbAny) | (BigInt(prCR) << 32n):
      return { newState: sbCR, sentenceBreak: false, rule: 9990 };
    case BigInt(sbCR) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 30 };

    // SB4
    case BigInt(sbAny) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 9990 };
    case BigInt(sbAny) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 9990 };
    case BigInt(sbParaSep) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 40 };
    case BigInt(sbCR) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 40 };

    // SB6
    case BigInt(sbAny) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 9990 };
    case BigInt(sbATerm) | (BigInt(prNumeric) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 60 };
    case BigInt(sbSB7) | (BigInt(prNumeric) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 60 }; // Because ATerm also appears in SB7

    // SB7
    case BigInt(sbAny) | (BigInt(prUpper) << 32n):
      return { newState: sbUpper, sentenceBreak: false, rule: 9990 };
    case BigInt(sbAny) | (BigInt(prLower) << 32n):
      return { newState: sbLower, sentenceBreak: false, rule: 9990 };
    case BigInt(sbUpper) | (BigInt(prATerm) << 32n):
      return { newState: sbSB7, sentenceBreak: false, rule: 70 };
    case BigInt(sbLower) | (BigInt(prATerm) << 32n):
      return { newState: sbSB7, sentenceBreak: false, rule: 70 };
    case BigInt(sbSB7) | (BigInt(prUpper) << 32n):
      return { newState: sbUpper, sentenceBreak: false, rule: 70 };

    // SB8a
    case BigInt(sbAny) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 9990 };
    case BigInt(sbATerm) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbATerm) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbATerm) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB7) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB7) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB7) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8Close) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8Close) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8Close) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8Sp) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8Sp) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8Sp) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSTerm) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbSTerm) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSTerm) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8aClose) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8aClose) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8aClose) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8aSp) | (BigInt(prSContinue) << 32n):
      return { newState: sbAny, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8aSp) | (BigInt(prATerm) << 32n):
      return { newState: sbATerm, sentenceBreak: false, rule: 81 };
    case BigInt(sbSB8aSp) | (BigInt(prSTerm) << 32n):
      return { newState: sbSTerm, sentenceBreak: false, rule: 81 };

    // SB9
    case BigInt(sbATerm) | (BigInt(prClose) << 32n):
      return { newState: sbSB8Close, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB7) | (BigInt(prClose) << 32n):
      return { newState: sbSB8Close, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8Close) | (BigInt(prClose) << 32n):
      return { newState: sbSB8Close, sentenceBreak: false, rule: 90 };
    case BigInt(sbATerm) | (BigInt(prSp) << 32n):
      return { newState: sbSB8Sp, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB7) | (BigInt(prSp) << 32n):
      return { newState: sbSB8Sp, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8Close) | (BigInt(prSp) << 32n):
      return { newState: sbSB8Sp, sentenceBreak: false, rule: 90 };
    case BigInt(sbSTerm) | (BigInt(prClose) << 32n):
      return { newState: sbSB8aClose, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8aClose) | (BigInt(prClose) << 32n):
      return { newState: sbSB8aClose, sentenceBreak: false, rule: 90 };
    case BigInt(sbSTerm) | (BigInt(prSp) << 32n):
      return { newState: sbSB8aSp, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8aClose) | (BigInt(prSp) << 32n):
      return { newState: sbSB8aSp, sentenceBreak: false, rule: 90 };
    case BigInt(sbATerm) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbATerm) | (BigInt(prCR) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbATerm) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB7) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB7) | (BigInt(prCR) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB7) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8Close) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8Close) | (BigInt(prCR) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8Close) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSTerm) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSTerm) | (BigInt(prCR) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSTerm) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8aClose) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8aClose) | (BigInt(prCR) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };
    case BigInt(sbSB8aClose) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 90 };

    // SB10
    case BigInt(sbSB8Sp) | (BigInt(prSp) << 32n):
      return { newState: sbSB8Sp, sentenceBreak: false, rule: 100 };
    case BigInt(sbSB8aSp) | (BigInt(prSp) << 32n):
      return { newState: sbSB8aSp, sentenceBreak: false, rule: 100 };
    case BigInt(sbSB8Sp) | (BigInt(prSep) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 100 };
    case BigInt(sbSB8Sp) | (BigInt(prCR) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 100 };
    case BigInt(sbSB8Sp) | (BigInt(prLF) << 32n):
      return { newState: sbParaSep, sentenceBreak: false, rule: 100 };

    // SB11
    case BigInt(sbATerm) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    case BigInt(sbSB7) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    case BigInt(sbSB8Close) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    case BigInt(sbSB8Sp) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    case BigInt(sbSTerm) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    case BigInt(sbSB8aClose) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    case BigInt(sbSB8aSp) | (BigInt(prAny) << 32n):
      return { newState: sbAny, sentenceBreak: true, rule: 110 };
    // We'll always break after ParaSep due to SB4

    default:
      return { newState: -1, sentenceBreak: false, rule: -1 };
  }
}

/**
 * Decode a UTF-8 byte at the given position in a string
 */
function decodeRuneInString(str: string, pos: number): [number, number] {
  if (pos >= str.length) {
    return [0xfffd, 0]; // RuneError
  }

  const code = str.codePointAt(pos);
  if (code === undefined) {
    return [0xfffd, 1];
  }

  // Calculate byte length based on Unicode scalar value
  if (code <= 0x7f) return [code, 1];
  if (code <= 0x7ff) return [code, 2];
  if (code <= 0xffff) return [code, 3];
  return [code, 4];
}

/**
 * Transition sentence break state and determine boundaries
 * Determines the new state of the sentence break parser given the current state and the next code point
 */
export function transitionSentenceBreakState(
  state: number,
  r: number,
  str: string = '',
  pos: number = 0
): { newState: number; sentenceBreak: boolean } {
  // Determine the property of the next character
  let nextProperty = propertySentenceBreak(r);

  // SB5 (Replacing Ignore Rules)
  if (nextProperty === prExtend || nextProperty === prFormat) {
    if (state === sbParaSep || state === sbCR) {
      return { newState: sbAny, sentenceBreak: true }; // Make sure we don't apply SB5 to SB3 or SB4
    }
    if (state < 0) {
      return { newState: sbAny, sentenceBreak: true }; // SB1
    }
    return { newState: state, sentenceBreak: false };
  }

  // Find the applicable transition in the table
  let transition = sbTransitions(state, nextProperty);
  if (transition.newState < 0) {
    // No specific transition found. Try the less specific ones.
    const anyPropTransition = sbTransitions(state, prAny);
    const anyStateTransition = sbTransitions(sbAny, nextProperty);

    if (anyPropTransition.newState >= 0 && anyStateTransition.newState >= 0) {
      // Both apply. We'll use a mix (see comments for grTransitions).
      transition = {
        newState: anyStateTransition.newState,
        sentenceBreak: anyStateTransition.sentenceBreak,
        rule: anyStateTransition.rule,
      };
      if (anyPropTransition.rule < anyStateTransition.rule) {
        transition.sentenceBreak = anyPropTransition.sentenceBreak;
        transition.rule = anyPropTransition.rule;
      }
    } else if (anyPropTransition.newState >= 0) {
      // We only have a specific state.
      transition = anyPropTransition;
    } else if (anyStateTransition.newState >= 0) {
      // We only have a specific property.
      transition = anyStateTransition;
    } else {
      // No known transition. SB999: Any × Any.
      transition = { newState: sbAny, sentenceBreak: false, rule: 9990 };
    }
  }

  // SB8
  if (
    transition.rule > 80 &&
    (state === sbATerm || state === sbSB8Close || state === sbSB8Sp || state === sbSB7)
  ) {
    // Check the right side of the rule.
    let currentPos = pos;
    let currentRune = r;

    while (
      nextProperty !== prOLetter &&
      nextProperty !== prUpper &&
      nextProperty !== prLower &&
      nextProperty !== prSep &&
      nextProperty !== prCR &&
      nextProperty !== prLF &&
      nextProperty !== prATerm &&
      nextProperty !== prSTerm
    ) {
      // Move on to the next rune
      const [rune, length] = decodeRuneInString(str, currentPos);
      if (length === 0) {
        break;
      }
      currentRune = rune;
      currentPos += length;
      nextProperty = propertySentenceBreak(currentRune);
    }

    if (nextProperty === prLower) {
      return { newState: sbLower, sentenceBreak: false };
    }
  }

  return { newState: transition.newState, sentenceBreak: transition.sentenceBreak };
}
