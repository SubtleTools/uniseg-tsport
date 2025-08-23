# Go-to-TypeScript Port Setup Guide

This guide explains how to create a new TypeScript port of a Go library using the test strategy demonstrated in this Lipgloss-TS project.

## Prerequisites

- [Bun](https://bun.sh/) - JavaScript/TypeScript runtime and package manager
- [Go](https://golang.org/) - For running reference implementations
- [Git](https://git-scm.com/) - For version control and submodules
- Basic familiarity with both Go and TypeScript

## Project Structure Setup

### 1. Initialize TypeScript Project

```bash
# Create project directory
mkdir my-go-ts-port
cd my-go-ts-port

# Initialize with bun
bun init

# Install essential dependencies
bun add -d @types/node typescript
bun add -d bun-types

# Create optimal TypeScript configuration for Bun
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    // Target and Module - Modern ES for Bun compatibility
    "target": "ESNext",
    "module": "ESNext", 
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    
    // Import/Export behavior
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    
    // Declaration generation for library distribution
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    
    // Bun-specific optimizations
    "verbatimModuleSyntax": false, // Allow flexibility for Bun's handling
    "isolatedModules": true, // Required for fast builds
    
    // Type checking strictness
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    
    // Additional code quality checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noPropertyAccessFromIndexSignature": false,
    
    // Performance and compatibility
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*", 
    "test/**/*"
  ],
  "exclude": [
    "node_modules", 
    "dist", 
    "test/automation/reference",
    "test/corpus/**/*.go"
  ]
}
EOF
```

### 2. Create Source Structure

```bash
# Create source directories
mkdir -p src
mkdir -p examples

# Create basic package.json scripts
cat > package.json << EOF
{
  "name": "my-go-ts-port",
  "version": "0.1.0",
  "description": "TypeScript port of Go library",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "bun run build:clean && bun run build:compile",
    "build:clean": "rm -rf dist",
    "build:compile": "bun build src/index.ts --outdir dist --target node",
    "dev": "bun run --watch src/index.ts",
    "test": "bun test",
    "test:filter": "bun test --filter",
    "test:compatibility": "bun test automated-cases.test.ts",
    "test:examples": "bun test examples-comparison.test.ts",
    "test:visual": "bun test visual-diff.test.ts",
    "lint": "tsc --noEmit",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "latest",
    "bun-types": "latest",
    "typescript": "latest"
  }
}
EOF
```

## Test Architecture Setup

### 3. Create Test Structure

```bash
# Create comprehensive test structure
mkdir -p test/{corpus,snapshots,automation,utils}
mkdir -p test/corpus/{basic,advanced,component,example}
mkdir -p test/snapshots/{basic,advanced,component,example}
mkdir -p test/automation/patches
```

### 4. Add Go Reference as Git Submodule

```bash
# Add the original Go library as a git submodule
git submodule add https://github.com/original/go-library.git test/automation/reference

# Initialize and update the submodule
git submodule update --init --recursive

# Pin to a specific version (recommended)
cd test/automation/reference
git checkout v1.0.0  # Replace with desired version
cd ../../..
git add test/automation/reference
git commit -m "pin reference implementation to v1.0.0"
```

### 5. Create Single Go Module for Test Corpus

```bash
# Create unified Go module for all test cases
cd test/corpus

cat > go.mod << EOF
module test-corpus

go 1.21

require (
    github.com/original/go-library v1.0.0  // Replace with actual module
)
EOF

# Initialize Go module
go mod tidy
cd ../..
```

### 6. Create Test Utilities

```bash
# Create comparison utilities
cat > test/utils/comparison.ts << EOF
import { execSync } from 'child_process';
import { join } from 'path';

export interface ComparisonResult {
  match: boolean;
  tsOutput: string;
  goOutput: string;
  differences?: Array<{
    position: number;
    tsChar: string;
    goChar: string;
    context: { ts: string; go: string };
  }>;
}

export function runTestCase(testPath: string, isGo: boolean, env: Record<string, string> = {}): string {
  const filename = isGo ? 'case.go' : 'case.ts';
  const command = isGo ? \`go run \${filename}\` : \`bun run \${filename}\`;
  
  try {
    return execSync(command, {
      cwd: testPath,
      encoding: 'utf8',
      env: { ...process.env, ...env }
    }).trim();
  } catch (error) {
    throw new Error(\`Failed to run \${isGo ? 'Go' : 'TypeScript'} test case: \${error}\`);
  }
}

export function compareOutputs(tsOutput: string, goOutput: string): ComparisonResult {
  if (tsOutput === goOutput) {
    return { match: true, tsOutput, goOutput };
  }

  const differences = [];
  const maxLength = Math.max(tsOutput.length, goOutput.length);
  
  for (let i = 0; i < maxLength; i++) {
    const tsChar = tsOutput[i] || '';
    const goChar = goOutput[i] || '';
    
    if (tsChar !== goChar) {
      const start = Math.max(0, i - 20);
      const end = Math.min(maxLength, i + 20);
      
      differences.push({
        position: i,
        tsChar,
        goChar,
        context: {
          ts: tsOutput.substring(start, end),
          go: goOutput.substring(start, end)
        }
      });
      
      if (differences.length >= 5) break; // Limit differences for readability
    }
  }

  return { match: false, tsOutput, goOutput, differences };
}
EOF

# Create test filter utilities  
cat > test/utils/test-filter.ts << EOF
export const getTestFilter = (): string | undefined => {
  const args = process.argv;
  const filterIndex = args.findIndex(arg => arg === '--filter');
  if (filterIndex !== -1 && filterIndex + 1 < args.length) {
    return args[filterIndex + 1];
  }
  return process.env.TEST_FILTER;
};

export const applyFilter = <T extends { name?: string; category?: string; id?: string }>(
  items: T[], 
  filter?: string
): T[] => {
  if (!filter) return items;
  
  const lowerFilter = filter.toLowerCase();
  return items.filter(item => 
    (item.name && item.name.toLowerCase().includes(lowerFilter)) ||
    (item.category && item.category.toLowerCase().includes(lowerFilter)) ||
    (item.id && item.id.toLowerCase().includes(lowerFilter))
  );
};

export const logFilterInfo = <T extends { name?: string; id?: string }>(
  filter: string | undefined,
  originalItems: T[],
  filteredItems: T[],
  itemType: string = 'items'
): void => {
  if (filter) {
    console.log(\`🔍 Filter applied: "\${filter}"\`);
    console.log(\`📋 Found \${filteredItems.length}/\${originalItems.length} matching \${itemType}\`);
  }
};
EOF
```

### 7. Create Test Runners

```bash
# Create automated test case runner
cat > test/automated-cases.test.ts << EOF
import { describe, test, expect } from 'bun:test';
import { join } from 'path';
import { readdirSync, statSync, readFileSync } from 'fs';
import { compareOutputs, runTestCase } from './utils/comparison';
import { getTestFilter, applyFilter, logFilterInfo } from './utils/test-filter';

const FILTER = getTestFilter();
const projectRoot = join(__dirname, '..');
const testCasesRoot = join(projectRoot, 'test/corpus');

interface TestCase {
  id: string;
  name: string;
  category: string;
  path: string;
  metadata?: any;
}

function discoverTestCases(): TestCase[] {
  const cases: TestCase[] = [];
  
  const categories = readdirSync(testCasesRoot)
    .filter(item => statSync(join(testCasesRoot, item)).isDirectory())
    .filter(item => !['node_modules', '.git'].includes(item));
  
  for (const category of categories) {
    const categoryPath = join(testCasesRoot, category);
    const testDirs = readdirSync(categoryPath)
      .filter(item => statSync(join(categoryPath, item)).isDirectory());
    
    for (const testDir of testDirs) {
      const testPath = join(categoryPath, testDir);
      const goFile = join(testPath, 'case.go');
      const tsFile = join(testPath, 'case.ts');
      
      try {
        statSync(goFile);
        statSync(tsFile);
        
        let metadata = {};
        try {
          const metadataFile = join(testPath, 'metadata.json');
          metadata = JSON.parse(readFileSync(metadataFile, 'utf8'));
        } catch {
          // metadata is optional
        }
        
        cases.push({
          id: testDir,
          name: testDir.replace(/^\\d+-/, '').replace(/-/g, ' '),
          category,
          path: testPath,
          metadata
        });
      } catch {
        // Skip invalid test cases
      }
    }
  }
  
  return cases.sort((a, b) => a.id.localeCompare(b.id));
}

const allTestCases = discoverTestCases();
const testCases = applyFilter(allTestCases, FILTER);
logFilterInfo(FILTER, allTestCases, testCases, 'test cases');

describe('Automated Compatibility Tests', () => {
  testCases.forEach((testCase) => {
    test(\`\${testCase.category}/\${testCase.id} should match Go output exactly\`, async () => {
      const env = { FORCE_COLOR: '3' };
      
      const tsOutput = runTestCase(testCase.path, false, env);
      const goOutput = runTestCase(testCase.path, true, env);
      
      const result = compareOutputs(tsOutput, goOutput);
      
      if (!result.match && result.differences) {
        console.log(\`\\nDifferences in \${testCase.category}/\${testCase.id}:\`);
        result.differences.forEach((diff, i) => {
          console.log(\`  \${i + 1}. At position \${diff.position}: '\${diff.tsChar}' != '\${diff.goChar}'\`);
        });
      }
      
      expect(result.match).toBe(true);
    }, 30000);
  });
});
EOF
```

## Creating Test Cases

### 8. Create Your First Test Case

```bash
# Create a basic test case
mkdir -p test/corpus/basic/001-hello-world

# Create Go test case
cat > test/corpus/basic/001-hello-world/case.go << EOF
package main

import (
    "fmt"
    "github.com/original/go-library"  // Replace with actual import
)

func main() {
    // Replace with actual Go library usage
    result := library.HelloWorld("Test")
    fmt.Print(result)
}
EOF

# Create TypeScript test case  
cat > test/corpus/basic/001-hello-world/case.ts << EOF
import { helloWorld } from '../../../src/index';  // Replace with actual import

// Replace with actual TypeScript library usage
const result = helloWorld("Test");
process.stdout.write(result);
EOF

# Create metadata
cat > test/corpus/basic/001-hello-world/metadata.json << EOF
{
  "name": "Hello World Basic",
  "description": "Basic hello world functionality test",
  "category": "basic", 
  "tags": ["hello", "basic"],
  "environments": ["FORCE_COLOR=3"]
}
EOF
```

### 9. Initialize Go Dependencies

```bash
# From the corpus directory, ensure Go dependencies are ready
cd test/corpus
go mod tidy
cd ../..

# Verify the test case works
cd test/corpus/basic/001-hello-world
go run case.go  # Should run without errors
cd ../../../..
```

## Running the Test System

### 10. Test Your Setup

```bash
# Run all tests
bun test

# Run with filter
bun test --filter hello

# Run specific test suite
bun test automated-cases.test.ts

# Check TypeScript compilation
bun run typecheck
```

## Best Practices

### Test Case Organization

1. **Naming Convention**: Use `{number}-{description}` format
2. **Categories**: Group related functionality (basic, advanced, component, etc.)
3. **Dependencies**: Start with basic functionality, build up to complex features
4. **Metadata**: Always include descriptive metadata.json files

### Development Workflow

1. **Start Simple**: Begin with the most basic functionality
2. **Build Incrementally**: Add one feature at a time with corresponding tests
3. **Verify Continuously**: Run tests frequently to catch regressions early
4. **Document Changes**: Update README files as the project evolves

### Go Module Management

- **Single Module**: Use one go.mod in test/corpus for all test cases
- **Local Reference**: Use `replace` directive to point to local reference submodule
- **Dependency Updates**: Update go.mod when adding new test cases requiring additional dependencies

### Patch Management

The automation system supports monkey-patching the reference implementation:

1. **Create Patches Directory**: `mkdir -p test/automation/patches`
2. **Track Applied Patches**: Use `applied-patches.json` to track what's been applied
3. **Common Patches**: 
   - **FORCE_COLOR.patch** - Force color output in non-TTY environments
   - **TTY_DETECTION.patch** - Disable TTY detection for consistent testing
   - **TEST_MODE.patch** - Enable test-specific behaviors

#### Creating and Applying Patches

```bash
# Make changes to reference implementation  
cd test/automation/reference/
# Edit files as needed...

# Create patch
cd ..
git diff --no-index reference/ > patches/my-fix.patch

# Apply patch systematically
cd reference/
patch -p1 < ../patches/my-fix.patch

# Track applied patches
echo '"my-fix.patch"' >> patches/applied-patches.json
```

#### Why Patches Are Needed

- **Testing Environment**: Force consistent output in CI/automated environments
- **Compatibility Testing**: Modify behavior to match testing expectations
- **Bug Fixes**: Apply temporary fixes while waiting for upstream updates
- **Test-Specific Logic**: Add debugging or test-specific code paths

### Git Submodule Management

```bash
# Update reference implementation
cd test/automation/reference
git fetch origin
git checkout v1.1.0  # New version
cd ..

# Reapply patches if any exist
if [ -f patches/applied-patches.json ]; then
    for patch in $(cat patches/applied-patches.json | jq -r '.[]'); do
        cd reference/
        patch -p1 < ../patches/$patch
        cd ..
    done
fi

cd ../../..
git add test/automation/reference
git commit -m "update reference implementation to v1.1.0"

# Update all submodules
git submodule update --remote --recursive
```

## Customization Points

### Adapting for Your Library

1. **Replace Import Paths**: Update all import statements to match your library
2. **Modify Test Runners**: Adjust test discovery and execution logic as needed
3. **Add Custom Categories**: Create additional test categories specific to your library
4. **Extend Utilities**: Add domain-specific comparison and helper functions
5. **Configure Build Tools**: Adjust TypeScript/build configuration for your needs

### Environment Setup

```bash
# Create .env file for local development
cat > .env << EOF
# Test filtering
TEST_FILTER=

# Debugging
DEBUG=false
VERBOSE=false

# Color output
FORCE_COLOR=3
EOF
```

This setup provides a robust foundation for creating high-quality TypeScript ports of Go libraries with comprehensive compatibility testing.