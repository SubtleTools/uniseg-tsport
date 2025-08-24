import { firstSentenceInString } from '#src/index.js';

function main() {
  // Test cases for sentence boundary detection
  const testCases = [
    "This is sentence 1.0. And this is sentence two.",
    "Hello! How are you? I'm fine.",
    "Mr. Smith went to the U.S.A. yesterday.",
    "What?! No way... Really?",
    "End.\n\nNew paragraph.",
    "",
    "No punctuation here",
    "Multiple...   spaces!    After   punctuation.",
    "E.g. this is an example.",
    "Test (with parentheses). Next sentence.",
    "Question mark? Answer! Exclamation.",
    "Dr. Jones vs. Dr. Smith.",
  ];

  for (const test of testCases) {
    let state = -1;
    let remaining = test;
    const result: string[] = [];
    
    while (remaining.length > 0) {
      const sentenceResult = firstSentenceInString(remaining, state);
      if (sentenceResult.segment === "") {
        break;
      }
      result.push(sentenceResult.segment);
      remaining = sentenceResult.remainder;
      state = sentenceResult.newState;
    }
    
    process.stdout.write(result.length + '\n');
    for (let i = 0; i < result.length; i++) {
      if (i > 0) {
        process.stdout.write("|");
      }
      process.stdout.write(`(${result[i]})`);
    }
    process.stdout.write('\n');
  }
}

main();