import { execSync } from 'node:child_process';

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

export function runTestCase(
  testPath: string,
  isGo: boolean,
  env: Record<string, string> = {}
): string {
  const filename = isGo ? 'case.go' : 'case.ts';
  const command = isGo ? `go run ${filename}` : `bun run ${filename}`;

  try {
    return execSync(command, {
      cwd: testPath,
      encoding: 'utf8',
      env: { ...process.env, ...env },
    }).trim();
  } catch (error) {
    throw new Error(`Failed to run ${isGo ? 'Go' : 'TypeScript'} test case: ${error}`);
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
          go: goOutput.substring(start, end),
        },
      });

      if (differences.length >= 5) break; // Limit differences for readability
    }
  }

  return { match: false, tsOutput, goOutput, differences };
}
