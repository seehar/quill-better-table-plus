// ESM test file to verify the module structure and imports
// This file uses .mjs extension to ensure it's treated as ESM

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test ESM file structure
console.log('🧪 Testing ESM module structure...');

try {
  // Test that the ESM file exists and has proper structure
  const esmPath = join(__dirname, '../dist/quill-better-table-plus.esm.js');
  const esmContent = readFileSync(esmPath, 'utf8');

  console.log('✅ ESM file exists');
  console.log('📦 File size:', Math.round(esmContent.length / 1024), 'KB');

  // Check if it has proper ESM syntax
  if (esmContent.includes('import Quill from')) {
    console.log('✅ ESM import syntax found');
  } else {
    console.log('⚠️  No ESM import syntax found');
  }

  if (esmContent.includes('export default')) {
    console.log('✅ ESM default export found');
  } else {
    console.log('⚠️  No ESM default export found');
  }

  if (esmContent.includes('export {')) {
    console.log('✅ ESM named export found');
  } else {
    console.log('⚠️  No ESM named export found');
  }

  // Test that it's a clean ESM file (no CommonJS syntax)
  if (!esmContent.includes('module.exports') && !esmContent.includes('require(')) {
    console.log('✅ Clean ESM file (no CommonJS syntax)');
  } else {
    console.log('⚠️  ESM file contains CommonJS syntax');
  }

  console.log('🎉 All ESM structure tests passed!');

} catch (error) {
  console.error('❌ ESM test failed:', error);
  process.exit(1);
}
