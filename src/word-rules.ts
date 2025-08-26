/**
 * Unicode Word Boundary Rules Implementation
 * Based on Unicode Standard Annex #29, Word Boundaries
 * Ported from github.com/rivo/uniseg/wordrules.go
 */

import {
  prALetter,
  prAny,
  prCR,
  prDoubleQuote,
  prExtend,
  prExtendedPictographic,
  prExtendNumLet,
  prFormat,
  prHebrewLetter,
  prKatakana,
  prLF,
  prMidLetter,
  prMidNum,
  prMidNumLet,
  prNewline,
  prNumeric,
  prRegionalIndicator,
  prSingleQuote,
  prWSegSpace,
  prZWJ,
} from './properties.js';
import { propertyWordBreak } from './word-properties.js';

// Word break parser states
export const wbAny = 0;
export const wbCR = 1;
export const wbLF = 2;
export const wbNewline = 3;
export const wbWSegSpace = 4;
export const wbHebrewLetter = 5;
export const wbALetter = 6;
export const wbWB7 = 7;
export const wbWB7c = 8;
export const wbNumeric = 9;
export const wbWB11 = 10;
export const wbKatakana = 11;
export const wbExtendNumLet = 12;
export const wbOddRI = 13;
export const wbEvenRI = 14;
export const wbZWJBit = 16; // This bit is set for any states followed by at least one zero-width joiner

/**
 * Word break transition rules based on Unicode Standard Annex #29
 * Returns [newState, wordBreak, rule]
 */
export function wbTransitions(state: number, prop: number): [number, boolean, number] {
  // WB3b
  if (
    (state === wbAny && prop === prNewline) ||
    (state === wbAny && prop === prCR) ||
    (state === wbAny && prop === prLF)
  ) {
    const newState = prop === prNewline ? wbNewline : prop === prCR ? wbCR : wbLF;
    return [newState, true, 32];
  }

  // WB3a
  if (
    (state === wbNewline && prop === prAny) ||
    (state === wbCR && prop === prAny) ||
    (state === wbLF && prop === prAny)
  ) {
    return [wbAny, true, 31];
  }

  // WB3
  if (state === wbCR && prop === prLF) {
    return [wbLF, false, 30];
  }

  // WB3d
  if (state === wbAny && prop === prWSegSpace) {
    return [wbWSegSpace, true, 9990];
  }
  if (state === wbWSegSpace && prop === prWSegSpace) {
    return [wbWSegSpace, false, 34];
  }

  // WB5
  if ((state === wbAny && prop === prALetter) || (state === wbAny && prop === prHebrewLetter)) {
    const newState = prop === prALetter ? wbALetter : wbHebrewLetter;
    return [newState, true, 9990];
  }
  if (
    (state === wbALetter && prop === prALetter) ||
    (state === wbALetter && prop === prHebrewLetter) ||
    (state === wbHebrewLetter && prop === prALetter) ||
    (state === wbHebrewLetter && prop === prHebrewLetter)
  ) {
    const newState = prop === prALetter ? wbALetter : wbHebrewLetter;
    return [newState, false, 50];
  }

  // WB7
  if ((state === wbWB7 && prop === prALetter) || (state === wbWB7 && prop === prHebrewLetter)) {
    const newState = prop === prALetter ? wbALetter : wbHebrewLetter;
    return [newState, false, 70];
  }

  // WB7a
  if (state === wbHebrewLetter && prop === prSingleQuote) {
    return [wbAny, false, 71];
  }

  // WB7c
  if (state === wbWB7c && prop === prHebrewLetter) {
    return [wbHebrewLetter, false, 73];
  }

  // WB8
  if (state === wbAny && prop === prNumeric) {
    return [wbNumeric, true, 9990];
  }
  if (state === wbNumeric && prop === prNumeric) {
    return [wbNumeric, false, 80];
  }

  // WB9
  if (
    (state === wbALetter && prop === prNumeric) ||
    (state === wbHebrewLetter && prop === prNumeric)
  ) {
    return [wbNumeric, false, 90];
  }

  // WB10
  if (
    (state === wbNumeric && prop === prALetter) ||
    (state === wbNumeric && prop === prHebrewLetter)
  ) {
    const newState = prop === prALetter ? wbALetter : wbHebrewLetter;
    return [newState, false, 100];
  }

  // WB11
  if (state === wbWB11 && prop === prNumeric) {
    return [wbNumeric, false, 110];
  }

  // WB13
  if (state === wbAny && prop === prKatakana) {
    return [wbKatakana, true, 9990];
  }
  if (state === wbKatakana && prop === prKatakana) {
    return [wbKatakana, false, 130];
  }

  // WB13a
  if (
    (state === wbAny && prop === prExtendNumLet) ||
    (state === wbALetter && prop === prExtendNumLet) ||
    (state === wbHebrewLetter && prop === prExtendNumLet) ||
    (state === wbNumeric && prop === prExtendNumLet) ||
    (state === wbKatakana && prop === prExtendNumLet) ||
    (state === wbExtendNumLet && prop === prExtendNumLet)
  ) {
    return [wbExtendNumLet, state === wbAny, 131];
  }

  // WB13b
  if (
    (state === wbExtendNumLet && prop === prALetter) ||
    (state === wbExtendNumLet && prop === prHebrewLetter) ||
    (state === wbExtendNumLet && prop === prNumeric) ||
    (state === wbExtendNumLet && prop === prKatakana)
  ) {
    if (prop === prALetter) return [wbALetter, false, 132];
    if (prop === prHebrewLetter) return [wbHebrewLetter, false, 132];
    if (prop === prNumeric) return [wbNumeric, false, 132];
    if (prop === prKatakana) return [wbKatakana, false, 132];
  }

  // No matching rule found
  return [-1, false, -1];
}

/**
 * Transition word break state given current state and next code point
 * Returns [newState, wordBreak]
 */
export function transitionWordBreakState(
  state: number,
  r: number,
  _nextBytes: Uint8Array | null,
  nextStr: string
): [number, boolean] {
  // Determine the property of the next character
  const nextProperty = propertyWordBreak(r);

  // "Replacing Ignore Rules"
  if (nextProperty === prZWJ) {
    // WB4 (for zero-width joiners)
    if (state === wbNewline || state === wbCR || state === wbLF) {
      return [wbAny | wbZWJBit, true]; // Make sure we don't apply WB4 to WB3a
    }
    if (state < 0) {
      return [wbAny | wbZWJBit, false];
    }
    return [state | wbZWJBit, false];
  } else if (nextProperty === prExtend || nextProperty === prFormat) {
    // WB4 (for Extend and Format)
    if (state === wbNewline || state === wbCR || state === wbLF) {
      return [wbAny, true]; // Make sure we don't apply WB4 to WB3a
    }
    if (state === wbWSegSpace || state === (wbAny | wbZWJBit)) {
      return [wbAny, false]; // We don't break but this is also not WB3d or WB3c
    }
    if (state < 0) {
      return [wbAny, false];
    }
    return [state, false];
  } else if (nextProperty === prExtendedPictographic && state >= 0 && (state & wbZWJBit) !== 0) {
    // WB3c
    return [wbAny, false];
  }

  if (state >= 0) {
    state = state & ~wbZWJBit;
  }

  // Find the applicable transition in the table
  let [newState, wordBreak, rule] = wbTransitions(state, nextProperty);

  if (newState < 0) {
    // No specific transition found. Try the less specific ones
    const [anyPropState, anyPropWordBreak, anyPropRule] = wbTransitions(state, prAny);
    const [anyStateState, anyStateWordBreak, anyStateRule] = wbTransitions(wbAny, nextProperty);

    if (anyPropState >= 0 && anyStateState >= 0) {
      // Both apply. We'll use a mix
      [newState, wordBreak, rule] = [anyStateState, anyStateWordBreak, anyStateRule];
      if (anyPropRule < anyStateRule) {
        [wordBreak, rule] = [anyPropWordBreak, anyPropRule];
      }
    } else if (anyPropState >= 0) {
      // We only have a specific state
      [newState, wordBreak, rule] = [anyPropState, anyPropWordBreak, anyPropRule];
    } else if (anyStateState >= 0) {
      // We only have a specific property
      [newState, wordBreak, rule] = [anyStateState, anyStateWordBreak, anyStateRule];
    } else {
      // No known transition. WB999: Any ÷ Any
      [newState, wordBreak, rule] = [wbAny, true, 9990];
    }
  }

  // Handle rules that need lookahead (WB6, WB7b, WB12)
  let farProperty = -1;
  if (
    rule > 60 &&
    (state === wbALetter || state === wbHebrewLetter || state === wbNumeric) &&
    (nextProperty === prMidLetter ||
      nextProperty === prMidNumLet ||
      nextProperty === prSingleQuote ||
      nextProperty === prDoubleQuote ||
      nextProperty === prMidNum)
  ) {
    // Look ahead to find the property after skipping Format, Extend, and ZWJ
    const lookAheadStr = nextStr;
    let i = 0;

    while (i < lookAheadStr.length) {
      const cp = lookAheadStr.codePointAt(i);
      if (cp === undefined) break;

      const len = cp > 0xffff ? 2 : 1;
      const prop = propertyWordBreak(cp);

      if (prop === prExtend || prop === prFormat || prop === prZWJ) {
        i += len;
        continue;
      }

      farProperty = prop;
      break;
    }
  }

  // WB6
  if (
    rule > 60 &&
    (state === wbALetter || state === wbHebrewLetter) &&
    (nextProperty === prMidLetter ||
      nextProperty === prMidNumLet ||
      nextProperty === prSingleQuote) &&
    (farProperty === prALetter || farProperty === prHebrewLetter)
  ) {
    return [wbWB7, false];
  }

  // WB7b
  if (
    rule > 72 &&
    state === wbHebrewLetter &&
    nextProperty === prDoubleQuote &&
    farProperty === prHebrewLetter
  ) {
    return [wbWB7c, false];
  }

  // WB12
  if (
    rule > 120 &&
    state === wbNumeric &&
    (nextProperty === prMidNum || nextProperty === prMidNumLet || nextProperty === prSingleQuote) &&
    farProperty === prNumeric
  ) {
    return [wbWB11, false];
  }

  // WB15 and WB16 (Regional Indicators)
  if (newState === wbAny && nextProperty === prRegionalIndicator) {
    if (state !== wbOddRI && state !== wbEvenRI) {
      // Transition into the first RI
      return [wbOddRI, true];
    }
    if (state === wbOddRI) {
      // Don't break pairs of Regional Indicators
      return [wbEvenRI, false];
    }
    return [wbOddRI, true]; // We can break after a pair
  }

  return [newState, wordBreak];
}
