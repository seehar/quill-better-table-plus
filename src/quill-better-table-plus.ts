import Quill from 'quill'
import TableColumnTool from './modules/table-column-tool'
import TableSelection from './modules/table-selection'
import TableOperationMenu from './modules/table-operation-menu'
import { matchTable, matchTableCell, matchTableHeader } from './utils/node-matchers'
import { getEventComposedPath } from './utils/index'
import {
  cellId,
  rowId,
  TableBody,
  TableCell,
  TableCellLine,
  TableCol,
  TableColGroup,
  TableContainer,
  TableRow,
  TableViewWrapper,
} from './formats/table'
import { getColToolCellIndexByBoundary, getColToolCellIndexesByBoundary } from './utils/table-util'
import { ERROR_LIMIT } from "./contants"

const Module = Quill.import('core/module') as any
const Delta = Quill.import('delta') as any

interface TableOptions {
  operationMenu?: any
  color?: any
}

class BetterTablePlus extends Module {
  table: HTMLElement | null = null
  columnTool: TableColumnTool | null = null
  tableSelection: TableSelection | null = null
  tableOperationMenu: TableOperationMenu | null = null

  static register() {
    Quill.register(TableCol, true)
    Quill.register(TableColGroup, true)
    Quill.register(TableCellLine, true)
    Quill.register(TableCell, true)
    Quill.register(TableRow, true)
    Quill.register(TableBody, true)
    Quill.register(TableContainer, true)
    Quill.register(TableViewWrapper, true)
  }

  constructor(quill: any, options: TableOptions) {
    super(quill, options)

    const self = this

    this.quill.root.addEventListener('click', (evt: Event) => {
      const path = getEventComposedPath(evt)

      if (!path || path.length <= 0) return

      const tableNode = path.filter(node => {
        return (node as HTMLElement).tagName &&
          (node as HTMLElement).tagName.toUpperCase() === 'TABLE' &&
          (node as HTMLElement).classList.contains('quill-better-table')
      })[0] as HTMLElement | undefined

      if (tableNode) {
        if (self.table === tableNode) return
        if (self.table) self.hideTableTools()
        self.showTableTools(tableNode, quill, options)
      } else if (self.table) {
        self.hideTableTools()
      }
    }, false)

    this.quill.root.addEventListener('contextmenu', (evt: Event) => {
      if (!self.table) return true
      evt.preventDefault()

      const path = getEventComposedPath(evt)
      if (!path || path.length <= 0) return

      const tableNode = path.filter(node => {
        return (node as HTMLElement).tagName &&
          (node as HTMLElement).tagName.toUpperCase() === 'TABLE' &&
          (node as HTMLElement).classList.contains('quill-better-table')
      })[0] as HTMLElement | undefined

      const rowNode = path.filter(node => {
        return (node as HTMLElement).tagName &&
          (node as HTMLElement).tagName.toUpperCase() === 'TR' &&
          (node as HTMLElement).getAttribute('data-row')
      })[0] as HTMLElement | undefined

      const cellNode = path.filter(node => {
        return (node as HTMLElement).tagName &&
          (node as HTMLElement).tagName.toUpperCase() === 'TD' &&
          (node as HTMLElement).getAttribute('data-row')
      })[0] as HTMLElement | undefined

      if (!self.tableSelection) return

      const isTargetCellSelected = self.tableSelection.selectedTds
        .map(tableCell => tableCell.domNode)
        .includes(cellNode)

      if (self.tableSelection.selectedTds.length <= 0 ||
        !isTargetCellSelected) {
        if (cellNode) {
          self.tableSelection.setSelection(
            cellNode.getBoundingClientRect(),
            cellNode.getBoundingClientRect()
          )
        }
      }

      if (self.tableOperationMenu)
        self.tableOperationMenu = self.tableOperationMenu.destroy()

      if (tableNode) {
        self.tableOperationMenu = new TableOperationMenu({
          table: tableNode,
          row: rowNode,
          cell: cellNode,
          left: (evt as MouseEvent).pageX,
          top: (evt as MouseEvent).pageY,
        }, quill, options.operationMenu)
      }
    }, false)

    const KeyBoard = quill.getModule('keyboard')
    const self2 = this
    quill.keyboard.addBinding(
      { key: 'Backspace' },
      {},
      function (this: any, range: any, context: any) {
        if (range.index === 0 || this.quill.getLength() <= 1) return true
        const [line] = this.quill.getLine(range.index)
        if (context.offset === 0) {
          const [prev] = this.quill.getLine(range.index - 1)
          if (prev != null) {
            if (prev.statics.blotName === 'table-cell-line' &&
              line.statics.blotName !== 'table-cell-line') return false
          }
        }
        return true
      })

    let thisBinding = quill.keyboard.bindings.Backspace.pop()
    quill.keyboard.bindings.Backspace.splice(0, 1, thisBinding)

    quill.clipboard.addMatcher('td', matchTableCell)
    quill.clipboard.addMatcher('th', matchTableHeader)
    quill.clipboard.addMatcher('table', matchTable)

    quill.clipboard.matchers = quill.clipboard.matchers.filter((matcher: any) => {
      return matcher[0] !== 'tr'
    })
  }

  getTable(range = this.quill.getSelection()) {
    if (range == null) return [null, null, null, -1] as [null, null, null, number]
    const [cellLine, offset] = this.quill.getLine(range.index)
    if (cellLine == null || cellLine.statics.blotName !== TableCellLine.blotName) {
      return [null, null, null, -1] as [null, null, null, number]
    }
    const cell = cellLine.tableCell()
    const row = cell.row()
    const table = row.table()
    return [table, row, cell, offset]
  }

  insertTable(rows: number, columns: number) {
    const range = this.quill.getSelection(true)
    if (range == null) return
    let currentBlot = this.quill.getLeaf(range.index)[0]

    if (isInTableCell(currentBlot)) {
      console.warn(`Can not insert table into a table cell.`)
      return
    }

    let delta = new Delta().retain(range.index)
    delta.insert('\n')
    delta = new Array(columns).fill('\n').reduce((memo: any, text) => {
      memo.insert(text, { 'table-col': true })
      return memo
    }, delta)
    delta = new Array(rows).fill(0).reduce((memo: any) => {
      const tableRowId = rowId()
      return new Array(columns).fill('\n').reduce((memoInner: any, text: string) => {
        memoInner.insert(text, { 'table-cell-line': { row: tableRowId, cell: cellId() } })
        return memoInner
      }, memo)
    }, delta)

    this.quill.updateContents(delta, Quill.sources.USER)
    this.quill.setSelection(range.index + columns + 1, Quill.sources.API)
  }

  tableInsertColumn(columnType: string) {
    const tableContainer = Quill.find(this.table!) as any
    const tableSelection = this.tableSelection!
    const tableColumnTool = this.columnTool!
    const columnToolCells = tableColumnTool.colToolCells()

    const colIndex = getColToolCellIndexByBoundary(
      columnToolCells as any,
      tableSelection.boundary as any,
      (cellRect: any, boundary: any) => {
        return Math.abs(cellRect.x + cellRect.width - boundary.x1) <= ERROR_LIMIT
      },
      tableSelection.quill.root.parentNode as HTMLElement
    )
    const newColumn = tableContainer.insertColumn(
      tableSelection.boundary,
      colIndex,
      columnType === "right",
      tableSelection.quill.root.parentNode
    )

    tableColumnTool.updateToolCells()
    tableSelection.quill.update(Quill.sources.USER)
    tableSelection.quill.setSelection(tableSelection.quill.getIndex(newColumn[0]), 0, Quill.sources.SILENT)
    tableSelection.setSelection(
      newColumn[0].domNode.getBoundingClientRect(),
      newColumn[0].domNode.getBoundingClientRect()
    )
  }

  insertColumnLeft() {
    this.tableInsertColumn("left")
  }

  insertColumnRight() {
    this.tableInsertColumn("right")
  }

  tableInsertRow(rowType: string) {
    const tableContainer = Quill.find(this.table!) as any
    const tableSelection = this.tableSelection!

    const affectedCells = tableContainer.insertRow(
      tableSelection.boundary,
      rowType === "below",
      tableSelection.quill.root.parentNode
    )
    tableSelection.quill.update(Quill.sources.USER)
    tableSelection.quill.setSelection(tableSelection.quill.getIndex(affectedCells[0]), 0, Quill.sources.SILENT)
    tableSelection.setSelection(
      affectedCells[0].domNode.getBoundingClientRect(),
      affectedCells[0].domNode.getBoundingClientRect()
    )
  }

  insertRowAbove() {
    this.tableInsertRow("above")
  }

  insertRowBelow() {
    this.tableInsertRow("below")
  }

  deleteRow() {
    const tableContainer = Quill.find(this.table!) as any
    const tableSelection = this.tableSelection!

    tableContainer.deleteRow(tableSelection.boundary, tableSelection.quill.root.parentNode)
    tableSelection.quill.update(Quill.sources.USER)
    tableSelection.clearSelection()
  }

  deleteColumn() {
    const tableContainer = Quill.find(this.table!) as any
    const tableSelection = this.tableSelection!
    const tableColumnTool = this.columnTool!
    const columnToolCells = tableColumnTool.colToolCells()

    const colIndexes = getColToolCellIndexesByBoundary(
      columnToolCells as any,
      tableSelection.boundary as any,
      (cellRect: any, boundary: any) => {
        return cellRect.x + ERROR_LIMIT > boundary.x && cellRect.x + cellRect.width - ERROR_LIMIT < boundary.x1
      },
      tableSelection.quill.root.parentNode as HTMLElement
    )

    const isDeleteTable = tableContainer.deleteColumns(
      tableSelection.boundary,
      colIndexes,
      tableSelection.quill.root.parentNode
    )
    if (!isDeleteTable) {
      tableColumnTool.updateToolCells()
      tableSelection.quill.update(Quill.sources.USER)
      tableSelection.clearSelection()
    }
  }

  deleteTable() {
    const tableContainer = Quill.find(this.table!) as any
    tableContainer.tableDestroy()
  }

  showTableTools(table: HTMLElement, quill: any, options: TableOptions) {
    this.table = table
    this.columnTool = new TableColumnTool(table, quill, options)
    this.tableSelection = new TableSelection(table, quill, options)
  }

  hideTableTools() {
    if (this.columnTool) this.columnTool.destroy()
    if (this.tableSelection) this.tableSelection.destroy()
    if (this.tableOperationMenu) this.tableOperationMenu.destroy()
    this.columnTool = null
    this.tableSelection = null
    this.tableOperationMenu = null
    this.table = null
  }
}

BetterTablePlus.keyboardBindings = {
  'table-cell-line backspace': {
    key: 'Backspace',
    format: ['table-cell-line'],
    collapsed: true,
    offset: 0,
    handler(this: any, range: any, context: any) {
      const [line] = this.quill.getLine(range.index)
      return !(!line.prev || line.prev.statics.blotName !== 'table-cell-line')
    },
  } as any,

  'table-cell-line delete': {
    key: 'Delete',
    format: ['table-cell-line'],
    collapsed: true,
    suffix: /^$/,
    handler() {
    },
  } as any,

  'table-cell-line enter': {
    key: 'Enter',
    shiftKey: null,
    format: ['table-cell-line'],
    handler(this: any, range: any, context: any) {
      if (this.quill.selection && this.quill.selection.composing) return
      const Scope = (Quill.imports.parchment as any).Scope
      if (range.length > 0) {
        this.quill.scroll.deleteAt(range.index, range.length)
      }
      const lineFormats = Object.keys(context.format).reduce((formats: any, format) => {
        if (
          this.quill.scroll.query(format, Scope.BLOCK) &&
          !Array.isArray(context.format[format])
        ) {
          formats[format] = context.format[format]
        }
        return formats
      }, {})
      this.quill.insertText(range.index, '\n', lineFormats['table-cell-line'], Quill.sources.USER)
      this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
      this.quill.focus()
      Object.keys(context.format).forEach(name => {
        if (lineFormats[name] != null) return
        if (Array.isArray(context.format[name])) return
        if (name === 'link') return
        this.quill.format(name, context.format[name], Quill.sources.USER)
      })
    },
  } as any,

  'table-cell-line up': makeTableArrowHandler(true),
  'table-cell-line down': makeTableArrowHandler(false),
  'down-to-table': {
    key: 'ArrowDown',
    collapsed: true,
    handler(this: any, range: any, context: any) {
      const target = context.line.next
      if (target && target.statics.blotName === 'table-view') {
        const targetCell = target.table().rows()[0].children.head
        const targetLine = targetCell.children.head

        this.quill.setSelection(
          targetLine.offset(this.quill.scroll),
          0,
          Quill.sources.USER
        )

        return false
      }
      return true
    },
  } as any,
  'up-to-table': {
    key: 'ArrowUp',
    collapsed: true,
    handler(this: any, range: any, context: any) {
      const target = context.line.prev
      if (target && target.statics.blotName === 'table-view') {
        const rows = target.table().rows()
        const targetCell = rows[rows.length - 1].children.head
        const targetLine = targetCell.children.head

        this.quill.setSelection(
          targetLine.offset(this.quill.scroll),
          0,
          Quill.sources.USER
        )

        return false
      }
      return true
    },
  } as any,
}

function makeTableArrowHandler(up: boolean) {
  return {
    key: up ? 'ArrowUp' : 'ArrowDown',
    collapsed: true,
    format: ['table-cell-line'],
    handler(this: any, range: any, context: any) {
      const key = up ? 'prev' : 'next'
      const targetLine = context.line[key]
      if (targetLine != null) return true

      const cell = context.line.parent
      const targetRow = (cell as any).parent[key]

      if (targetRow != null && targetRow.statics.blotName === 'table-row') {
        let targetCell = targetRow.children.head
        let totalColspanOfTargetCell = parseInt(targetCell.formats().colspan, 10)
        let cur = cell
        let totalColspanOfCur = parseInt(cur.formats().colspan, 10)

        while ((cur as any).prev != null) {
          cur = (cur as any).prev
          totalColspanOfCur += parseInt(cur.formats().colspan, 10)
        }

        while ((targetCell as any).next != null && totalColspanOfTargetCell < totalColspanOfCur) {
          targetCell = (targetCell as any).next
          totalColspanOfTargetCell += parseInt(targetCell.formats().colspan, 10)
        }

        const index = targetCell.offset(this.quill.scroll)
        this.quill.setSelection(index, 0, Quill.sources.USER)
      } else {
        const targetLine = cell.table().parent[key]
        if (targetLine != null) {
          if (up) {
            this.quill.setSelection(
              targetLine.offset(this.quill.scroll) + targetLine.length() - 1,
              0,
              Quill.sources.USER
            )
          } else {
            this.quill.setSelection(
              targetLine.offset(this.quill.scroll),
              0,
              Quill.sources.USER
            )
          }
        }
      }
      return false
    },
  } as any
}

function isTableCell(blot: any) {
  return blot.statics.blotName === TableCell.blotName
}

function isInTableCell(current: any): boolean {
  return current && current.parent
    ? isTableCell(current.parent)
      ? true
      : isInTableCell(current.parent)
    : false
}

export default BetterTablePlus
