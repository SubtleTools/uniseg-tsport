# Contributing to @tsports/uniseg

Thank you for your interest in contributing to @tsports/uniseg! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Go Compatibility](#go-compatibility)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Issues

- Use the [GitHub issue tracker](https://github.com/tsports/uniseg/issues)
- Check existing issues before creating a new one
- Use the appropriate issue template (bug report or feature request)
- Provide clear, detailed information and reproduction steps

### Suggesting Features

- Create a feature request issue using the template
- Explain the use case and expected behavior
- If the feature exists in Go rivo/uniseg, provide a reference
- Be prepared to discuss the implementation approach

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes** following our coding standards
4. **Add or update tests** as needed
5. **Ensure all tests pass** including Go compatibility tests
6. **Update documentation** if needed
7. **Submit a pull request** using our template

## Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Bun** (recommended package manager)
- **Go** 1.21+ (for compatibility testing)
- **Git** with submodules support

### Setup Steps

```bash
# Clone the repository with submodules
git clone --recursive https://github.com/tsports/uniseg.git
cd uniseg

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test

# Test Go compatibility
cd test/corpus/basic/001-grapheme-count
go run case.go > go-output.txt
bun --bun run case.ts > ts-output.txt
diff go-output.txt ts-output.txt  # Should show no differences
```

### Development Commands

```bash
# Install dependencies
bun install

# Build TypeScript to JavaScript
bun run build

# Clean build artifacts
bun run build:clean

# Run all tests
bun test

# Run specific test file
bun test test/automated-cases.test.ts

# Type checking only
bun run build --noEmit

# Watch mode for development
bun --watch src/index.ts
```

## Project Structure

```
src/
├── index.ts              # Main exports (TypeScript-style API)
├── go-style.ts           # Go-compatible API wrapper
├── core.ts               # Core grapheme cluster functions
├── properties.ts         # Unicode property tables and lookups
├── grapheme-rules.ts     # Grapheme cluster state machine
├── step.ts               # Combined boundary detection step function
├── width.ts              # Character width calculation
├── types.ts              # TypeScript type definitions
└── utils.ts              # Utility functions

test/
├── automated-cases.test.ts    # Main compatibility tests
├── corpus/                    # Test cases
│   └── basic/001-grapheme-count/
│       ├── case.go           # Go reference implementation
│       ├── case.ts           # TypeScript test case
│       └── metadata.json     # Test metadata
├── reference/            # Go rivo/uniseg submodule (v0.4.7)
└── utils/                # Test utilities

.github/
├── workflows/            # GitHub Actions
├── ISSUE_TEMPLATE/       # Issue templates
└── PULL_REQUEST_TEMPLATE.md
```

### Key Files

- **`src/index.ts`** - Main TypeScript API exports
- **`src/go-style.ts`** - Go-compatible API with identical naming
- **`src/core.ts`** - Core grapheme cluster segmentation logic
- **`src/properties.ts`** - Unicode property tables (15.0.0)
- **`src/grapheme-rules.ts`** - State machine implementing UAX #29
- **`test/reference/`** - Git submodule of Go rivo/uniseg for comparison

## Testing

### Test Structure

We maintain 100% compatibility with the Go rivo/uniseg library through comprehensive testing:

1. **Automated Compatibility Tests** - Compare outputs with Go reference
2. **Property Tables Tests** - Verify Unicode property lookups
3. **State Machine Tests** - Test grapheme cluster boundary detection
4. **API Tests** - Test both TypeScript and Go-style APIs

### Running Tests

```bash
# Run all tests
bun test

# Run with verbose output
bun test --verbose

# Run specific test patterns
bun test grapheme
bun test compatibility

# Generate coverage report
bun test --coverage
```

### Adding New Tests

When adding new functionality:

1. **Add test cases** in `test/corpus/` following the existing pattern
2. **Include Go reference** if testing compatibility
3. **Test both APIs** (TypeScript-style and Go-style)
4. **Add edge cases** and Unicode examples

Example test structure:

```
test/corpus/new-feature/001-test-name/
├── case.go           # Go reference implementation
├── case.ts           # TypeScript implementation
└── metadata.json     # Test description and expected results
```

## Go Compatibility

Maintaining 100% compatibility with Go rivo/uniseg is our primary goal.

### Compatibility Requirements

1. **Identical Output** - All functions must produce identical output to Go
2. **API Parity** - Go-style API must match exactly
3. **Unicode Standards** - Follow same Unicode version (15.0.0)
4. **Edge Cases** - Handle all Go edge cases identically

### Testing Go Compatibility

```bash
# Test specific case
cd test/corpus/basic/001-grapheme-count
go run case.go        # Run Go version
bun --bun run case.ts # Run TypeScript version
diff <(go run case.go) <(bun --bun run case.ts)

# Should output nothing if compatible
```

### Go Reference Integration

The Go reference is included as a Git submodule:

```bash
# Update Go reference to latest version
cd test/reference
git pull origin main
cd ../..
git add test/reference
git commit -m "Update Go reference"
```

### Adding Unicode Test Cases

When adding support for new Unicode scripts or emoji sequences:

1. **Test with Go first** to get expected output
2. **Add comprehensive examples** including edge cases
3. **Include complex sequences** (ZWJ, modifiers, etc.)
4. **Verify against Unicode standards** (UAX #29, etc.)

## Submitting Changes

### Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following coding standards

3. **Test thoroughly**:
   ```bash
   bun test                    # All tests
   bun run build              # Type checking
   # Test Go compatibility for changed functionality
   ```

4. **Commit with clear messages** following [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add support for new Unicode property"
   git commit -m "fix: handle edge case in emoji sequences"
   git commit -m "docs: update API documentation"
   ```

5. **Push and create Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Requirements

- [ ] All tests pass (`bun test`)
- [ ] Build succeeds (`bun run build`)
- [ ] Go compatibility maintained (if applicable)
- [ ] Documentation updated (if needed)
- [ ] PR template filled out completely

### Code Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Maintainer review** for code quality and design
3. **Go compatibility verification** for behavior changes
4. **Documentation review** for public API changes

## Coding Standards

### TypeScript Style

- **ESM modules** with `.js` imports (for TypeScript compatibility)
- **Explicit types** for all public APIs
- **Immutable patterns** where possible
- **Clear naming** following TypeScript conventions

### API Design Principles

1. **Dual API Support**:
   - TypeScript-native API (camelCase, modern patterns)
   - Go-compatible API (PascalCase, exact Go naming)

2. **Type Safety**:
   - Strong typing for all public APIs
   - Generic types where appropriate
   - Clear return types and parameter types

3. **Performance**:
   - Efficient algorithms
   - Minimal allocations
   - Fast property lookups

4. **Compatibility**:
   - Identical behavior to Go reference
   - Same Unicode version support
   - Consistent error handling

### File Organization

- **One main export per file** when possible
- **Clear separation of concerns**
- **Logical grouping** (properties, rules, algorithms)
- **Consistent imports** using relative paths with `.js` extension

## Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with release notes
3. **Ensure all tests pass** and compatibility is maintained
4. **Create GitHub release** with tag
5. **Automated publishing** via GitHub Actions

### Pre-release Checklist

- [ ] All tests passing on all supported platforms
- [ ] Go compatibility verified
- [ ] Documentation updated
- [ ] Performance benchmarks run
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)

## Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Documentation** - Check README.md and code comments
- **Go Reference** - Consult original rivo/uniseg documentation

## Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Special mentions for major features or fixes

Thank you for contributing to @tsports/uniseg! 🎉
