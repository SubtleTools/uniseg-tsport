import { firstWordInString } from '#src/index.js';

function main() {
  // Test cases for word boundary detection
  const testCases = [
    'Hello, world!',
    'Test 123. More text!',
    'こんにちは世界', // Japanese
    'Hello\nWorld',
    'word-with-hyphens',
    'CamelCaseWord',
    'user@example.com',
    'U.S.A.',
    '',
    '   ',
    'a',
    'café naïve résumé', // Accented characters
  ];

  for (const test of testCases) {
    let state = -1;
    let remaining = test;
    const result: string[] = [];

    while (remaining.length > 0) {
      const wordResult = firstWordInString(remaining, state);
      if (wordResult.segment === '') {
        break;
      }
      result.push(wordResult.segment);
      remaining = wordResult.remainder;
      state = wordResult.newState;
    }

    process.stdout.write(`${result.length}\n`);
    for (const w of result) {
      if (w === ' ') {
        process.stdout.write('(SPACE)');
      } else if (w === '\n') {
        process.stdout.write('(LF)');
      } else if (w === '\t') {
        process.stdout.write('(TAB)');
      } else {
        process.stdout.write(`(${w})`);
      }
    }
    process.stdout.write('\n');
  }
}

main();
