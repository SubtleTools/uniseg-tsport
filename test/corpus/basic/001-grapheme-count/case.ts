import { graphemeClusterCount } from '#src/index.js';

function main() {
  // Test cases covering fundamental grapheme cluster counting
  const testCases = [
    "Hello",            // Simple ASCII
    "🇩🇪🏳️‍🌈",          // Complex emoji sequences
    "नमस्ते",            // Devanagari script with combining characters
    "🧑‍💻",             // Professional emoji with ZWJ
    "a̧",               // Letter with combining mark
    "",                 // Empty string
    "🏴‍☠️",             // Pirate flag (complex ZWJ sequence)
    "👨‍👩‍👧‍👦",          // Family emoji
    "e̊̇",               // Multiple combining marks
    "각",               // Hangul precomposed
    "각",            // Hangul Jamo sequence
  ];

  for (const test of testCases) {
    const count = graphemeClusterCount(test);
    process.stdout.write(count + '\n');
  }
}

main();