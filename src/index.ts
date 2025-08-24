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
  firstGraphemeClusterInString,
  firstLineSegmentInString,
  firstSentenceInString,
  firstWordInString,
  graphemeClusterCount,
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
  prControl,
  prCR,
  prExtend,
  prExtendedPictographic,
  prF,
  prH,
  prL,
  prLF,
  prLV,
  prLVT,
  // East Asian Width constants
  prN,
  prNa,
  propertyEastAsianWidth,
  propertyGraphemes,
  propertyLineBreak,
  prPrepend,
  prRegionalIndicator,
  prSpacingMark,
  prT,
  prV,
  prW,
  prZWJ,
  // Special code points
  vs15,
  vs16,
} from './properties.js';
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
  firstGraphemeClusterInString,
  graphemeClusterCount,
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
  firstGraphemeClusterInString,
  newGraphemes,

  // Step functions
  stepString,
  step,

  // Width functions
  runeWidth,
};
