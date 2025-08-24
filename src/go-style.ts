/**
 * Go-style API wrapper for uniseg
 * Provides API compatibility with the original Go library
 *
 * This module wraps the TypeScript implementation to match
 * the exact Go API naming and behavior.
 */

import {
  firstGraphemeClusterInString as tsFirstGraphemeClusterInString,
  firstLineSegmentInString as tsFirstLineSegmentInString,
  firstSentenceInString as tsFirstSentenceInString,
  firstWordInString as tsFirstWordInString,
  graphemeClusterCount as tsGraphemeClusterCount,
  newGraphemes as tsNewGraphemes,
  reverseString as tsReverseString,
  stepString as tsStepString,
  stringWidth as tsStringWidth,
} from './core.js';

import type { GraphemeIterator } from './types.js';

/**
 * Go-compatible GraphemeClusterCount function
 * @param str The string to analyze
 * @returns Number of grapheme clusters
 */
export function GraphemeClusterCount(str: string): number {
  return tsGraphemeClusterCount(str);
}

/**
 * Go-compatible StringWidth function
 * @param str The string to measure
 * @returns Display width in monospace font
 */
export function StringWidth(str: string): number {
  return tsStringWidth(str);
}

/**
 * Go-compatible ReverseString function
 * @param str The string to reverse
 * @returns Reversed string preserving grapheme clusters
 */
export function ReverseString(str: string): string {
  return tsReverseString(str);
}

/**
 * Go-compatible Step function for bytes (simulated with string)
 * @param b Byte array (represented as string in TypeScript)
 * @param state Current segmentation state
 * @returns Tuple of [cluster, newB, clusterLength, newState]
 */
export function Step(b: string, state: number): [string, string, number, number] {
  const result = tsStepString(b, state);
  return [result.segment, result.remainder, result.segmentLength, result.newState];
}

/**
 * Go-compatible StepString function
 * @param str The string to process
 * @param state Current segmentation state
 * @returns Tuple of [cluster, remainder, clusterLength, newState]
 */
export function StepString(str: string, state: number): [string, string, number, number] {
  const result = tsStepString(str, state);
  return [result.segment, result.remainder, result.segmentLength, result.newState];
}

/**
 * Go-compatible FirstGraphemeCluster function for bytes
 * @param b Byte array (represented as string)
 * @param state Current state
 * @returns Tuple of [cluster, newB, newState]
 */
export function FirstGraphemeCluster(b: string, state: number): [string, string, number] {
  const result = tsFirstGraphemeClusterInString(b, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstGraphemeClusterInString function
 * @param str The string to process
 * @param state Current state
 * @returns Tuple of [cluster, remainder, newState]
 */
export function FirstGraphemeClusterInString(str: string, state: number): [string, string, number] {
  const result = tsFirstGraphemeClusterInString(str, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstWord function for bytes
 * @param b Byte array (represented as string)
 * @param state Current state
 * @returns Tuple of [word, newB, newState]
 */
export function FirstWord(b: string, state: number): [string, string, number] {
  const result = tsFirstWordInString(b, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstWordInString function
 * @param str The string to process
 * @param state Current state
 * @returns Tuple of [word, remainder, newState]
 */
export function FirstWordInString(str: string, state: number): [string, string, number] {
  const result = tsFirstWordInString(str, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstSentence function for bytes
 * @param b Byte array (represented as string)
 * @param state Current state
 * @returns Tuple of [sentence, newB, newState]
 */
export function FirstSentence(b: string, state: number): [string, string, number] {
  const result = tsFirstSentenceInString(b, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstSentenceInString function
 * @param str The string to process
 * @param state Current state
 * @returns Tuple of [sentence, remainder, newState]
 */
export function FirstSentenceInString(str: string, state: number): [string, string, number] {
  const result = tsFirstSentenceInString(str, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstLineSegment function for bytes
 * @param b Byte array (represented as string)
 * @param state Current state
 * @returns Tuple of [segment, newB, newState]
 */
export function FirstLineSegment(b: string, state: number): [string, string, number] {
  const result = tsFirstLineSegmentInString(b, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible FirstLineSegmentInString function
 * @param str The string to process
 * @param state Current state
 * @returns Tuple of [segment, remainder, newState]
 */
export function FirstLineSegmentInString(str: string, state: number): [string, string, number] {
  const result = tsFirstLineSegmentInString(str, state);
  return [result.segment, result.remainder, result.newState];
}

/**
 * Go-compatible Graphemes type/constructor
 * This mimics the Go struct with its methods
 */
export class Graphemes {
  private iterator: GraphemeIterator;

  constructor(str: string) {
    this.iterator = tsNewGraphemes(str);
  }

  /**
   * Go-compatible Next method
   * @returns true if there's a next cluster, false otherwise
   */
  Next(): boolean {
    return this.iterator.hasNext();
  }

  /**
   * Go-compatible Runes method
   * @returns Array of Unicode code points for current cluster
   */
  Runes(): number[] {
    const cluster = this.iterator.next();
    return cluster ? cluster.runes : [];
  }

  /**
   * Go-compatible Str method
   * @returns String representation of current cluster
   */
  Str(): string {
    const cluster = this.iterator.next();
    return cluster ? cluster.cluster : '';
  }

  /**
   * Go-compatible Bytes method (returns string in TypeScript)
   * @returns Byte representation (as string) of current cluster
   */
  Bytes(): string {
    const cluster = this.iterator.next();
    return cluster ? cluster.cluster : '';
  }

  /**
   * Go-compatible Position method
   * @returns Current byte position
   */
  Position(): number {
    return this.iterator.position();
  }
}

/**
 * Go-compatible NewGraphemes constructor function
 * @param str The string to iterate over
 * @returns New Graphemes instance
 */
export function NewGraphemes(str: string): Graphemes {
  return new Graphemes(str);
}
