#!/usr/bin/env bun

/**
 * Bump the TSPort patch version for TypeScript-specific fixes
 * Usage: bun run scripts/bump-tsport-version.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function main() {
  const packageJsonPath = join(process.cwd(), 'package.json');
  
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = pkg.version;
    
    // Parse current version - should be in format: X.Y.Z-tsport or X.Y.Z-tsport.N
    const match = currentVersion.match(/^(\d+\.\d+\.\d+)-tsport(?:\.(\d+))?$/);
    
    if (!match) {
      console.error('Error: Current version is not in TSPort format (X.Y.Z-tsport or X.Y.Z-tsport.N)');
      console.error(`Current version: ${currentVersion}`);
      console.error('Use bump-go-version.ts first to set up TSPort versioning');
      process.exit(1);
    }
    
    const goVersion = match[1];
    const currentTsportVersion = parseInt(match[2] || '0', 10);
    const newTsportVersion = currentTsportVersion + 1;
    
    // Create new version
    const newVersion = newTsportVersion === 1 
      ? `${goVersion}-tsport.1`  // First patch: X.Y.Z-tsport → X.Y.Z-tsport.1
      : `${goVersion}-tsport.${newTsportVersion}`;
    
    // Update package.json
    pkg.version = newVersion;
    
    // Update portInfo
    pkg.portInfo = {
      ...pkg.portInfo,
      tsportVersion: newTsportVersion,
      lastUpdated: new Date().toISOString()
    };
    
    // Write updated package.json
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    
    console.log(`✅ TSPort version bumped: ${currentVersion} → ${newVersion}`);
    console.log(`📦 Go source version: ${pkg.goSourceVersion || `v${goVersion}`} (unchanged)`);
    console.log(`🔧 TSPort patch: ${newTsportVersion}`);
    console.log('');
    console.log('This version includes TypeScript-specific fixes/improvements.');
    console.log('Ready to commit and publish!');
    
  } catch (error) {
    console.error('Error updating package.json:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}