// Bundler compatibility test
// This script simulates how modern bundlers would handle the package

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing bundler compatibility...');

function testPackageJson() {
  console.log('\n📦 Testing package.json configuration...');
  
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Test required fields for modern bundlers
  const requiredFields = ['main', 'module', 'types', 'exports'];
  const missingFields = requiredFields.filter(field => !packageJson[field]);
  
  if (missingFields.length === 0) {
    console.log('✅ All required package.json fields present');
  } else {
    console.log('❌ Missing fields:', missingFields);
    return false;
  }
  
  // Test exports field structure
  if (packageJson.exports && packageJson.exports['.']) {
    const exports = packageJson.exports['.'];
    if (exports.import && exports.require && exports.types) {
      console.log('✅ Proper exports configuration');

      // Check the order of exports conditions (types should come first)
      const exportKeys = Object.keys(exports);
      if (exportKeys[0] === 'types') {
        console.log('✅ Correct exports condition order (types first)');
      } else {
        console.log('⚠️  Exports condition order could be improved (types should be first)');
      }
    } else {
      console.log('❌ Incomplete exports configuration');
      return false;
    }
  }
  
  return true;
}

function testFileExistence() {
  console.log('\n📁 Testing file existence...');
  
  const requiredFiles = [
    'dist/quill-better-table-plus.esm.js',
    'dist/quill-better-table-plus.cjs',
    'dist/quill-better-table-plus.js',
    'dist/quill-better-table-plus.min.js',
    'dist/quill-better-table-plus.d.ts',
    'dist/quill-better-table-plus.css'
  ];
  
  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(__dirname, '..', file);
    return !fs.existsSync(filePath);
  });
  
  if (missingFiles.length === 0) {
    console.log('✅ All required files exist');
    return true;
  } else {
    console.log('❌ Missing files:', missingFiles);
    return false;
  }
}

function testESMSyntax() {
  console.log('\n🔍 Testing ESM syntax...');
  
  const esmPath = path.join(__dirname, '../dist/quill-better-table-plus.esm.js');
  const esmContent = fs.readFileSync(esmPath, 'utf8');
  
  // Check for proper ESM syntax
  const hasImport = esmContent.includes('import ');
  const hasExportDefault = esmContent.includes('export default');
  const hasNamedExport = esmContent.includes('export {');
  const noCommonJS = !esmContent.includes('module.exports') && !esmContent.includes('require(');
  
  if (hasImport && hasExportDefault && hasNamedExport && noCommonJS) {
    console.log('✅ ESM file has proper syntax');
    return true;
  } else {
    console.log('❌ ESM file syntax issues:');
    if (!hasImport) console.log('  - Missing import statements');
    if (!hasExportDefault) console.log('  - Missing default export');
    if (!hasNamedExport) console.log('  - Missing named exports');
    if (!noCommonJS) console.log('  - Contains CommonJS syntax');
    return false;
  }
}

function testCommonJSSyntax() {
  console.log('\n🔍 Testing CommonJS syntax...');
  
  const cjsPath = path.join(__dirname, '../dist/quill-better-table-plus.cjs');
  const cjsContent = fs.readFileSync(cjsPath, 'utf8');
  
  // Check for proper CommonJS syntax
  const hasModuleExports = cjsContent.includes('module.exports');
  
  if (hasModuleExports) {
    console.log('✅ CommonJS file has proper syntax');
    return true;
  } else {
    console.log('❌ CommonJS file missing module.exports');
    return false;
  }
}

function testTypeScriptDeclarations() {
  console.log('\n📝 Testing TypeScript declarations...');
  
  const dtsPath = path.join(__dirname, '../dist/quill-better-table-plus.d.ts');
  const dtsContent = fs.readFileSync(dtsPath, 'utf8');
  
  // Check for basic TypeScript declaration syntax
  const hasModuleDeclaration = dtsContent.includes('declare module');
  const hasExportDefault = dtsContent.includes('export default');
  
  if (hasModuleDeclaration && hasExportDefault) {
    console.log('✅ TypeScript declarations look good');
    return true;
  } else {
    console.log('❌ TypeScript declarations issues');
    return false;
  }
}

// Run all tests
function runAllTests() {
  const tests = [
    testPackageJson,
    testFileExistence,
    testESMSyntax,
    testCommonJSSyntax,
    testTypeScriptDeclarations
  ];
  
  const results = tests.map(test => test());
  const allPassed = results.every(result => result);
  
  console.log('\n🎯 Test Results:');
  if (allPassed) {
    console.log('🎉 All bundler compatibility tests passed!');
    console.log('✅ Package is ready for modern bundlers');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    console.log('⚠️  Package may have compatibility issues');
    process.exit(1);
  }
}

runAllTests();
