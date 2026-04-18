import Delta from 'quill/dist/quill/core/delta'

declare module 'quill' {
  interface QuillOptionsStatic {
    'better-table-plus'?: TableOptions
  }
}

interface TableOptions {
  operationMenu?: {
    items?: {
      insertColumnRight?: { text?: string }
      insertColumnLeft?: { text?: string }
      insertRowUp?: { text?: string }
      insertRowDown?: { text?: string }
      mergeCells?: { text?: string }
      unmergeCells?: { text?: string }
      deleteColumn?: { text?: string }
      deleteRow?: { text?: string }
      deleteTable?: { text?: string }
    }
    background?: { color?: string }
    color?: { colors?: string[]; text?: string }
  }
  selection?: { primaryColor?: string; secondaryColor?: string }
}

interface QuillBetterTablePlus {
  new (quill: any, options?: TableOptions): QuillBetterTablePlus
  insertTable(rows: number, columns: number): void
  getTable(): [any, any, any, number]
  deleteTable(): void
  insertRowAbove(): void
  insertRowBelow(): void
  insertColumnLeft(): void
  insertColumnRight(): void
  deleteRow(): void
  deleteColumn(): void
  mergeCells(): void
  unmergeCells(): void
  showTableTools(table: HTMLElement, quill: any, options: TableOptions): void
  hideTableTools(): void
  table: HTMLElement | null
  columnTool: any
  tableSelection: any
  tableOperationMenu: any
}

declare const QuillBetterTablePlus: {
  new (quill: any, options?: TableOptions): QuillBetterTablePlus
  register(): void
  keyboardBindings: Record<string, any>
}

export default QuillBetterTablePlus
export { TableOptions, QuillBetterTablePlus }
