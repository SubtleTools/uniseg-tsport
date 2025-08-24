import { stringWidth } from '#src/index.js';

function main() {
  // Test cases for monospace string width calculation
  const testCases = [
    "Hello",            // ASCII - should be 5
    "世界",             // Wide characters - should be 4
    "Hello, 世界",      // Mixed ASCII and wide - should be 11
    "🇩🇪",              // Flag emoji - should be 2
    "🏳️‍🌈",             // Complex emoji - should be 2
    "",                 // Empty string - should be 0
    "a̧",               // Letter with combining mark - should be 1
    "👨‍💻",             // Professional emoji - should be 2
    "¿¡",               // Ambiguous width chars - depends on EastAsianAmbiguousWidth
    "Ａａ",             // Fullwidth chars - should be 4
    "\t\n",             // Control chars - should be 0
    "⸺⸻",              // Special width chars (2-em, 3-em dash) - should be 7
  ];

  for (const test of testCases) {
    const width = stringWidth(test);
    process.stdout.write(width + '\n');
  }
}

main();