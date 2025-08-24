# Changelog

All notable changes to @tsports/uniseg will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial TypeScript port of rivo/uniseg v0.4.7
- Complete Unicode 15.0.0 property tables
- 100% Go API compatibility with dual API support
- TypeScript-native API with modern patterns
- Go-compatible API with identical naming
- Comprehensive grapheme cluster boundary detection
- Support for complex emoji sequences (flags, ZWJ sequences, modifiers)
- Support for Indic scripts (Devanagari, Bengali, etc.)
- Character width calculation for monospace fonts
- String reversal preserving grapheme clusters
- Iterator pattern for grapheme cluster traversal
- Extensive test suite with Go compatibility verification

### Features

- **Grapheme Cluster Segmentation** - Full UAX #29 implementation
- **Emoji Support** - Regional indicators, ZWJ sequences, skin tone modifiers
- **Script Support** - Devanagari, Bengali, and other complex scripts
- **Width Calculation** - East Asian Width property support
- **Dual APIs** - TypeScript-native and Go-compatible interfaces

### Technical

- TypeScript with strict type checking
- ESM modules with proper exports
- Zero runtime dependencies
- Cross-platform compatibility (Windows, macOS, Linux)
- Bun and Node.js support
- Comprehensive CI/CD pipeline
- Automated Go compatibility testing

## [1.0.0] - TBD

Initial release - complete TypeScript port of rivo/uniseg with 100% API compatibility.
