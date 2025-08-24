# TSPort Test Architecture

## Overview

The test system for TSPort projects is designed to ensure 100% compatibility with the Go implementation. This document describes the standardized test architecture that should be implemented in all TSPort projects.

## Directory Structure

```
test/
├── README.md                      # This documentation
├── corpus/                        # Test case definitions (single Go module)
│   ├── go.mod                     # Single Go module for all test cases
│   ├── go.sum                     # Go dependencies lockfile
│   └── {category}/                # Package-specific test categories (see below)
├── snapshots/                     # Go reference outputs
│   └── {category}/                # Package-specific snapshot categories (mirrors corpus)
├── automation/                    # Test automation and tooling
│   ├── README.md                  # Automation documentation
│   ├── reference/                 # Go reference implementation (git submodule)
│   ├── patches/                   # Reference patches for testing compatibility
│   │   ├── applied-patches.json   # Tracks applied patches
│   │   └── *.patch                # Patch files
│   └── *.ts                       # Automation scripts
├── utils/                         # Shared testing utilities
│   ├── comparison.ts              # Output comparison functions
│   ├── setup.ts                   # Test environment setup
│   └── test-filter.ts             # Test filtering utilities
├── automated-cases.test.ts        # Automated test case runner
├── examples-comparison.test.ts    # Example compatibility tests
└── basic.test.ts                 # Manual unit tests for edge cases
```

## Test Categories

### 1. Corpus (Test Cases)

The `test/corpus/` directory contains all test case definitions, organized by package-specific categories. Common categories include:

- **basic**: Fundamental API operations and core functionality
- **advanced**: Complex feature combinations and sophisticated usage patterns
- **component**: Component-specific functionality (if applicable)
- **example**: Real-world usage examples from the Go package documentation
- **edge-case**: Error conditions, boundary values, and unusual inputs

**Note**: The specific categories depend on the Go package being ported. For example:

- **Color libraries**: May have `color/`, `palette/`, `conversion/` categories
- **CLI libraries**: May have `command/`, `flag/`, `parsing/` categories
- **UI libraries**: May have `layout/`, `styling/`, `interaction/` categories
- **Parser libraries**: May have `syntax/`, `semantic/`, `lexer/` categories

Each test case directory contains:

- `case.go` - Go reference implementation
- `case.ts` - TypeScript implementation
- `metadata.json` - Test case metadata

The entire corpus uses a single Go module located at `test/corpus/go.mod` for simplified dependency management.

#### Test Case Metadata Format

```json
{
  "name": "Basic Color Red",
  "description": "Tests basic red foreground color rendering",
  "category": "basic",
  "tags": ["color", "foreground", "basic"],
  "environments": ["FORCE_COLOR=3"],
  "skipReasons": [],
  "expectedFailures": []
}
```

### 2. Snapshots (Reference Outputs)

The `test/snapshots/` directory contains Go reference outputs organized by category. These are generated from the Go implementations and serve as the source of truth for compatibility testing.

Snapshot files are named `{case-name}.go.out` and contain the expected output that TypeScript implementations must match exactly.

### 3. Test Suites

#### Automated Cases (`automated-cases.test.ts`)

- Discovers all test cases in the corpus
- Runs both Go and TypeScript versions
- Compares outputs for exact matches
- Supports multiple environments (color settings, terminal types, etc.)
- Includes performance and consistency testing

#### Examples Comparison (`examples-comparison.test.ts`)

- Tests real-world examples from the Go package documentation
- Validates output structure and content
- Ensures examples work consistently across runs
- Provides detailed diff analysis for failures

#### Basic Unit Tests (`basic.test.ts`)

- Manual unit tests for edge cases that can't be easily automated
- TypeScript-specific functionality testing
- Error handling and boundary condition testing

## Test Automation System

### Git Submodule Integration

The `test/automation/reference/` directory contains a Git submodule pointing to the official Go package repository:

- Automatically tracks the source Go package releases
- Uses `patches/` directory for test-specific modifications
- Common patches include: force output modes, disable TTY detection, test-specific configurations

### Patch Management

The `test/automation/patches/` directory contains modifications needed for testing compatibility:

- **applied-patches.json** - Tracks which patches have been applied
- **FORCE_OUTPUT.patch** - Forces specific output modes in non-TTY environments
- **DISABLE_TTY.patch** - Disables TTY detection for consistent testing
- **TEST_SPECIFIC.patch** - Package-specific test modifications

## Test Filtering

All test suites support filtering via the `--filter` parameter:

```bash
# Run only specific category tests
bun test --filter {category}

# Run specific test case  
bun test --filter "specific-test-name"

# Run by tag
bun test --filter {tag}
```

Filter matching works on:

- Test case names
- Categories
- Tags
- Test IDs

## Running Tests

### All Tests

```bash
bun test
```

### Specific Test Suite

```bash
bun test automated-cases.test.ts
bun test examples-comparison.test.ts
bun test basic.test.ts
```

### With Filtering

```bash
bun test --filter basic
bun test automated-cases.test.ts --filter component
```

### Environment-Specific Testing

```bash
# Test with different output modes
FORCE_COLOR=3 bun test
NO_COLOR=1 bun test

# Test with different terminal settings
TERM=xterm-256color bun test
```

## Test Development Workflow

### Adding New Test Cases

1. Create a new directory in the appropriate `test/corpus/{category}/` subdirectory
2. Follow the naming convention: `{number}-{description}`
3. Include required files:
   - `case.go` - Go implementation
   - `case.ts` - TypeScript implementation
   - `metadata.json` - Test metadata

**Note**: Categories should match the specific needs of your Go package. Create categories that logically group related functionality.

### Updating Reference Outputs

Reference outputs in `test/snapshots/` are generated from the Go implementations:

```bash
# Update reference repository
cd test/automation/reference
git pull origin main

# Regenerate snapshots
bun run update-snapshots
```

### Managing Patches

When updating the reference submodule:

```bash
# Update submodule to new version
cd test/automation/reference/
git fetch origin
git checkout v1.x.x  # New version

# Reapply all patches
cd ..
for patch in $(cat patches/applied-patches.json | jq -r '.[]'); do
    cd reference/
    patch -p1 < ../patches/$patch
    cd ..
done
```

## Test Utilities

### Comparison Functions (`utils/comparison.ts`)

- `compareOutputs()` - Detailed output comparison with diff analysis
- `runExample()` - Execute example programs in both Go and TypeScript
- `formatComparisonResult()` - Format comparison results for display
- `detectDifferences()` - Character-level difference detection

### Test Filtering (`utils/test-filter.ts`)

- `getTestFilter()` - Extract filter from CLI arguments or environment
- `applyFilter()` - Filter test arrays by name/category/tags
- `logFilterInfo()` - Display filtering information

### Setup Utilities (`utils/setup.ts`)

- `setupTestEnvironment()` - Configure test environment variables
- `cleanupTestArtifacts()` - Clean up temporary test files
- `validateTestStructure()` - Validate test directory structure

## Compatibility Testing Strategy

1. **Byte-Level Comparison**: All outputs must match the Go implementation exactly
2. **Multi-Environment Testing**: Tests run under different environment configurations
3. **Performance Validation**: Ensure reasonable execution times compared to Go
4. **Consistency Checks**: Multiple runs should produce identical outputs
5. **Error Handling**: Test error conditions and edge cases match Go behavior

## Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "bun test",
    "test:compatibility": "bun test automated-cases.test.ts",
    "test:examples": "bun test examples-comparison.test.ts",
    "test:init-reference": "cd test/automation && git submodule update --init --recursive",
    "test:update-snapshots": "bun run test/automation/update-snapshots.ts",
    "test:apply-patches": "bun run test/automation/apply-patches.ts"
  }
}
```

## Troubleshooting

### Common Issues

1. **Path Errors**: Ensure all imports use correct relative paths
2. **Filter Not Working**: Check `--filter` parameter is passed correctly to test runner
3. **Snapshot Mismatches**: Verify Go reference implementation is up to date
4. **Performance Issues**: Use filtering to run smaller test subsets during development
5. **Patch Failures**: Ensure patches are compatible with current Go package version

### Debug Mode

Enable detailed logging:

```bash
DEBUG=1 bun test
VERBOSE=1 bun test
```

## Implementation Checklist

When setting up testing for a new TSPort project:

- [ ] Create `test/corpus/` directory structure
- [ ] Set up Go submodule in `test/automation/reference/`
- [ ] Configure single `go.mod` for all test cases
- [ ] Implement `automated-cases.test.ts`
- [ ] Implement `examples-comparison.test.ts`
- [ ] Create test utilities in `utils/`
- [ ] Set up snapshot generation system
- [ ] Configure package scripts
- [ ] Document package-specific test considerations
- [ ] Set up CI/CD integration for automated testing

## Architecture Benefits

1. **Standardization**: Consistent testing approach across all TSPort projects
2. **Automation**: Minimal manual intervention required for comprehensive testing
3. **Maintainability**: Clear separation of concerns and organized structure
4. **Extensibility**: Easy to add new test categories and cases
5. **Reliability**: Comprehensive coverage ensures Go compatibility is maintained
6. **Developer Experience**: Clear documentation and tooling for contributors
