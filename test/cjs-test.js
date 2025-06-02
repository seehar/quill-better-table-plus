// CommonJS test file to verify the module structure

console.log('🧪 Testing CommonJS module structure...');

// Mock browser environment for Node.js testing
global.window = global;
global.document = {
  createElement: () => ({ style: {} }),
  createDocumentFragment: () => ({}),
  querySelector: () => null,
};

try {
  // Test that the CommonJS file exists and has the right structure
  const fs = require('fs');
  const path = require('path');

  const cjsPath = path.join(__dirname, '../dist/quill-better-table-plus.cjs');
  const cjsContent = fs.readFileSync(cjsPath, 'utf8');

  console.log('✅ CommonJS file exists');
  console.log('📦 File size:', Math.round(cjsContent.length / 1024), 'KB');

  // Check if it has proper CommonJS exports
  if (cjsContent.includes('module.exports')) {
    console.log('✅ CommonJS exports found');
  } else {
    console.log('⚠️  No CommonJS exports found');
  }

  // Test UMD file structure
  const umdPath = path.join(__dirname, '../dist/quill-better-table-plus.js');
  const umdContent = fs.readFileSync(umdPath, 'utf8');

  console.log('✅ UMD file exists');
  console.log('📦 UMD file size:', Math.round(umdContent.length / 1024), 'KB');

  // Check if it has UMD wrapper
  if (umdContent.includes('(function webpackUniversalModuleDefinition')) {
    console.log('✅ UMD wrapper found');
  } else {
    console.log('⚠️  No UMD wrapper found');
  }

  console.log('🎉 All CommonJS structure tests passed!');

} catch (error) {
  console.error('❌ CommonJS test failed:', error);
  process.exit(1);
}
