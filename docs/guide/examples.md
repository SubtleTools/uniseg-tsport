# Examples

## Basic Usage Examples

### Grapheme Cluster Counting

```typescript
import { graphemeClusterCount } from '@tsports/uniseg';

// Basic counting
graphemeClusterCount('Hello World'); // 11

// Complex emoji sequences
graphemeClusterCount('👨‍👩‍👧‍👦'); // 1 (family emoji)
graphemeClusterCount('🏳️‍⚧️'); // 1 (transgender flag)
graphemeClusterCount('👋🏻'); // 1 (waving hand with skin tone)

// Regional indicator pairs (flags)
graphemeClusterCount('🇺🇸🇬🇧'); // 2 (US flag + UK flag)
```

### String Width Calculation

```typescript
import { stringWidth } from '@tsports/uniseg';

// Latin characters
stringWidth('Hello'); // 5

// East Asian characters (full-width)
stringWidth('你好世界'); // 8
stringWidth('こんにちは'); // 10

// Mixed content
stringWidth('Hello 世界'); // 9

// Emoji and symbols
stringWidth('🚀📱💻'); // 6
```

### Advanced Iteration

```typescript
import { newGraphemes } from '@tsports/uniseg';

// Iterator pattern
const iter = newGraphemes('🧑‍💻 Hello');
let cluster;
while ((cluster = iter.next()) !== null) {
  console.log({
    cluster: cluster.cluster,
    runes: cluster.runes,
    position: cluster.startPos,
    length: cluster.length
  });
}
```

## Complex Examples

### Emoji Analysis

```typescript
import { graphemeClusterCount, stringWidth, newGraphemes } from '@tsports/uniseg';

const emojis = [
  '👋',           // Basic emoji
  '👋🏻',          // Emoji + skin tone modifier
  '👨‍💻',          // ZWJ sequence (man technologist)
  '🏳️‍🌈',         // Rainbow flag
  '🇺🇸',          // Country flag
];

emojis.forEach(emoji => {
  console.log({
    emoji,
    clusters: graphemeClusterCount(emoji),
    width: stringWidth(emoji),
    codePoints: [...emoji].map(c => `U+${c.codePointAt(0)?.toString(16).toUpperCase()}`)
  });
});
```

### Text Processing

```typescript
import { graphemeClusterCount, reverseString, newGraphemes, stringWidth } from '@tsports/uniseg';

function analyzeText(text: string) {
  const clusters = [];
  const iter = newGraphemes(text);
  let cluster;

  while ((cluster = iter.next()) !== null) {
    clusters.push({
      text: cluster.cluster,
      position: cluster.startPos,
      codePoints: cluster.runes.length
    });
  }

  return {
    originalText: text,
    reversedText: reverseString(text),
    totalClusters: graphemeClusterCount(text),
    displayWidth: stringWidth(text),
    clusters
  };
}

// Analyze complex text
const result = analyzeText('Hello 🌍! नमस्ते 🇮🇳');
console.log(JSON.stringify(result, null, 2));
```