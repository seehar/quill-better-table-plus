// ESM build for quill-better-table-plus
// This is a pure ESM module that provides proper import/export syntax

import Quill from 'quill';

// Import and re-export the UMD build
import QuillBetterTablePlusUMD from './quill-better-table-plus.js';

// Export as both default and named export for maximum compatibility
export default QuillBetterTablePlusUMD;
export { QuillBetterTablePlusUMD as QuillBetterTablePlus };
