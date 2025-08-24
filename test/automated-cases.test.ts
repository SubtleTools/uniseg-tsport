import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { compareOutputs, runTestCase } from './utils/comparison';
import { applyFilter, getTestFilter, logFilterInfo } from './utils/test-filter';

const FILTER = getTestFilter();

// Get the correct project root - works in both source and compiled environments
let projectRoot: string;
if (typeof __dirname !== 'undefined') {
  // Node.js/CommonJS environment or compiled TypeScript
  const currentDir = __dirname;
  // Check if we're in dist directory and adjust accordingly
  if (currentDir.includes('/dist/')) {
    // We're in compiled output (dist/test/), go up to package root (../../)
    projectRoot = join(currentDir, '../../');
  } else {
    // We're running from source (test/), go up to package root (..)
    projectRoot = join(currentDir, '..');
  }
} else {
  // ES modules environment
  projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
}

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
    .filter((item) => statSync(join(testCasesRoot, item)).isDirectory())
    .filter((item) => !['node_modules', '.git'].includes(item));

  for (const category of categories) {
    const categoryPath = join(testCasesRoot, category);
    const testDirs = readdirSync(categoryPath).filter((item) =>
      statSync(join(categoryPath, item)).isDirectory()
    );

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
          name: testDir.replace(/^\d+-/, '').replace(/-/g, ' '),
          category,
          path: testPath,
          metadata,
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
  if (testCases.length === 0) {
    test('No test cases found - run example test', () => {
      // This is a placeholder test when no corpus exists yet
      expect(true).toBe(true);
    });
  } else {
    testCases.forEach((testCase) => {
      test(`${testCase.category}/${testCase.id} should match Go output exactly`, async () => {
        const env = { FORCE_COLOR: '3' };

        const tsOutput = runTestCase(testCase.path, false, env);
        const goOutput = runTestCase(testCase.path, true, env);

        const result = compareOutputs(tsOutput, goOutput);

        if (!result.match && result.differences) {
          console.log(`\nDifferences in ${testCase.category}/${testCase.id}:`);
          result.differences.forEach((diff, i) => {
            console.log(
              `  ${i + 1}. At position ${diff.position}: '${diff.tsChar}' != '${diff.goChar}'`
            );
          });
        }

        expect(result.match).toBe(true);
      }, 30000);
    });
  }
});
