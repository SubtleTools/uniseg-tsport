import { firstGraphemeClusterInString, graphemeClusterCount, stringWidth } from '#src/index.js';

function main() {
  // Complex emoji and ZWJ sequences
  const testCases = [
    '👨‍👩‍👧‍👦', // Family: man, woman, girl, boy
    '🏳️‍🌈', // Rainbow flag
    '🏳️‍⚧️', // Transgender flag
    '👨🏽‍💻', // Man technologist: medium skin tone
    '🧑‍🎓', // Person student (gender-neutral)
    '👩‍❤️‍👩', // Woman-heart-woman
    '🐻‍❄️', // Polar bear
    '😮‍💨', // Face exhaling
    '❤️‍🔥', // Heart on fire
    '👁️‍🗨️', // Eye in speech bubble
    '🏴‍☠️', // Pirate flag
    '🧑🏻‍🦰', // Person: light skin tone, red hair
    '👩🏾‍🚀', // Woman astronaut: medium-dark skin tone
    '🤵🏿‍♀️', // Woman in tuxedo: dark skin tone
    '🧑‍🤝‍🧑', // People holding hands
    '👨‍👨‍👦‍👦', // Family: man, man, boy, boy
  ];

  for (const test of testCases) {
    const count = graphemeClusterCount(test);
    const width = stringWidth(test);
    process.stdout.write(`${count}:${width}\n`);

    // Detailed breakdown
    let state = -1;
    let remaining = test;
    const segments: string[] = [];

    while (remaining.length > 0) {
      const result = firstGraphemeClusterInString(remaining, state);
      if (result.segment === '') {
        break;
      }
      const segmentWidth = stringWidth(result.segment);
      segments.push(`[${result.segment}:${segmentWidth}]`);
      remaining = result.remainder;
      state = result.newState;
    }

    for (const segment of segments) {
      process.stdout.write(segment);
    }
    process.stdout.write('\n');
  }
}

main();
