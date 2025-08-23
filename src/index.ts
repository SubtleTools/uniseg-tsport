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
 * import { graphemeClusterCount, stringWidth } from '@subtletools/uniseg-ts';
 * 
 * // Count grapheme clusters (user-perceived characters)
 * const count = graphemeClusterCount("🇩🇪🏳️‍🌈"); // Returns 2
 * 
 * // Calculate display width for monospace fonts
 * const width = stringWidth("Hello 世界"); // Returns 9
 * ```
 */

// Re-export all core functionality
export {
  graphemeClusterCount,
  stringWidth,
  reverseString,
  stepString,
  firstGraphemeClusterInString,
  firstWordInString,
  firstSentenceInString,
  firstLineSegmentInString,
  newGraphemes,
  INITIAL_STATE
} from './core.js';

// Re-export all types
export type {
  BoundaryType,
  SegmentationState,
  SegmentationResult,
  GraphemeOptions,
  GraphemeCluster,
  GraphemeIterator
} from './types.js';

// Re-export utility functions
export {
  stringToRunes,
  runesToString,
  charWidth,
  isCombiningMark,
  isLineBreak,
  isWhitespace
} from './utils.js';