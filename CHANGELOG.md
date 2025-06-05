# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.8] - 2025-02-06

### Fixed
- **Package.json Exports Order**: Fixed the order of conditions in the `exports` field to prevent bundler warnings
  - Moved `"types"` condition before `"import"` and `"require"` to follow Node.js resolution order
  - Resolves warning: `The condition "types" here will never be used as it comes after both "import" and "require"`

### Technical Details
- Updated exports field order: `types` → `import` → `require`
- Enhanced bundler compatibility tests to verify correct condition order
- No breaking changes - all existing functionality preserved

## [0.1.7] - 2025-02-06

### Added
- **ESM Support**: Added proper ECMAScript Module (ESM) support to resolve "Module is not ESM" warnings in modern bundlers
- **Multiple Module Formats**: Now builds and distributes multiple formats:
  - ESM: `dist/quill-better-table-plus.esm.js`
  - CommonJS: `dist/quill-better-table-plus.cjs`
  - UMD: `dist/quill-better-table-plus.js`
  - Minified: `dist/quill-better-table-plus.min.js`
- **TypeScript Declarations**: Added TypeScript declaration file (`dist/quill-better-table-plus.d.ts`)
- **Package Exports**: Added proper `exports` field in package.json for conditional module loading
- **Build System**: Enhanced build system with post-build processing for ESM generation
- **Test Suite**: Added automated tests for module structure validation
- **Usage Examples**: Added comprehensive usage examples for different module systems

### Changed
- **Node.js Compatibility**: Updated Node.js requirement from `>=12.0.0 <13.0.0` to `>=14.0.0`
- **Package Structure**: Updated package.json with proper module fields:
  - `main`: Points to CommonJS build
  - `module`: Points to ESM build
  - `types`: Points to TypeScript declarations
  - `exports`: Conditional exports for different environments
- **Build Process**: Enhanced build process to generate multiple module formats
- **Documentation**: Updated README with ESM support information and compatibility notes

### Fixed
- **ESM Warning**: Resolved "Module 'quill-better-table-plus' used by ... is not ESM" warning in modern bundlers
- **Node.js Version Warning**: Fixed npm warning about incompatible Node.js versions
- **Module Resolution**: Improved module resolution for different bundlers and environments

### Technical Details
- Created pure ESM wrapper that imports and re-exports UMD build
- Added automated post-build script to generate proper ESM syntax
- Maintained backward compatibility with existing CommonJS and UMD usage
- Added comprehensive test suite to validate module structure

## [0.1.6] - Previous Release

### Note
Version 0.1.6 was an intermediate release during development. Please use 0.1.7 or later for the latest features and fixes.

## [0.1.5] - Previous Release

### Note
Last version with Node.js 12.x support. If you need to use Node.js 12.x, please use this version:
```bash
npm install quill-better-table-plus@0.1.5
```

---

## Migration Guide

### From 0.1.5 to 0.1.7

1. **Update Node.js**: Ensure you're using Node.js 14.0.0 or higher
2. **Update Package**: Run `npm install quill-better-table-plus@latest`
3. **No Code Changes Required**: Your existing code will continue to work
4. **Optional**: Consider switching to ESM imports for better bundler compatibility

### ESM Migration (Optional)

If you want to use the new ESM format:

```javascript
// Before (still works)
const QuillBetterTablePlus = require('quill-better-table-plus');

// After (recommended for modern bundlers)
import QuillBetterTablePlus from 'quill-better-table-plus';
```

### Bundler Compatibility

- **Vite**: Now works without warnings
- **Webpack 5**: Improved compatibility
- **Rollup**: Better tree-shaking support
- **Parcel**: Enhanced module resolution
- **esbuild**: Improved ESM handling
