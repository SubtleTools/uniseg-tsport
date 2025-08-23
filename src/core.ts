/**
 * Core Unicode text segmentation implementation
 * Port of github.com/rivo/uniseg
 */

import type { SegmentationResult, SegmentationState, GraphemeCluster, GraphemeIterator } from './types.js';
import { stringToRunes, runesToString, charWidth, isCombiningMark, isLineBreak, isWhitespace } from './utils.js';

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
    const result = stepString(remaining, state);
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
  if (!str) return 0;
  
  let width = 0;
  const runes = stringToRunes(str);
  
  for (const rune of runes) {
    // Skip combining marks - they don't add width
    if (!isCombiningMark(rune)) {
      width += charWidth(rune);
    }
  }
  
  return width;
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
    const result = stepString(remaining, state);
    if (result.segment.length === 0) break;
    
    clusters.push(result.segment);
    remaining = result.remainder;
    state = result.newState;
  }
  
  // Reverse the array and join
  return clusters.reverse().join('');
}

/**
 * Step through a string to get the next grapheme cluster
 */
export function stepString(str: string, state: SegmentationState): SegmentationResult {
  if (!str) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state
    };
  }
  
  const runes = stringToRunes(str);
  if (runes.length === 0) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state
    };
  }
  
  // Find the end of the first grapheme cluster
  let endIndex = 1;
  
  // Basic grapheme cluster boundary detection
  // This is a simplified implementation - full implementation would need
  // complete Unicode grapheme cluster boundary rules
  for (let i = 1; i < runes.length; i++) {
    const currentRune = runes[i];
    const prevRune = runes[i - 1];
    
    if (currentRune === undefined || prevRune === undefined) {
      break;
    }
    
    // Don't break on combining marks
    if (isCombiningMark(currentRune)) {
      endIndex = i + 1;
      continue;
    }
    
    // Handle emoji sequences (simplified)
    if (isEmojiModifier(currentRune) || isEmojiJoiner(currentRune)) {
      endIndex = i + 1;
      continue;
    }
    
    // Handle regional indicator pairs (flag emojis)
    if (isRegionalIndicator(prevRune) && isRegionalIndicator(currentRune)) {
      endIndex = i + 1;
      break;
    }
    
    // Break here
    break;
  }
  
  const clusterRunes = runes.slice(0, endIndex);
  const segment = runesToString(clusterRunes);
  const remainder = str.slice(segment.length);
  
  return {
    segment,
    remainder,
    segmentLength: segment.length,
    newState: state
  };
}

/**
 * Get the first grapheme cluster from a string
 */
export function firstGraphemeClusterInString(str: string, state: SegmentationState): SegmentationResult {
  return stepString(str, state);
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
      newState: state
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
    newState: state
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
      newState: state
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
    if (rune === 0x2E || rune === 0x21 || rune === 0x3F) { // . ! ?
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
    newState: state
  };
}

/**
 * Get the first line segment from a string (simplified implementation)
 */
export function firstLineSegmentInString(str: string, state: SegmentationState): SegmentationResult {
  if (!str) {
    return {
      segment: '',
      remainder: '',
      segmentLength: 0,
      newState: state
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
    newState: state
  };
}

/**
 * Create a new grapheme cluster iterator
 */
export function newGraphemes(str: string): GraphemeIterator {
  return new GraphemesImpl(str);
}

// Helper functions for emoji and regional indicator detection
function isEmojiModifier(codePoint: number): boolean {
  return codePoint >= 0x1F3FB && codePoint <= 0x1F3FF; // Skin tone modifiers
}

function isEmojiJoiner(codePoint: number): boolean {
  return codePoint === 0x200D; // Zero Width Joiner
}

function isRegionalIndicator(codePoint: number): boolean {
  return codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF; // Regional indicator symbols
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
    const result = stepString(remaining, this.state);

    if (result.segment.length === 0) {
      return null;
    }

    this.pos += result.segmentLength;
    this.state = result.newState;

    return {
      cluster: result.segment,
      startPos,
      length: result.segmentLength,
      runes: stringToRunes(result.segment)
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
    return stringToRunes(this.str.slice(this.pos));
  }
}