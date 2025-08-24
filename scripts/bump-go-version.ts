#!/usr/bin/env bun

/**
 * Bump the Go source version and reset TSPort version to initial
 * Usage: bun run scripts/bump-go-version.ts <go-version>
 * Example: bun run scripts/bump-go-version.ts 1.2.3
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function main() {
  const goVersion = process.argv[2];
  
  if (!goVersion) {
    console.error('Usage: bun run scripts/bump-go-version.ts <go-version>');
    console.error('Example: bun run scripts/bump-go-version.ts 1.2.3');
    process.exit(1);
  }
  
  // Validate version format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(goVersion)) {
    console.error('Error: Go version must be in format X.Y.Z (e.g., 1.2.3)');
    process.exit(1);
  }

  const packageJsonPath = join(process.cwd(), 'package.json');
  
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    // Set new version following TSPort convention: go-version-tsport
    const newVersion = `${goVersion}-tsport`;
    const oldVersion = pkg.version;
    
    // Update package.json
    pkg.version = newVersion;
    pkg.goSourceVersion = `v${goVersion}`;
    
    // Update or create portInfo
    pkg.portInfo = {
      ...pkg.portInfo,
      sourceVersion: `v${goVersion}`,
      tsportVersion: 0,
      lastUpdated: new Date().toISOString(),
      sourceRepo: pkg.portInfo?.sourceRepo || 'https://github.com/rivo/uniseg'
    };
    
    // Write updated package.json
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    
    console.log(`✅ Updated version: ${oldVersion} → ${newVersion}`);
    console.log(`📦 Go source version: v${goVersion}`);
    console.log(`🔧 TSPort version: 0 (initial)`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Update source code to match new Go version');
    console.log('2. Run tests to ensure compatibility');
    console.log('3. Update documentation if needed');
    console.log('4. Commit and publish when ready');
    
  } catch (error) {
    console.error('Error updating package.json:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}