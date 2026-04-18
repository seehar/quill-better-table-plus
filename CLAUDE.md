# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
pnpm install   # Install dependencies
pnpm run dev        # Start dev server with hot reload
pnpm run build      # Full build (ESM + CJS + UMD + minified)
pnpm run lint       # Lint with ESLint
pnpm run test       # Run all tests (CJS, ESM, bundler compatibility)
pnpm run test:cjs   # Test CommonJS require
pnpm run test:esm   # Test ESM imports
pnpm run test:bundler # Test bundler compatibility
```

## Architecture

**quill-better-table-plus** is a Quill 2.x module that adds enhanced table editing. It extends Quill's Parchment blot system to represent tables.

### Blot Hierarchy (in `src/formats/table.ts`)

```
TableViewWrapper (DIV, scroll container)
└── TableContainer (TABLE)
    ├── TableColGroup → TableCol (column widths)
    └── TableBody → TableRow → TableCell (TD)
                         └── TableCellLine (P, editable content)
```

Each blot has `requiredContainer` and `allowedChildren` properties enforcing this hierarchy.

### Module Components (in `src/modules/`)

- **BetterTablePlus** (`quill-better-table-plus.ts`): Main Quill module, registers blots, handles clipboard paste, keyboard bindings
- **TableColumnTool** (`table-column-tool.ts`): Top-bar UI for column resize handles
- **TableSelection** (`table-selection.ts`): Mouse-drag cell selection with helper lines
- **TableOperationMenu** (`table-operation-menu.ts`): Right-click context menu

### Key Design Patterns

1. **Event Path Compatibility**: Uses `getEventComposedPath()` for Safari/FF/Edge where `evt.path` is undefined
2. **Rect-based hit detection**: Uses `getRelativeRect()` to compute positions relative to editor container
3. **Clipboard matchers**: Transform pasted HTML tables into Quill Delta operations
4. **ERROR_LIMIT constant (5px)**: Used throughout for boundary tolerance in cell detection

### Module Registration

```typescript
BetterTablePlus.register()  // Registers all table blots with Quill
```

Register before creating the Quill editor instance.

### Styling

- Source: `src/assets/quill-better-table-plus.less`
- CSS classes prefixed with `qlbt-` (quill-better-table)
- Icon SVGs imported directly for operation menu

### TypeScript

This project is written in TypeScript. Source files are located in `src/` with `.ts` extension.
