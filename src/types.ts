/**
 * Core types for Unicode text segmentation
 */

/**
 * Represents a boundary type for text segmentation
 */
export type BoundaryType = 'grapheme' | 'word' | 'sentence' | 'line';

/**
 * State value for segmentation algorithms
 */
export type SegmentationState = number;

/**
 * Result of a segmentation step
 */
export interface SegmentationResult {
  /** The segmented text */
  segment: string;
  /** Remaining text to process */
  remainder: string;
  /** Length of the segment in bytes */
  segmentLength: number;
  /** New state for continued processing */
  newState: SegmentationState;
}

/**
 * Configuration options for grapheme cluster iteration
 */
export interface GraphemeOptions {
  /** Starting position in the string */
  startPos?: number;
  /** Maximum number of clusters to process */
  maxClusters?: number;
}

/**
 * Represents a single grapheme cluster
 */
export interface GraphemeCluster {
  /** The cluster string */
  cluster: string;
  /** Starting byte position */
  startPos: number;
  /** Length in bytes */
  length: number;
  /** Unicode code points in this cluster */
  runes: number[];
}

/**
 * Iterator for grapheme clusters
 */
export interface GraphemeIterator {
  /** Get the next grapheme cluster */
  next(): GraphemeCluster | null;
  /** Check if there are more clusters */
  hasNext(): boolean;
  /** Get current position */
  position(): number;
  /** Get the underlying string */
  string(): string;
  /** Get all remaining runes from current position */
  runes(): number[];
}