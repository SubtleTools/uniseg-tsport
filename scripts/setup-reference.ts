#!/usr/bin/env bun

/**
 * Post-template setup script for Go reference cloning and Git setup
 * This runs after Moon template generation to set up the Go reference
 */

import { $ } from 'bun';
import { writeFileSync, existsSync } from 'fs';

async function main() {
  const goRepo = process.env.GO_REPO || process.argv[2];
  
  if (!goRepo) {
    console.error('❌ Go repository URL required');
    console.error('Usage: bun run scripts/setup-reference.ts <go-repo-url>');
    console.error('   or: GO_REPO=<url> bun run scripts/setup-reference.ts');
    process.exit(1);
  }

  console.log('🚀 Setting up TSports package...');
  console.log(`   Go Repository: ${goRepo}`);
  console.log('');

  await cloneGoReference(goRepo);
  await updateGitIgnore();
  
  console.log('');
  console.log('✅ Setup completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Analyze the Go codebase in test/reference/');
  console.log('2. Implement the TypeScript port in src/');
  console.log('3. Add tests that verify compatibility with Go implementation');
  console.log('4. Run `moon run test` to verify everything works');
  console.log('5. Build with `moon run build`');
  console.log('');
  console.log('Happy porting! 🎉');
}

async function cloneGoReference(goRepo: string) {
  console.log('📦 Cloning Go reference implementation...');
  
  try {
    // Create test directory and clone Go repository as reference
    await $`mkdir -p test`;
    
    if (existsSync('test/reference')) {
      console.log('   Reference already exists, updating...');
      await $`cd test/reference && git pull`;
    } else {
      await $`cd test && git clone ${goRepo} reference`;
      console.log('   ✓ Cloned Go reference to test/reference/');
    }
  } catch (error) {
    console.error('   ⚠️  Failed to clone Go reference:', error);
    console.log('   You can manually clone it later with:');
    console.log(`   git clone ${goRepo} test/reference`);
  }
}

async function updateGitIgnore() {
  const gitignoreContent = `# Dependencies
node_modules/
.bun/

# Build outputs
dist/
*.tsbuildinfo

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test outputs
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Go reference (large)
test/reference/.git/
`;

  if (!existsSync('.gitignore')) {
    writeFileSync('.gitignore', gitignoreContent);
    console.log('📄 Created .gitignore');
  } else {
    console.log('📄 .gitignore already exists, skipping...');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});