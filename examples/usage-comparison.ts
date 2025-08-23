/**
 * Usage examples for @subtletools/uniseg-ts
 * Demonstrates both TypeScript-style and Go-style APIs
 */

// TypeScript-style API (recommended)
import { 
  graphemeClusterCount, 
  stringWidth, 
  reverseString,
  newGraphemes,
  stepString,
  INITIAL_STATE
} from '../src/index.js';

// Go-style API (for compatibility)
import {
  GraphemeClusterCount,
  StringWidth,
  ReverseString,
  NewGraphemes,
  StepString
} from '../src/go-style.js';

console.log('=== TypeScript-style API ===\n');

// Basic grapheme cluster counting
console.log('Grapheme cluster counting:');
const complexEmoji = "🇩🇪🏳️‍🌈";
console.log(`"${complexEmoji}" has ${graphemeClusterCount(complexEmoji)} grapheme clusters`);

const devanagari = "नमस्ते";
console.log(`"${devanagari}" has ${graphemeClusterCount(devanagari)} grapheme clusters`);

const simple = "Hello";
console.log(`"${simple}" has ${graphemeClusterCount(simple)} grapheme clusters\n`);

// String width calculation
console.log('String width calculation:');
const mixed = "Hello 世界";
console.log(`"${mixed}" has display width: ${stringWidth(mixed)}`);

const wideChars = "こんにちは";
console.log(`"${wideChars}" has display width: ${stringWidth(wideChars)}\n`);

// String reversal preserving grapheme clusters
console.log('String reversal:');
console.log(`Original: "${complexEmoji}"`);
console.log(`Reversed: "${reverseString(complexEmoji)}"\n`);

// Grapheme cluster iteration
console.log('Grapheme cluster iteration:');
const testStr = "a̧🧑‍💻";
const iterator = newGraphemes(testStr);
let cluster;
let index = 0;
while ((cluster = iterator.next()) !== null) {
  console.log(`  Cluster ${index++}: "${cluster.cluster}" (${cluster.runes.length} runes)`);
}
console.log();

// Step-by-step processing
console.log('Step-by-step processing:');
let remaining = "🇺🇸a";
let state = INITIAL_STATE;
index = 0;
while (remaining.length > 0) {
  const result = stepString(remaining, state);
  if (result.segment.length === 0) break;
  console.log(`  Step ${index++}: "${result.segment}" (${result.segmentLength} bytes)`);
  remaining = result.remainder;
  state = result.newState;
}

console.log('\n=== Go-style API ===\n');

// Same functionality with Go-style naming
console.log('Go-style grapheme cluster counting:');
console.log(`"${complexEmoji}" has ${GraphemeClusterCount(complexEmoji)} grapheme clusters`);
console.log(`"${devanagari}" has ${GraphemeClusterCount(devanagari)} grapheme clusters\n`);

console.log('Go-style string width:');
console.log(`"${mixed}" has display width: ${StringWidth(mixed)}\n`);

console.log('Go-style string reversal:');
console.log(`Reversed: "${ReverseString(complexEmoji)}"\n`);

console.log('Go-style step processing:');
const [segment, remainder, length, newState] = StepString("🇺🇸a", -1);
console.log(`First segment: "${segment}" (${length} bytes)`);
console.log(`Remaining: "${remainder}"`);

console.log('\nGo-style grapheme iteration:');
const goGraphemes = NewGraphemes("a̧🧑‍💻");
index = 0;
while (goGraphemes.Next()) {
  const runes = goGraphemes.Runes();
  const str = goGraphemes.Str();
  console.log(`  Cluster ${index++}: "${str}" (${runes.length} runes)`);
}