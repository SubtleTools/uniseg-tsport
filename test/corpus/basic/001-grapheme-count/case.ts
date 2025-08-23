import { graphemeClusterCount } from '../../../src/index';

function main() {
  // Basic grapheme cluster count tests
  const testCases = [
    "Hello",                    // Simple ASCII
    "🇩🇪🏳️‍🌈",                  // Complex emoji sequences 
    "नमस्ते",                   // Devanagari script
    "🧑‍💻",                     // Profession emoji with ZWJ
    "a̧",                       // Letter with combining mark
    "",                        // Empty string
  ];
  
  for (const testCase of testCases) {
    const count = graphemeClusterCount(testCase);
    process.stdout.write(`${count}\n`);
  }
}

main();