import Quill from 'quill'
import TableColumnTool from './modules/table-column-tool'
import TableSelection from './modules/table-selection'
import TableOperationMenu from './modules/table-operation-menu'

// import table node matchers
import { matchTable, matchTableCell, matchTableHeader } from './utils/node-matchers'

import { getEventComposedPath } from './utils'
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
} from './formats/table';
import { getColToolCellIndexByBoundary, getColToolCellIndexesByBoundary } from "./utils/table-util";
import { ERROR_LIMIT } from "./contants";

const Module = Quill.import('core/module')
const Delta = Quill.import('delta')

class BetterTablePlus extends Module {
  static register() {
    Quill.register(TableCol, true);
    Quill.register(TableColGroup, true);
    Quill.register(TableCellLine, true);
    Quill.register(TableCell, true);
    Quill.register(TableRow, true);
    Quill.register(TableBody, true);
    Quill.register(TableContainer, true);
    Quill.register(TableViewWrapper, true);
    // register customized Header，overwriting quill built-in Header
    // Quill.register('formats/header', Header, true);
  }

  constructor(quill, options) {
    super(quill, options);

    // handle click on quill-better-table
    this.quill.root.addEventListener('click', (evt) => {
      // bugfix: evt.path is undefined in Safari, FF, Micro Edge
      const path = getEventComposedPath(evt)

      if (!path || path.length <= 0) return

      const tableNode = path.filter(node => {
        return node.tagName &&
          node.tagName.toUpperCase() === 'TABLE' &&
          node.classList.contains('quill-better-table')
      })[0]

      if (tableNode) {
        // current table clicked
        if (this.table === tableNode) return
        // other table clicked
        if (this.table) this.hideTableTools()
        this.showTableTools(tableNode, quill, options)
      } else if (this.table) {
        // other clicked
        this.hideTableTools()
      }
    }, false)

    // handle right click on quill-better-table
    this.quill.root.addEventListener('contextmenu', (evt) => {
      if (!this.table) return true
      evt.preventDefault()

      // bugfix: evt.path is undefined in Safari, FF, Micro Edge
      const path = getEventComposedPath(evt)
      if (!path || path.length <= 0) return

      const tableNode = path.filter(node => {
        return node.tagName &&
          node.tagName.toUpperCase() === 'TABLE' &&
          node.classList.contains('quill-better-table')
      })[0]

      const rowNode = path.filter(node => {
        return node.tagName &&
          node.tagName.toUpperCase() === 'TR' &&
          node.getAttribute('data-row')
      })[0]

      const cellNode = path.filter(node => {
        return node.tagName &&
          node.tagName.toUpperCase() === 'TD' &&
          node.getAttribute('data-row')
      })[0]

      let isTargetCellSelected = this.tableSelection.selectedTds
        .map(tableCell => tableCell.domNode)
        .includes(cellNode)

      if (this.tableSelection.selectedTds.length <= 0 ||
        !isTargetCellSelected) {
        this.tableSelection.setSelection(
          cellNode.getBoundingClientRect(),
          cellNode.getBoundingClientRect()
        )
      }

      if (this.tableOperationMenu)
        this.tableOperationMenu = this.tableOperationMenu.destroy()

      if (tableNode) {
        this.tableOperationMenu = new TableOperationMenu({
          table: tableNode,
          row: rowNode,
          cell: cellNode,
          left: evt.pageX,
          top: evt.pageY,
        }, quill, options.operationMenu)
      }
    }, false)

    // add keyboard binding：Backspace
    // prevent user hits backspace to delete table cell
    const KeyBoard = quill.getModule('keyboard')
    quill.keyboard.addBinding(
      { key: 'Backspace' },
      {},
      function (range, context) {
        if (range.index === 0 || this.quill.getLength() <= 1) return true;
        const [line] = this.quill.getLine(range.index);
        if (context.offset === 0) {
          const [prev] = this.quill.getLine(range.index - 1);
          if (prev != null) {
            if (prev.statics.blotName === 'table-cell-line' &&
              line.statics.blotName !== 'table-cell-line') return false;
          }
        }
        return true
      })
    // since only one matched bindings callback will excute.
    // expected my binding callback excute first
    // I changed the order of binding callbacks
    let thisBinding = quill.keyboard.bindings.Backspace.pop()
    quill.keyboard.bindings.Backspace.splice(0, 1, thisBinding)

    // add Matchers to match and render quill-better-table for initialization
    // or pasting
    quill.clipboard.addMatcher('td', matchTableCell)
    quill.clipboard.addMatcher('th', matchTableHeader)
    quill.clipboard.addMatcher('table', matchTable)
    // quill.clipboard.addMatcher('h1, h2, h3, h4, h5, h6', matchHeader)

    // remove matcher for tr tag
    quill.clipboard.matchers = quill.clipboard.matchers.filter(matcher => {
      return matcher[0] !== 'tr'
    })
  }

  getTable(range = this.quill.getSelection()) {
    if (range == null) return [null, null, null, -1];
    const [cellLine, offset] = this.quill.getLine(range.index);
    if (cellLine == null || cellLine.statics.blotName !== TableCellLine.blotName) {
      return [null, null, null, -1];
    }
    const cell = cellLine.tableCell();
    const row = cell.row();
    const table = row.table();
    return [table, row, cell, offset];
  }

  insertTable(rows, columns) {
    const range = this.quill.getSelection(true)
    if (range == null) return
    let currentBlot = this.quill.getLeaf(range.index)[0]

    if (isInTableCell(currentBlot)) {
      // eslint-disable-next-line no-console
      console.warn(`Can not insert table into a table cell.`)
      return;
    }

    let delta = new Delta().retain(range.index)
    delta.insert('\n')
    // insert table column
    delta = new Array(columns).fill('\n').reduce((memo, text) => {
      memo.insert(text, { 'table-col': true })
      return memo
    }, delta)
    // insert table cell line with empty line
    delta = new Array(rows).fill(0).reduce(memo => {
      let tableRowId = rowId()
      return new Array(columns).fill('\n').reduce((memo, text) => {
        memo.insert(text, { 'table-cell-line': { row: tableRowId, cell: cellId() } });
        return memo
      }, memo)
    }, delta)

    this.quill.updateContents(delta, Quill.sources.USER)
    this.quill.setSelection(range.index + columns + 1, Quill.sources.API)
  }

  tableInsertColumn(columnType) {

    const tableContainer = Quill.find(this.table)
    const tableSelection = this.tableSelection;
    const tableColumnTool = this.columnTool;
    const columnToolCells = tableColumnTool.colToolCells();

    let colIndex = getColToolCellIndexByBoundary(
      columnToolCells,
      tableSelection.boundary,
      (cellRect, boundary) => {
        return Math.abs(cellRect.x + cellRect.width - boundary.x1) <= ERROR_LIMIT;
      },
      tableSelection.quill.root.parentNode
    );
    const newColumn = tableContainer.insertColumn(
      tableSelection.boundary,
      colIndex,
      columnType === "right",
      tableSelection.quill.root.parentNode
    );

    tableColumnTool.updateToolCells();
    tableSelection.quill.update(Quill.sources.USER);
    tableSelection.quill.setSelection(tableSelection.quill.getIndex(newColumn[0]), 0, Quill.sources.SILENT);
    tableSelection.setSelection(
      newColumn[0].domNode.getBoundingClientRect(),
      newColumn[0].domNode.getBoundingClientRect()
    );
  }

  insertColumnLeft() {
    this.tableInsertColumn("left");
  }

  insertColumnRight() {
    this.tableInsertColumn("right");
  }

  tableInsertRow(rowType) {
    const tableContainer = Quill.find(this.table);
    const tableSelection = this.tableSelection;

    const affectedCells = tableContainer.insertRow(
      tableSelection.boundary,
      rowType === "below",
      tableSelection.quill.root.parentNode
    );
    tableSelection.quill.update(Quill.sources.USER);
    tableSelection.quill.setSelection(tableSelection.quill.getIndex(affectedCells[0]), 0, Quill.sources.SILENT);
    tableSelection.setSelection(
      affectedCells[0].domNode.getBoundingClientRect(),
      affectedCells[0].domNode.getBoundingClientRect()
    );
  }

  insertRowAbove() {
    this.tableInsertRow("above");
  }

  insertRowBelow() {
    this.tableInsertRow("below");
  }

  deleteRow() {
    const tableContainer = Quill.find(this.table);
    const tableSelection = this.tableSelection;

    tableContainer.deleteRow(tableSelection.boundary, tableSelection.quill.root.parentNode);
    tableSelection.quill.update(Quill.sources.USER);
    tableSelection.clearSelection();
  }

  deleteColumn() {
    const tableContainer = Quill.find(this.table);
    const tableSelection = this.tableSelection;
    const tableColumnTool = this.columnTool;
    const columnToolCells = tableColumnTool.colToolCells();

    let colIndexes = getColToolCellIndexesByBoundary(
      columnToolCells,
      tableSelection.boundary,
      (cellRect, boundary) => {
        return cellRect.x + ERROR_LIMIT > boundary.x && cellRect.x + cellRect.width - ERROR_LIMIT < boundary.x1;
      },
      tableSelection.quill.root.parentNode
    );

    let isDeleteTable = tableContainer.deleteColumns(
      tableSelection.boundary,
      colIndexes,
      tableSelection.quill.root.parentNode
    );
    if (!isDeleteTable) {
      tableColumnTool.updateToolCells();
      tableSelection.quill.update(Quill.sources.USER);
      tableSelection.clearSelection();
    }
  }

  deleteTable() {
    const tableContainer = Quill.find(this.table);
    tableContainer.tableDestroy();
  }

  showTableTools(table, quill, options) {
    this.table = table
    this.columnTool = new TableColumnTool(table, quill, options)
    this.tableSelection = new TableSelection(table, quill, options)
  }

  hideTableTools() {
    this.columnTool && this.columnTool.destroy()
    this.tableSelection && this.tableSelection.destroy()
    this.tableOperationMenu && this.tableOperationMenu.destroy()
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
    handler(range, context) {
      const [line, offset] = this.quill.getLine(range.index)
      return !(!line.prev || line.prev.statics.blotName !== 'table-cell-line');
    },
  },

  'table-cell-line delete': {
    key: 'Delete',
    format: ['table-cell-line'],
    collapsed: true,
    suffix: /^$/,
    handler() {
    },
  },

  'table-cell-line enter': {
    key: 'Enter',
    shiftKey: null,
    format: ['table-cell-line'],
    handler(range, context) {
      // bugfix: a unexpected new line inserted when user compositionend with hitting Enter
      if (this.quill.selection && this.quill.selection.composing) return
      const Scope = Quill.imports.parchment.Scope
      if (range.length > 0) {
        this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
      }
      const lineFormats = Object.keys(context.format).reduce((formats, format) => {
        if (
          this.quill.scroll.query(format, Scope.BLOCK) &&
          !Array.isArray(context.format[format])
        ) {
          formats[format] = context.format[format];
        }
        return formats;
      }, {});
      // insert new cellLine with lineFormats
      this.quill.insertText(range.index, '\n', lineFormats['table-cell-line'], Quill.sources.USER);
      // Earlier scroll.deleteAt might have messed up our selection,
      // so insertText's built in selection preservation is not reliable
      this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
      this.quill.focus();
      Object.keys(context.format).forEach(name => {
        if (lineFormats[name] != null) return;
        if (Array.isArray(context.format[name])) return;
        if (name === 'link') return;
        this.quill.format(name, context.format[name], Quill.sources.USER);
      });
    },
  },

  'table-cell-line up': makeTableArrowHandler(true),
  'table-cell-line down': makeTableArrowHandler(false),
  'down-to-table': {
    key: 'ArrowDown',
    collapsed: true,
    handler(range, context) {
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
  },
  'up-to-table': {
    key: 'ArrowUp',
    collapsed: true,
    handler(range, context) {
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
  },
}

function makeTableArrowHandler(up) {
  return {
    key: up ? 'ArrowUp' : 'ArrowDown',
    collapsed: true,
    format: ['table-cell-line'],
    handler(range, context) {
      // TODO move to table module
      const key = up ? 'prev' : 'next'
      const targetLine = context.line[key]
      if (targetLine != null) return true

      const cell = context.line.parent
      const targetRow = cell.parent[key]

      if (targetRow != null && targetRow.statics.blotName === 'table-row') {
        let targetCell = targetRow.children.head
        let totalColspanOfTargetCell = parseInt(targetCell.formats().colspan, 10)
        let cur = cell
        let totalColspanOfCur = parseInt(cur.formats().colspan, 10)

        // get targetCell above current cell depends on colspan
        while (cur.prev != null) {
          cur = cur.prev
          totalColspanOfCur += parseInt(cur.formats().colspan, 10)
        }

        while (targetCell.next != null && totalColspanOfTargetCell < totalColspanOfCur) {
          targetCell = targetCell.next
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
      return false;
    },
  };
}

function isTableCell(blot) {
  return blot.statics.blotName === TableCell.blotName
}

function isInTableCell(current) {
  return current && current.parent
    ? isTableCell(current.parent)
      ? true
      : isInTableCell(current.parent)
    : false
}

export default BetterTablePlus;
