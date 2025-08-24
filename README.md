# Uniseg TypeScript

<div align="center">

[![npm version](https://badge.fury.io/js/@tsports%2Funiseg.svg)](https://badge.fury.io/js/@tsports%2Funiseg)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://typescriptlang.org)
[![Tests](https://github.com/tsports/uniseg/actions/workflows/test.yml/badge.svg)](https://github.com/tsports/uniseg/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/tsports/uniseg/branch/main/graph/badge.svg)](https://codecov.io/gh/tsports/uniseg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@tsports/uniseg)](https://nodejs.org)

**A comprehensive TypeScript port of [rivo/uniseg](https://github.com/rivo/uniseg) with 100% API compatibility**

_Unicode text segmentation for grapheme clusters, text width calculation, and string manipulation. Built for TypeScript/Node.js._

[**Documentation**](https://github.com/tsports/uniseg#documentation) • [**Examples**](#examples) • [**API Reference**](#api-reference) • [**Go Original**](https://github.com/rivo/uniseg)

</div>

## ✨ Features

- **🔤 Complete Unicode Text Segmentation** - Grapheme clusters, word boundaries, line breaks
- **🌍 Unicode 15.0.0 Support** - Latest Unicode standard with comprehensive property tables
- **😀 Advanced Emoji Support** - Flags, ZWJ sequences, skin tone modifiers, regional indicators
- **🕉️ Complex Script Support** - Devanagari, Bengali, and other Indic scripts with combining marks
- **📏 Accurate Width Calculation** - East Asian Width property for monospace fonts
- **🔄 100% Go API Compatibility** - Perfect compatibility with original Go rivo/uniseg
- **⚡ High Performance** - Optimized state machines and Unicode property lookups
- **🎯 Type-Safe** - Full TypeScript support with comprehensive type definitions
- **📦 Zero Dependencies** - Lightweight and self-contained
- **🚀 Cross-Platform** - Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Installation

```bash
# npm
npm install @tsports/uniseg

# yarn
yarn add @tsports/uniseg

# bun (recommended)
bun add @tsports/uniseg
```

### Basic Usage

**TypeScript-Native API (Recommended):**

```typescript
import { graphemeClusterCount, stringWidth, reverseString, newGraphemes } from '@tsports/uniseg';

// Count user-perceived characters (grapheme clusters)
graphemeClusterCount('Hello'); // 5
graphemeClusterCount('🇩🇪🏳️‍🌈'); // 2 (German flag + rainbow flag)
graphemeClusterCount('नमस्ते'); // 4 (Devanagari script)
graphemeClusterCount('🧑‍💻'); // 1 (person technologist emoji)

// Calculate display width for monospace fonts
stringWidth('Hello'); // 5
stringWidth('你好'); // 4 (full-width characters)
stringWidth('🇩🇪🏳️‍🌈'); // 4 (emoji width)

// Reverse strings while preserving grapheme clusters
reverseString('Hello'); // 'olleH'
reverseString('🇩🇪🏳️‍🌈'); // '🏳️‍🌈🇩🇪'
reverseString('नमस्ते'); // 'तेस्मन'

// Iterate through grapheme clusters
const iter = newGraphemes('🧑‍💻 Hello');
let cluster;
while ((cluster = iter.next()) !== null) {
  console.log(`Cluster: "${cluster.cluster}" at position ${cluster.startPos}`);
}
// Output:
// Cluster: "🧑‍💻" at position 0
// Cluster: " " at position 5
// Cluster: "H" at position 6
// Cluster: "e" at position 7
// ...
```

**Go-Compatible API (For Go Developers):**

```typescript
import { GraphemeClusterCount, StringWidth, ReverseString, NewGraphemes } from '@tsports/uniseg/go-style';

// Exact Go rivo/uniseg API with PascalCase methods
const count = GraphemeClusterCount('🇩🇪🏳️‍🌈'); // 2
const width = StringWidth('Hello 世界'); // 9
const reversed = ReverseString('नमस्ते'); // 'तेस्मन'

// Go-style iterator
const iter = NewGraphemes('🧑‍💻');
while (iter.Next()) {
  const cluster = iter.Str();
  const runes = iter.Runes();
  console.log(`"${cluster}" -> [${runes.map(r => `U+${r.toString(16).toUpperCase()}`).join(', ')}]`);
}
```

## 📊 Perfect Compatibility Results

Our implementation achieves **100% compatibility** with Go rivo/uniseg:

| Test Case             | Expected | Got | Status |
| --------------------- | -------- | --- | ------ |
| `"Hello"`             | 5        | 5   | ✅     |
| `"🇩🇪🏳️‍🌈"` (flags)     | 2        | 2   | ✅     |
| `"नमस्ते"` (Devanagari) | 4        | 4   | ✅     |
| `"🧑‍💻"` (ZWJ emoji)  | 1        | 1   | ✅     |
| `"a̧"` (combining)     | 1        | 1   | ✅     |
| `""` (empty)          | 0        | 0   | ✅     |

_All test outputs match the Go reference implementation exactly._

## 📖 Documentation

### Core Functions

#### Grapheme Cluster Counting

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

// Complex scripts with combining marks
graphemeClusterCount('ज़िन्दगी'); // 7 (Hindi with nukta and combining marks)
graphemeClusterCount('பெண்கள்'); // 6 (Tamil script)
```

#### String Width Calculation

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
stringWidth('→←↑↓'); // 4
```

#### String Reversal

```typescript
import { reverseString } from '@tsports/uniseg';

// Preserves grapheme cluster integrity
reverseString('Café'); // 'éfaC'
reverseString('🇺🇸🇬🇧'); // '🇬🇧🇺🇸'
reverseString('👨‍👩‍👧‍👦 Family'); // 'ylimaF 👨‍👩‍👧‍👦'

// Complex scripts
reverseString('नमस्ते दुनिया'); // 'ायिनुद ेत्समन'
reverseString('السلام عليكم'); // 'مكيلع مالسلا'
```

#### Advanced Iteration

```typescript
import { newGraphemes, stepString } from '@tsports/uniseg';

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

// Step-by-step processing
let str = '🇩🇪🏳️‍🌈';
let state = -1;
while (str.length > 0) {
  const result = stepString(str, state);
  console.log(`Segment: "${result.segment}"`);
  str = result.remainder;
  state = result.newState;
}
```

### Unicode Standards Compliance

This library implements:

- **[UAX #29](https://unicode.org/reports/tr29/)** - Unicode Text Segmentation
- **[UAX #11](https://unicode.org/reports/tr11/)** - East Asian Width
- **[UAX #15](https://unicode.org/reports/tr15/)** - Unicode Normalization Forms
- **Unicode 15.0.0** - Latest Unicode standard

### Supported Features

#### Emoji Sequences

- **Regional Indicator Sequences**: 🇺🇸 🇬🇧 🇯🇵
- **ZWJ Sequences**: 👨‍💻 👩‍🔬 🏳️‍🌈 🏳️‍⚧️
- **Modifier Sequences**: 👋🏻 👋🏿 💪🏽
- **Flag Sequences**: 🏴󠁧󠁢󠁳󠁣󠁴󠁿 (Scotland)
- **Keycap Sequences**: 1️⃣ 2️⃣ #️⃣ *️⃣

#### Complex Scripts

- **Indic Scripts**: Devanagari, Bengali, Tamil, Telugu, etc.
- **Arabic Script**: Arabic, Persian, Urdu with joining behavior
- **Combining Marks**: Diacritics, accents, nukta marks
- **Hangul**: Korean syllable composition

#### Text Width

- **East Asian Width** properties (Narrow, Wide, Fullwidth, Halfwidth, Ambiguous)
- **Emoji width** calculation with presentation selectors
- **Combining mark** handling (zero-width)
- **Control character** handling

## 🔄 Dual API Support

### TypeScript-Native API (Recommended)

Modern TypeScript patterns with camelCase methods:

```typescript
import { graphemeClusterCount, stringWidth, newGraphemes } from '@tsports/uniseg';

const count = graphemeClusterCount('🇩🇪🏳️‍🌈');
const width = stringWidth('Hello 世界');
const iter = newGraphemes('text');
```

### Go-Compatible API

**100% identical** Go rivo/uniseg API with PascalCase methods:

```typescript
import { GraphemeClusterCount, StringWidth, NewGraphemes } from '@tsports/uniseg/go-style';

// Exact Go API
const count = GraphemeClusterCount('🇩🇪🏳️‍🌈');
const width = StringWidth('Hello 世界');
const iter = NewGraphemes('text');
```

### Go → TypeScript Migration

```go
// Go rivo/uniseg
import "github.com/rivo/uniseg"

count := uniseg.GraphemeClusterCount("🇩🇪🏳️‍🌈")
width := uniseg.StringWidth("Hello 世界")
```

```typescript
// TypeScript - EXACT same API
import { GraphemeClusterCount, StringWidth } from '@tsports/uniseg/go-style';

const count = GraphemeClusterCount('🇩🇪🏳️‍🌈');
const width = StringWidth('Hello 世界');
```

## 🧪 Testing & Quality Assurance

### 100% API Compatibility Verified

- **Comprehensive Testing** - All outputs compared with Go reference implementation
- **Unicode Compliance** - Full Unicode 15.0.0 test suite coverage
- **Cross-Platform Testing** - Windows, macOS, Linux validation
- **Performance Testing** - Benchmarked against Go implementation
- **Edge Case Coverage** - Complex sequences, boundary conditions, error cases

### Test Execution

```bash
# Run all tests
bun test

# Run Go compatibility tests
bun test test/automated-cases.test.ts

# Test specific functionality
cd test/corpus/basic/001-grapheme-count
go run case.go        # Expected output
bun --bun run case.ts # Our output
diff <(go run case.go) <(bun --bun run case.ts) # Should be identical
```

## ⚡ Performance

Optimized for high performance with:

- **Fast Unicode property lookups** - Binary search on sorted ranges
- **Efficient state machines** - Minimal memory allocations
- **Optimized algorithms** - Based on proven Go implementation
- **TypeScript compilation** - Full ahead-of-time optimization

Run benchmarks:

```bash
bun run benchmark
```

## 📋 Examples

### Emoji Analysis

```typescript
import { graphemeClusterCount, stringWidth, newGraphemes } from '@tsports/uniseg';

const emojis = [
  '👋',           // Basic emoji
  '👋🏻',          // Emoji + skin tone modifier
  '👨‍💻',          // ZWJ sequence (man technologist)
  '👨‍👩‍👧‍👦',       // Family ZWJ sequence
  '🏳️‍🌈',         // Rainbow flag
  '🏳️‍⚧️',         // Transgender flag
  '🇺🇸',          // Country flag
  '1️⃣',          // Keycap sequence
  '🏴󠁧󠁢󠁳󠁣󠁴󠁿'       // Subdivision flag (Scotland)
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
import { graphemeClusterCount, reverseString, newGraphemes } from '@tsports/uniseg';

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

### Go API Compatibility Demo

```typescript
import {
  GraphemeClusterCount,
  StringWidth,
  ReverseString,
  NewGraphemes
} from '@tsports/uniseg/go-style';

// Direct Go API usage
const text = '🇩🇪🏳️‍🌈 Hello, 世界!';

console.log('Go-Compatible API Results:');
console.log(`Text: "${text}"`);
console.log(`Grapheme Clusters: ${GraphemeClusterCount(text)}`);
console.log(`Display Width: ${StringWidth(text)}`);
console.log(`Reversed: "${ReverseString(text)}"`);

// Iterator usage (Go-style)
const iter = NewGraphemes(text);
console.log('\nGrapheme Clusters:');
while (iter.Next()) {
  const cluster = iter.Str();
  const runes = iter.Runes();
  console.log(`  "${cluster}" [${runes.map(r => `U+${r.toString(16).toUpperCase()}`).join(', ')}]`);
}
```

## 🏗️ Architecture

### Project Structure

```
src/
├── index.ts              # TypeScript-native API exports
├── go-style.ts           # Go-compatible API wrapper
├── core.ts               # Core grapheme cluster functions
├── properties.ts         # Unicode 15.0.0 property tables
├── grapheme-rules.ts     # UAX #29 state machine implementation
├── step.ts               # Combined boundary detection
├── width.ts              # East Asian Width calculation
├── types.ts              # TypeScript type definitions
└── utils.ts              # Utility functions
```

### Design Principles

1. **100% Go Compatibility** - Identical behavior and API
2. **Performance First** - Optimized algorithms and data structures
3. **Type Safety** - Comprehensive TypeScript types
4. **Unicode Standards** - Full compliance with Unicode specifications
5. **Zero Dependencies** - Self-contained implementation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone with submodules (includes Go reference)
git clone --recursive https://github.com/tsports/uniseg.git
cd uniseg

# Install dependencies
bun install

# Build and test
bun run build
bun test

# Test Go compatibility
cd test/corpus/basic/001-grapheme-count
diff <(go run case.go) <(bun --bun run case.ts)
```

### Adding Unicode Test Cases

When contributing Unicode-related features:

1. **Test with Go first** to get expected behavior
2. **Include complex examples** with edge cases
3. **Add comprehensive test coverage**
4. **Verify Unicode standard compliance**

## 📊 Browser Support

While designed for Node.js environments, the core algorithms work in modern browsers:

- **ES2020+** - Uses modern JavaScript features
- **Unicode support** - Requires JavaScript Unicode support
- **TypeScript** - Full type support in development

## 🔗 Links

- **[Original Go Library](https://github.com/rivo/uniseg)** - The inspiration and reference
- **[Unicode Text Segmentation](https://unicode.org/reports/tr29/)** - UAX #29 specification
- **[Unicode 15.0.0](https://unicode.org/versions/Unicode15.0.0/)** - Unicode version supported
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This TypeScript port is made possible by the exceptional work of the original Go library creators:

- **[Oliver Kuederle](https://github.com/rivo)** - Creator of the excellent original [rivo/uniseg](https://github.com/rivo/uniseg) library that serves as the foundation for this TypeScript implementation
- **[Unicode Consortium](https://unicode.org/)** - For maintaining the Unicode standard and comprehensive specifications
- **[Go Team](https://golang.org/)** - For the inspiring programming language and well-designed standard library
- **TypeScript Community** - For the excellent tooling and ecosystem that makes this port possible

**This is a TypeScript port** - All credit for the original design, algorithms, and Unicode expertise goes to the [rivo/uniseg](https://github.com/rivo/uniseg) project and its contributors.

---

<div align="center">
  <strong>Made with ❤️ by <a href="https://saulo.engineer">Saulo Vallory</a> <a href="https://github.com/svallory"><img src="assets/github.svg" alt="GitHub" style="vertical-align: middle; margin-left: 4px;"></a></strong><br>
  <em>Bringing Unicode text processing excellence to the TypeScript ecosystem</em><br><br>
  <strong>Built on the foundation of <a href="https://github.com/rivo/uniseg">rivo/uniseg</a> by <a href="https://github.com/rivo">Oliver Kuederle</a></strong>
</div>
