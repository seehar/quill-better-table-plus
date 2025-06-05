# Usage Examples for @hbasanjideh/quill-better-table-plus

This document provides examples of how to use `@hbasanjideh/quill-better-table-plus` with different module systems and bundlers.

## ESM (ECMAScript Modules) - Recommended

### Modern Bundlers (Vite, Webpack 5, Rollup, etc.)

```javascript
// Default import (recommended)
import QuillBetterTablePlus from '@hbasanjideh/quill-better-table-plus';
import Quill from 'quill';

// Register the module
Quill.register('modules/better-table', QuillBetterTablePlus);

// Initialize Quill with the table module
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    'better-table': {
      operationMenu: {
        items: {
          insertColumnRight: { text: 'Insert column right' },
          insertColumnLeft: { text: 'Insert column left' },
          insertRowUp: { text: 'Insert row above' },
          insertRowDown: { text: 'Insert row below' },
          mergeCells: { text: 'Merge cells' },
          unmergeCells: { text: 'Unmerge cells' },
          deleteColumn: { text: 'Delete column' },
          deleteRow: { text: 'Delete row' },
          deleteTable: { text: 'Delete table' }
        }
      }
    }
  }
});
```

### Named Import

```javascript
// Named import (also available)
import { QuillBetterTablePlus } from '@hbasanjideh/quill-better-table-plus';
import Quill from 'quill';

Quill.register('modules/better-table', QuillBetterTablePlus);
```

## CommonJS (Node.js, older bundlers)

```javascript
// CommonJS require
const QuillBetterTablePlus = require('@hbasanjideh/quill-better-table-plus');
const Quill = require('quill');

Quill.register('modules/better-table', QuillBetterTablePlus);

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    'better-table': {
      operationMenu: {
        items: {
          insertColumnRight: { text: 'Insert column right' },
          // ... other options
        }
      }
    }
  }
});
```

## UMD (Browser Script Tags)

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
  <link href="./node_modules/@hbasanjideh/quill-better-table-plus/dist/quill-better-table-plus.css" rel="stylesheet">
</head>
<body>
  <div id="editor"></div>

  <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
  <script src="./node_modules/@hbasanjideh/quill-better-table-plus/dist/quill-better-table-plus.min.js"></script>
  
  <script>
    // UMD usage
    Quill.register('modules/better-table', quillBetterTablePlus);
    
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        'better-table': {
          operationMenu: {
            items: {
              insertColumnRight: { text: 'Insert column right' },
              // ... other options
            }
          }
        }
      }
    });
  </script>
</body>
</html>
```

## TypeScript

```typescript
// TypeScript with ESM
import QuillBetterTablePlus from '@hbasanjideh/quill-better-table-plus';
import Quill from 'quill';

// The package includes TypeScript declarations
Quill.register('modules/better-table', QuillBetterTablePlus);

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    'better-table': {
      operationMenu: {
        items: {
          insertColumnRight: { text: 'Insert column right' },
          insertColumnLeft: { text: 'Insert column left' },
          // TypeScript will provide autocomplete for these options
        }
      }
    }
  }
});
```

## CSS Import

Don't forget to import the CSS file:

```css
/* In your CSS file */
@import '@hbasanjideh/quill-better-table-plus/dist/quill-better-table-plus.css';
```

Or in JavaScript:

```javascript
// ESM
import '@hbasanjideh/quill-better-table-plus/dist/quill-better-table-plus.css';

// CommonJS
require('@hbasanjideh/quill-better-table-plus/dist/quill-better-table-plus.css');
```

## Troubleshooting

### ESM Warning in Bundlers

If you're still seeing "Module is not ESM" warnings, make sure you're using version 0.1.7 or higher:

```bash
npm install @hbasanjideh/quill-better-table-plus@latest
```

### Node.js Version

Make sure you're using Node.js 14.0.0 or higher:

```bash
node --version
```

If you need to use an older Node.js version, use the original package version 0.1.5 or earlier:

```bash
npm install quill-better-table-plus@0.1.5
```
