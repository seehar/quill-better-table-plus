const fs = require('fs');
const path = require('path');

// Convert UMD build to ESM format
function convertToESM() {
  const esmPath = path.join(__dirname, '../dist/quill-better-table-plus.esm.js');

  // Create a pure ESM module by importing and re-exporting the UMD build
  // This is the most reliable approach for modern bundlers
  const esmContent = `// ESM build for quill-better-table-plus
// This is a pure ESM module that provides proper import/export syntax

import Quill from 'quill';

// Import and re-export the UMD build
import QuillBetterTablePlusUMD from './quill-better-table-plus.js';

// Export as both default and named export for maximum compatibility
export default QuillBetterTablePlusUMD;
export { QuillBetterTablePlusUMD as QuillBetterTablePlus };
`;

  fs.writeFileSync(esmPath, esmContent);
  console.log('✅ ESM build converted successfully');
}

// Ensure CommonJS build has proper exports
function ensureCommonJSExports() {
  const cjsPath = path.join(__dirname, '../dist/quill-better-table-plus.cjs');
  let cjsContent = fs.readFileSync(cjsPath, 'utf8');
  
  // Ensure proper CommonJS exports
  if (!cjsContent.includes('module.exports =')) {
    cjsContent = cjsContent.replace(
      /return\s+([^;]+);?\s*\}\)\(.*?\);?\s*$/,
      'module.exports = $1;\n'
    );
    fs.writeFileSync(cjsPath, cjsContent);
    console.log('✅ CommonJS exports ensured');
  }
}

// Main execution
try {
  convertToESM();
  ensureCommonJSExports();
  console.log('🎉 Post-build processing completed successfully!');
} catch (error) {
  console.error('❌ Post-build processing failed:', error);
  process.exit(1);
}
