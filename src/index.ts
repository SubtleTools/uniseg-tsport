/**
 * TypeScript port of rivo/uniseg - Unicode Text Segmentation
 *
 * This library implements Unicode Text Segmentation conforming to Unicode Standard Annex #29
 * and provides functionality for:
 * - Grapheme cluster boundaries
 * - Word boundaries
 * - Sentence boundaries
 * - Line break opportunities
 * - String width calculation for monospace fonts
 *
 * @example
 * ```typescript
 * import { graphemeClusterCount, stringWidth } from '@tsports/uniseg';
 *
 * // Count grapheme clusters (user-perceived characters)
 * const count = graphemeClusterCount("🇩🇪🏳️‍🌈"); // Returns 2
 *
 * // Calculate display width for monospace fonts
 * const width = stringWidth("Hello 世界"); // Returns 9
 * ```
 */

// Export main API functions
export {
  firstGraphemeCluster,
  firstGraphemeClusterInString,
  firstLineSegment,
  firstLineSegmentInString,
  firstSentence,
  firstSentenceInString,
  firstWord,
  firstWordInString,
  graphemeClusterCount,
  hasTrailingLineBreak,
  hasTrailingLineBreakInString,
  INITIAL_STATE,
  newGraphemes,
  reverseString,
  stringWidth,
} from './core.js';
// Export grapheme rules
export {
  grAny,
  grBoundary,
  grControlLF,
  grCR,
  grExtendedPictographic,
  grExtendedPictographicZWJ,
  grL,
  grLVTT,
  grLVV,
  grNoBoundary,
  grPrepend,
  grRIEven,
  grRIOdd,
  maskGraphemeState,
  transitionGraphemeState,
} from './grapheme-rules.js';
export type {
  LineBreakRange,
  PropertyRange,
} from './properties.js';
// Export properties and constants
export {
  prA,
  // Property constants
  prAny,
  // Sentence break properties
  prATerm,
  prClose,
  prControl,
  prCR,
  prExtend,
  prExtendedPictographic,
  prF,
  prFormat,
  prH,
  prL,
  prLF,
  prLower,
  prLV,
  prLVT,
  // East Asian Width constants
  prN,
  prNa,
  prNumeric,
  prOLetter,
  propertyEastAsianWidth,
  propertyGraphemes,
  propertyLineBreak,
  prPrepend,
  prRegionalIndicator,
  prSContinue,
  prSep,
  prSp,
  prSpacingMark,
  prSTerm,
  prT,
  prUpper,
  prV,
  prW,
  prZWJ,
  // Special code points
  vs15,
  vs16,
} from './properties.js';
export type { SentenceBreakPropertyRange } from './sentence-properties.js';
// Export sentence break functionality
export { propertySentenceBreak } from './sentence-properties.js';
export {
  sbAny,
  sbATerm,
  sbCR,
  sbLower,
  sbParaSep,
  sbSB7,
  sbSB8aClose,
  sbSB8aSp,
  sbSB8Close,
  sbSB8Sp,
  sbSTerm,
  sbUpper,
  transitionSentenceBreakState,
} from './sentence-rules.js';
export type { StepResult } from './step.js';
// Export step functions
export {
  LineCanBreak,
  LineDontBreak,
  LineMustBreak,
  MaskLine,
  MaskSentence,
  MaskWord,
  ShiftWidth,
  step,
  stepString,
} from './step.js';
// Export types
export type {
  BoundaryType,
  GraphemeCluster,
  GraphemeIterator,
  GraphemeOptions,
  SegmentationResult,
  SegmentationState,
} from './types.js';
// Re-export utility functions (deprecated - will be removed)
export {
  charWidth,
  isCombiningMark,
  isLineBreak,
  isWhitespace,
  runesToString,
  stringToRunes,
} from './utils.js';
// Export width functions
export {
  eastAsianAmbiguousWidth,
  runeWidth,
  setEastAsianAmbiguousWidth,
  stringWidth as calculateStringWidth,
} from './width.js';

// Re-export for convenience
import {
  firstGraphemeCluster,
  firstGraphemeClusterInString,
  firstLineSegment,
  firstLineSegmentInString,
  firstSentence,
  firstSentenceInString,
  firstWord,
  firstWordInString,
  graphemeClusterCount,
  hasTrailingLineBreak,
  hasTrailingLineBreakInString,
  newGraphemes,
  reverseString,
  stringWidth,
} from './core.js';

import { step, stepString } from './step.js';
import { runeWidth } from './width.js';

// Default export for convenience
export default {
  // Main API functions
  graphemeClusterCount,
  stringWidth,
  reverseString,
  newGraphemes,

  // String functions
  firstGraphemeClusterInString,
  firstWordInString,
  firstSentenceInString,
  firstLineSegmentInString,
  hasTrailingLineBreakInString,

  // Byte array functions
  firstGraphemeCluster,
  firstWord,
  firstSentence,
  firstLineSegment,
  hasTrailingLineBreak,

  // Step functions
  stepString,
  step,

  // Width functions
  runeWidth,
};
