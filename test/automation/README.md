# TSPort Test Automation System

## Overview

This directory contains the automated test system for ensuring 100% compatibility between the TypeScript port and the Go reference implementation. This system is standardized across all TSPort projects to provide consistent testing methodology.

## Architecture

### 1. Git Submodule Integration

- `reference/` - Git submodule pointing to the official Go package repository
- Automatically tracks the source Go package releases
- Uses `patches/` directory for monkey-patching the reference when needed
- Common patches include: force output modes, disable TTY detection, test-specific modifications

### 2. Test Case Structure

```
test/corpus/
├── go.mod                         # Single Go module for all test cases
├── go.sum                         # Go dependencies lockfile
├── basic/
│   ├── 001-fundamental-api/
│   │   ├── case.go
│   │   ├── case.ts
│   │   └── metadata.json
│   └── 002-core-operations/
├── advanced/
├── component/
├── example/
└── edge-case/
```

### 3. Dependency Analysis

- Automatic dependency graph generation from Go source
- Test execution order based on API complexity hierarchy
- Ensures foundational features are tested before complex combinations

### 4. Automated Execution

- Single command runs all compatibility tests
- Version-specific output comparison
- Detailed diff reporting for failures

## Usage

```bash
# Initialize and update reference
bun run test:init-reference

# Run all compatibility tests
bun run test:compatibility

# Run specific test category
bun run test:compatibility -- --filter=basic

# Update expected outputs from Go reference
bun run test:update-snapshots
```

## Patch Management

### Purpose of Patches

Patches are necessary to make the Go reference implementation suitable for automated testing:

- **Environment Consistency**: Force specific output modes regardless of terminal capabilities
- **Deterministic Behavior**: Disable environment-dependent features that vary between systems
- **Test-Specific Modifications**: Enable debug modes or expose internal state for testing

### Common Patch Types

#### FORCE_OUTPUT.patch

Forces consistent output formatting:

```diff
-if isatty.IsTerminal(os.Stdout.Fd()) {
+if true {  // Always force output for testing
    // Enable color output
}
```

#### DISABLE_TTY.patch

Disables TTY detection for consistent testing:

```diff
-func detectTerminal() bool {
-    return isatty.IsTerminal(os.Stdout.Fd())
+func detectTerminal() bool {
+    return true  // Always assume terminal for testing
}
```

#### DEBUG_MODE.patch

Enables debug output for detailed analysis:

```diff
+func enableDebugMode() {
+    debugMode = true
+}
```

### Applying Patches

The `patches/` directory contains modifications needed for testing compatibility:

- **applied-patches.json** - Tracks which patches have been applied
- **{FEATURE}.patch** - Individual patch files for specific modifications

### Creating New Patches

```bash
# Make changes in the reference directory
cd reference/
# Edit files as needed

# Create patch from changes
cd ..
git diff --no-prefix reference/ > patches/new-feature.patch

# Apply patch systematically
cd reference/
patch -p0 < ../patches/new-feature.patch

# Track applied patches
echo '"new-feature.patch"' | jq '. as $new | $applied + [$new]' patches/applied-patches.json > tmp.json
mv tmp.json patches/applied-patches.json
```

### Updating Reference with Patches

When updating the reference submodule:

```bash
# Update submodule
cd reference/
git fetch origin
git checkout v1.x.x  # New version tag

# Reapply all patches
cd ..
for patch in $(cat patches/applied-patches.json | jq -r '.[]'); do
    echo "Applying patch: $patch"
    cd reference/
    patch -p0 < ../patches/$patch
    if [ $? -ne 0 ]; then
        echo "Patch $patch failed - manual resolution required"
        exit 1
    fi
    cd ..
done
```

### Patch Validation

After applying patches, validate they work correctly:

```bash
# Test patch application
bun run test:validate-patches

# Run quick compatibility check
bun run test:compatibility -- --filter=basic
```

## Test Case Categories

### Standard Categories for All TSPort Projects

1. **Basic API** - Core operations, fundamental functionality
2. **Advanced** - Complex combinations, sophisticated usage patterns
3. **Component** - Package-specific components (tables, parsers, UI elements, etc.)
4. **Example** - Real-world examples from the Go package documentation
5. **Edge-case** - Error conditions, boundary values, unusual inputs

### Category-Specific Considerations

Different Go packages may require additional categories:

- **CLI packages**: Add `command/` and `flag/` categories
- **Parser packages**: Add `syntax/` and `semantic/` categories
- **UI packages**: Add `layout/`, `color/`, `interaction/` categories
- **Network packages**: Add `protocol/` and `connection/` categories

## Automation Scripts

### Core Automation Files

- `update-snapshots.ts` - Regenerate reference outputs from Go implementations
- `apply-patches.ts` - Apply all patches to reference implementation
- `validate-structure.ts` - Validate test directory structure
- `analyze-dependencies.ts` - Analyze Go package dependencies for test ordering

### Script Templates

Each TSPort project should include these standard automation scripts:

#### update-snapshots.ts

```typescript
// Regenerate all reference outputs from Go implementations
// Runs Go test cases and captures their outputs
// Updates snapshot files in test/snapshots/
```

#### apply-patches.ts

```typescript
// Apply all patches from patches/applied-patches.json
// Validates patch application success
// Provides rollback capability if patches fail
```

#### validate-structure.ts

```typescript
// Validates test directory structure matches expected layout
// Checks for required files in test cases
// Verifies Go module configuration
```

## Integration with CI/CD

### GitHub Actions Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Initialize test reference
  run: bun run test:init-reference

- name: Apply test patches
  run: bun run test:apply-patches

- name: Run compatibility tests
  run: bun run test:compatibility

- name: Upload test artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: test-failures
    path: test/output/
```

### Test Environments

Configure multiple test environments:

```yaml
strategy:
  matrix:
    environment:
      - FORCE_COLOR=1
      - FORCE_COLOR=3
      - NO_COLOR=1
      - TERM=xterm-256color
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Reference Updates**: Monitor Go package releases and update submodule
2. **Patch Maintenance**: Ensure patches remain compatible with new Go versions
3. **Test Coverage**: Add new test cases for newly discovered edge cases
4. **Performance Monitoring**: Track test execution times and optimize as needed

### Automated Monitoring

Set up automated monitoring for:

- Go package release notifications
- Test failure alerts
- Performance regression detection
- Patch compatibility issues

## Package-Specific Customization

While the overall structure is standardized, each TSPort project may need specific customizations:

### Environment Variables

```bash
# Package-specific environment settings
export PKG_SPECIFIC_VAR=value
export TEST_MODE=compatibility
```

### Custom Test Categories

```typescript
// Add package-specific test categories
const customCategories = ['parsing', 'rendering', 'networking'];
```

### Specialized Utilities

```typescript
// Package-specific test utilities
export function validatePackageOutput(output: string): boolean {
    // Custom validation logic
}
```

## Troubleshooting

### Common Issues

1. **Patch Application Failures**
   - Check if Go package structure has changed
   - Update patch files to match new code structure
   - Verify patch format (p0 vs p1)

2. **Submodule Update Issues**
   - Ensure Git credentials are configured
   - Check if submodule URL has changed
   - Verify network connectivity

3. **Test Execution Failures**
   - Verify Go toolchain is installed and accessible
   - Check environment variables are set correctly
   - Ensure test data is properly structured

### Debug Commands

```bash
# Verbose test execution
DEBUG=1 VERBOSE=1 bun run test:compatibility

# Patch application debugging
DEBUG_PATCHES=1 bun run test:apply-patches

# Reference validation
bun run test:validate-reference
```

## Best Practices

1. **Patch Management**: Keep patches minimal and well-documented
2. **Test Organization**: Follow consistent naming and structure conventions
3. **Environment Isolation**: Use clean environments for reliable test results
4. **Version Tracking**: Maintain clear mapping between Go versions and test expectations
5. **Documentation**: Document any package-specific testing requirements

This automation system ensures consistent, reliable compatibility testing across all TSPort projects while allowing for package-specific customizations when necessary.
