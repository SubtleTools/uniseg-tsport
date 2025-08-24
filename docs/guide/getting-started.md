# Getting Started

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [bun]
bun add @tsports/uniseg
```

```bash [npm]
npm install @tsports/uniseg
```

```bash [yarn]
yarn add @tsports/uniseg
```

:::

## Quick Start

### TypeScript-Native API (Recommended)

```typescript
import { graphemeClusterCount, stringWidth, reverseString, newGraphemes } from '@tsports/uniseg';

// Count user-perceived characters (grapheme clusters)
graphemeClusterCount('Hello'); // 5
graphemeClusterCount('🇩🇪🏳️‍🌈'); // 2 (German flag + rainbow flag)
graphemeClusterCount('नमस्ते'); // 4 (Devanagari script)

// Calculate display width for monospace fonts
stringWidth('Hello'); // 5
stringWidth('你好'); // 4 (full-width characters)

// Reverse strings while preserving grapheme clusters
reverseString('🇩🇪🏳️‍🌈'); // '🏳️‍🌈🇩🇪'
```

### Go-Compatible API

Perfect for developers migrating from Go - import from the `go-style` module:

```typescript
import { GraphemeClusterCount, StringWidth, ReverseString, NewGraphemes } from '@tsports/uniseg/go-style';

// Exact Go API with PascalCase methods
const count = GraphemeClusterCount('🇩🇪🏳️‍🌈');
const width = StringWidth('Hello 世界');
const reversed = ReverseString('नमस्ते');

// Go-style iterator
const iter = NewGraphemes('🧑‍💻 Hello');
while (iter.Next()) {
  const cluster = iter.Str();
  const runes = iter.Runes();
  console.log(`"${cluster}" -> [${runes.map(r => `U+${r.toString(16).toUpperCase()}`).join(', ')}]`);
}
```

#### Available Go-Compatible Functions

The `go-style` export provides all Go functions with exact naming:

**Core Functions:**
- `GraphemeClusterCount(str)` - Count grapheme clusters
- `StringWidth(str)` - Calculate display width  
- `ReverseString(str)` - Reverse preserving clusters

**Iterator:**
- `NewGraphemes(str)` - Create grapheme iterator
- `iter.Next()` - Advance to next cluster
- `iter.Str()` - Get current cluster string
- `iter.Runes()` - Get current cluster runes
- `iter.Position()` - Get byte position

**Step Functions:**
- `StepString(str, state)` - Process one cluster
- `Step(b, state)` - Process bytes (as string)

**Boundary Functions:**
- `FirstGraphemeClusterInString(str, state)` 
- `FirstWordInString(str, state)`
- `FirstSentenceInString(str, state)`
- `FirstLineSegmentInString(str, state)`

## Next Steps

- Check out the [Examples](/guide/examples) for more detailed usage
- Browse the complete [API Reference](/api/) for all available functions
- See the [GitHub repository](https://github.com/tsports/uniseg) for source code and issues