import Quill from "quill"
import { getRelativeRect } from '../utils'
import Header from './header'
import { ERROR_LIMIT } from "../contants"

const Break = Quill.import("blots/break") as any
const Block = Quill.import("blots/block") as any
const Container = Quill.import("blots/container") as any

const COL_ATTRIBUTES = ["width"]
const COL_DEFAULT: Record<string, any> = {
  width: 100,
}
const CELL_IDENTITY_KEYS = ["row", "cell"]
const CELL_ATTRIBUTES = ["rowspan", "colspan"]
const CELL_DEFAULT: Record<string, any> = {
  rowspan: 1,
  colspan: 1,
}

interface CellValue {
  row?: string
  cell?: string
  rowspan?: string | number
  colspan?: string | number
  'cell-bg'?: string
  width?: string | number
  value?: any
}

class TableCellLine extends Block {
  static create(value: CellValue) {
    const node = super.create(value) as HTMLElement

    CELL_IDENTITY_KEYS.forEach(key => {
      const identityMaker = key === 'row'
        ? rowId : cellId
      node.setAttribute(`data-${key}`, (value as any)[key] || identityMaker())
    })

    CELL_ATTRIBUTES.forEach(attrName => {
      node.setAttribute(`data-${attrName}`, (value as any)[attrName] || CELL_DEFAULT[attrName])
    })

    if ((value as any)['cell-bg']) {
      node.setAttribute('data-cell-bg', (value as any)['cell-bg'])
    }

    return node
  }

  static formats(domNode: HTMLElement) {
    const formats: Record<string, any> = {}

    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).concat(['cell-bg']).reduce((formats, attribute) => {
      if (domNode.hasAttribute(`data-${attribute}`)) {
        formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
      }
      return formats
    }, formats)
  }

  format(name: string, value: any) {
    if (CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(`data-${name}`, value)
      } else {
        this.domNode.removeAttribute(`data-${name}`)
      }
    } else if (name === 'cell-bg') {
      if (value) {
        this.domNode.setAttribute('data-cell-bg', value)
      } else {
        this.domNode.removeAttribute('data-cell-bg')
      }
    } else if (name === 'header') {
      if (!value) return
      const formats = TableCellLine.formats(this.domNode)
      const { row, cell, rowspan, colspan } = formats
      super.format(name, {
        value,
        row,
        cell,
        rowspan,
        colspan,
      })
    } else {
      super.format(name, value)
    }
  }

  optimize(context: any) {
    const rowId = this.domNode.getAttribute('data-row')
    const rowspan = this.domNode.getAttribute('data-rowspan')
    const colspan = this.domNode.getAttribute('data-colspan')
    const cellBg = this.domNode.getAttribute('data-cell-bg')
    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row: rowId,
        colspan,
        rowspan,
        'cell-bg': cellBg,
      })
    }
    super.optimize(context)
  }

  tableCell() {
    return this.parent
  }
}

TableCellLine.blotName = "table-cell-line"
TableCellLine.className = "qlbt-cell-line"
TableCellLine.tagName = "P"

class TableCell extends Container {
  checkMerge() {
    if (super.checkMerge() && (this as any).next.children.head != null) {
      const thisHead = (this as any).children.head.formats()[(this as any).children.head.statics.blotName]
      const thisTail = (this as any).children.tail.formats()[(this as any).children.tail.statics.blotName]
      const nextHead = (this as any).next.children.head.formats()[(this as any).next.children.head.statics.blotName]
      const nextTail = (this as any).next.children.tail.formats()[(this as any).next.children.tail.statics.blotName]
      return (
        thisHead.cell === thisTail.cell &&
        thisHead.cell === nextHead.cell &&
        thisHead.cell === nextTail.cell
      )
    }
    return false
  }

  static create(value: CellValue) {
    const node = super.create(value) as HTMLElement
    node.setAttribute("data-row", (value as any).row)

    CELL_ATTRIBUTES.forEach(attrName => {
      if ((value as any)[attrName]) {
        node.setAttribute(attrName, (value as any)[attrName])
      }
    })

    if ((value as any)['cell-bg']) {
      node.setAttribute('data-cell-bg', (value as any)['cell-bg'])
      node.style.backgroundColor = (value as any)['cell-bg']
    }

    return node
  }

  static formats(domNode: HTMLElement) {
    const formats: Record<string, any> = {}

    if (domNode.hasAttribute("data-row")) {
      formats.row = domNode.getAttribute("data-row")
    }

    if (domNode.hasAttribute("data-cell-bg")) {
      formats["cell-bg"] = domNode.getAttribute("data-cell-bg")
    }

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute)
      }

      return formats
    }, formats)
  }

  cellOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this)
    }
    return -1
  }

  formats() {
    const formats: Record<string, any> = {}

    if (this.domNode.hasAttribute("data-row")) {
      formats.row = this.domNode.getAttribute("data-row")
    }

    if (this.domNode.hasAttribute("data-cell-bg")) {
      formats["cell-bg"] = this.domNode.getAttribute("data-cell-bg")
    }

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (this.domNode.hasAttribute(attribute)) {
        formats[attribute] = this.domNode.getAttribute(attribute)
      }

      return formats
    }, formats)
  }

  toggleAttribute(name: string, value: any) {
    if (value) {
      this.domNode.setAttribute(name, value)
    } else {
      this.domNode.removeAttribute(name)
    }
  }

  formatChildren(name: string, value: any) {
    this.children.forEach((child: any) => {
      child.format(name, value)
    })
  }

  format(name: string, value: any) {
    if (CELL_ATTRIBUTES.indexOf(name) > -1) {
      this.toggleAttribute(name, value)
      this.formatChildren(name, value)
    } else if (['row'].indexOf(name) > -1) {
      this.toggleAttribute(`data-${name}`, value)
      this.formatChildren(name, value)
    } else if (name === 'cell-bg') {
      this.toggleAttribute('data-cell-bg', value)
      this.formatChildren(name, value)

      if (value) {
        this.domNode.style.backgroundColor = value
      } else {
        this.domNode.style.backgroundColor = 'initial'
      }
    } else {
      super.format(name, value)
    }
  }

  optimize(context: any) {
    const rowId = this.domNode.getAttribute("data-row")

    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row: rowId,
      })
    }
    super.optimize(context)
  }

  row() {
    return this.parent
  }

  rowOffset() {
    if (this.row()) {
      return this.row().rowOffset()
    }
    return -1
  }

  table() {
    return this.row() && this.row().table()
  }
}

TableCell.blotName = "table"
TableCell.tagName = "TD"

class TableRow extends Container {
  checkMerge() {
    if (super.checkMerge() && (this as any).next.children.head != null) {
      const thisHead = (this as any).children.head.formats()
      const thisTail = (this as any).children.tail.formats()
      const nextHead = (this as any).next.children.head.formats()
      const nextTail = (this as any).next.children.tail.formats()

      return (
        thisHead.row === thisTail.row &&
        thisHead.row === nextHead.row &&
        thisHead.row === nextTail.row
      )
    }
    return false
  }

  static create(value: CellValue) {
    const node = super.create(value) as HTMLElement
    node.setAttribute("data-row", (value as any).row)
    return node
  }

  formats() {
    return ["row"].reduce((formats: Record<string, any>, attrName) => {
      if (this.domNode.hasAttribute(`data-${attrName}`)) {
        formats[attrName] = this.domNode.getAttribute(`data-${attrName}`)
      }
      return formats
    }, {})
  }

  optimize(context: any) {
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName)
    }

    this.enforceAllowedChildren()
    if ((this as any).uiNode != null && (this as any).uiNode !== this.domNode.firstChild) {
      this.domNode.insertBefore((this as any).uiNode, this.domNode.firstChild)
    }

if (
      this.children.length > 0 &&
      (this as any).next != null &&
      this.checkMerge()
    ) {
      const next = this.next as any
      if (next && next.moveChildren && next.children) {
        next.moveChildren(this)
        next.remove()
      }
    }
  }

  rowOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this)
    }
    return -1
  }

  table() {
    return this.parent && this.parent.parent
  }
}

TableRow.blotName = "table-row"
TableRow.tagName = "TR"

class TableBody extends Container {
}

TableBody.blotName = "table-body"
TableBody.tagName = "TBODY"

class TableCol extends Block {
  static create(value: any) {
    const node = super.create(value) as HTMLElement
    COL_ATTRIBUTES.forEach(attrName => {
      node.setAttribute(`${attrName}`, value[attrName] || COL_DEFAULT[attrName])
    })
    return node
  }

  static formats(domNode: HTMLElement) {
    return COL_ATTRIBUTES.reduce((formats: Record<string, any>, attribute) => {
      if (domNode.hasAttribute(`${attribute}`)) {
        formats[attribute] =
          domNode.getAttribute(`${attribute}`) || undefined
      }
      return formats
    }, {})
  }

  formats(value?: any) {
    const superFormats = super.formats()
    if (value) {
      this.domNode.setAttribute("width", value)
    }
    return superFormats
  }

  format(name: string, value: any) {
    if (COL_ATTRIBUTES.indexOf(name) > -1) {
      this.domNode.setAttribute(`${name}`, value || COL_DEFAULT[name])
    } else {
      super.format(name, value)
    }
  }

  html() {
    return this.domNode.outerHTML
  }
}

TableCol.blotName = "table-col"
TableCol.tagName = "col"

class TableColGroup extends Container {
}

TableColGroup.blotName = "table-col-group"
TableColGroup.tagName = "colgroup"

class TableContainer extends Container {
  static create(value: any) {
    return super.create(value)
  }

  constructor(scroll: any, domNode: any) {
    super(scroll, domNode)
    this.updateTableWidth()
  }

  updateTableWidth() {
    setTimeout(() => {
      const colGroup = this.colGroup()
      if (!colGroup) return
      const tableWidth = this.domNode.clientWidth

      colGroup.children.reduce((_: any, col: any) => {
        const colWidthRate = (col.domNode.clientWidth / tableWidth * 100).toFixed(2)
        col.formats(colWidthRate + "%")
        return null
      })
    }, 0)
  }

  cells(column: number) {
    return this.rows().map((row: any) => row.children.at(column))
  }

  colGroup() {
    return this.children.head
  }

  deleteColumns(compareRect: any, delIndexes: number[] = [], editorWrapper: HTMLElement) {
    const [body] = this.descendants(TableBody) as [TableBody]
    if (body == null || body.children.head == null) return

    const tableCells = this.descendants(TableCell) as TableCell[]
    const removedCells: TableCell[] = []
    const modifiedCells: TableCell[] = []

    tableCells.forEach(cell => {
      const cellRect = getRelativeRect(
        cell.domNode.getBoundingClientRect(),
        editorWrapper
      )

      if (
        cellRect.x + ERROR_LIMIT > compareRect.x &&
        cellRect.x1 - ERROR_LIMIT < compareRect.x1
      ) {
        removedCells.push(cell)
      } else if (
        cellRect.x < compareRect.x + ERROR_LIMIT &&
        cellRect.x1 > compareRect.x1 - ERROR_LIMIT
      ) {
        modifiedCells.push(cell)
      }
    })

    if (removedCells.length === tableCells.length) {
      this.tableDestroy()
      return true
    }

    delIndexes.forEach((delIndex) => {
      this.colGroup().children.at(delIndexes[0]).remove()
    })

    removedCells.forEach(cell => {
      cell.remove()
    })

    modifiedCells.forEach(cell => {
      const cellColspan = parseInt(cell.formats().colspan, 10)
      cell.format('colspan', cellColspan - delIndexes.length)
    })

    this.updateTableWidth()
  }

  deleteRow(compareRect: any, editorWrapper: HTMLElement) {
    const [body] = this.descendants(TableBody) as [TableBody]
    if (body == null || body.children.head == null) return

    const tableCells = this.descendants(TableCell) as TableCell[]
    const tableRows = this.descendants(TableRow) as TableRow[]
    const removedCells: TableCell[] = []
    const modifiedCells: TableCell[] = []
    const fallCells: TableCell[] = []

    const removedRows = tableRows.filter(row => {
      const rowRect = getRelativeRect(
        row.domNode.getBoundingClientRect(),
        editorWrapper
      )

      return rowRect.y > compareRect.y - ERROR_LIMIT &&
        rowRect.y1 < compareRect.y1 + ERROR_LIMIT
    })

    tableCells.forEach(cell => {
      const cellRect = getRelativeRect(
        cell.domNode.getBoundingClientRect(),
        editorWrapper
      )

      if (
        cellRect.y > compareRect.y - ERROR_LIMIT &&
        cellRect.y1 < compareRect.y1 + ERROR_LIMIT
      ) {
        removedCells.push(cell)
      } else if (
        cellRect.y < compareRect.y + ERROR_LIMIT &&
        cellRect.y1 > compareRect.y1 - ERROR_LIMIT
      ) {
        modifiedCells.push(cell)

        if (Math.abs(cellRect.y - compareRect.y) < ERROR_LIMIT) {
          fallCells.push(cell)
        }
      }
    })

    if (removedCells.length === tableCells.length) {
      this.tableDestroy()
      return
    }

    const removedRowsLength = this.rows().reduce((sum: number, row: any) => {
      const rowRect = getRelativeRect(
        row.domNode.getBoundingClientRect(),
        editorWrapper
      )

      if (
        rowRect.y > compareRect.y - ERROR_LIMIT &&
        rowRect.y1 < compareRect.y1 + ERROR_LIMIT
      ) {
        sum += 1
      }
      return sum
    }, 0)

    fallCells.forEach(cell => {
      const cellRect = getRelativeRect(
        cell.domNode.getBoundingClientRect(),
        editorWrapper
      )
      const nextRow = (cell.parent as TableRow).next
      const cellsInNextRow = nextRow.children

      const refCell = cellsInNextRow.reduce((ref: any, compareCell: any) => {
        const compareRect = getRelativeRect(
          compareCell.domNode.getBoundingClientRect(),
          editorWrapper
        )
        if (Math.abs(cellRect.x1 - compareRect.x) < ERROR_LIMIT) {
          ref = compareCell
        }
        return ref
      }, null)

      nextRow.insertBefore(cell, refCell)
      cell.format('row', nextRow.formats().row)
    })

    removedCells.forEach(cell => {
      cell.remove()
    })

    modifiedCells.forEach(cell => {
      const cellRowspan = parseInt(cell.formats().rowspan, 10)
      cell.format("rowspan", cellRowspan - removedRowsLength)
    })

    removedRows.forEach((row: any) => row.remove())
  }

  tableDestroy() {
    const quill = Quill.find(this.scroll.domNode.parentNode) as any
    const tableModule = quill.getModule("better-table-plus")
    this.remove()
    tableModule.hideTableTools()
    quill.update(Quill.sources.USER)
  }

  insertCell(tableRow: TableRow, ref: any) {
    const id = cellId()
    const rId = tableRow.formats().row
    const tableCell = this.scroll.create(
      TableCell.blotName,
      Object.assign({}, CELL_DEFAULT, {
        row: rId,
      })
    )
    const cellLine = this.scroll.create(TableCellLine.blotName, {
      row: rId,
      cell: id,
    })
    tableCell.appendChild(cellLine)

    if (ref) {
      tableRow.insertBefore(tableCell, ref)
    } else {
      tableRow.appendChild(tableCell)
    }
  }

  insertColumn(compareRect: any, colIndex: number, isRight = true, editorWrapper: HTMLElement) {
    const [body] = this.descendants(TableBody) as [TableBody]
    const [tableColGroup] = this.descendants(TableColGroup) as [TableColGroup]
    const tableCols = this.descendants(TableCol) as TableCol[]
    const addAsideCells: TableCell[] = []
    const modifiedCells: TableCell[] = []
    const affectedCells: TableCell[] = []

    if (body == null || body.children.head == null) return
    const tableCells = this.descendants(TableCell) as TableCell[]
    tableCells.forEach(cell => {
      const cellRect = getRelativeRect(
        cell.domNode.getBoundingClientRect(),
        editorWrapper
      )

      if (isRight) {
        if (Math.abs(cellRect.x1 - compareRect.x1) < ERROR_LIMIT) {
          addAsideCells.push(cell)
        } else if (
          compareRect.x1 - cellRect.x > ERROR_LIMIT &&
          compareRect.x1 - cellRect.x1 < -ERROR_LIMIT
        ) {
          modifiedCells.push(cell)
        }
      } else {
        if (Math.abs(cellRect.x - compareRect.x) < ERROR_LIMIT) {
          addAsideCells.push(cell)
        } else if (
          compareRect.x - cellRect.x > ERROR_LIMIT &&
          compareRect.x - cellRect.x1 < -ERROR_LIMIT
        ) {
          modifiedCells.push(cell)
        }
      }
    })

    addAsideCells.forEach(cell => {
      const ref = isRight ? cell.next : cell
      const id = cellId()
      const tableRow = cell.parent as TableRow
      const rId = tableRow.formats().row
      const cellFormats = cell.formats()
      const tableCell = this.scroll.create(
        TableCell.blotName,
        Object.assign({}, CELL_DEFAULT, {
          row: rId,
          rowspan: cellFormats.rowspan,
        })
      )
      const cellLine = this.scroll.create(TableCellLine.blotName, {
        row: rId,
        cell: id,
        rowspan: cellFormats.rowspan,
      })
      tableCell.appendChild(cellLine)

      if (ref) {
        tableRow.insertBefore(tableCell, ref)
      } else {
        tableRow.appendChild(tableCell)
      }
      affectedCells.push(tableCell)
    })

    const tableCol = this.scroll.create(TableCol.blotName, true)
    const colRef = isRight ? tableCols[colIndex].next : tableCols[colIndex]
    if (colRef) {
      tableColGroup.insertBefore(tableCol, colRef)
    } else {
      tableColGroup.appendChild(tableCol)
    }

    modifiedCells.forEach(cell => {
      const cellColspan = cell.formats().colspan
      cell.format('colspan', parseInt(cellColspan, 10) + 1)
      affectedCells.push(cell)
    })

    affectedCells.sort((cellA, cellB) => {
      const y1 = cellA.domNode.getBoundingClientRect().y
      const y2 = cellB.domNode.getBoundingClientRect().y
      return y1 - y2
    })

    this.updateTableWidth()
    return affectedCells
  }

  insertRow(compareRect: any, isDown: boolean, editorWrapper: HTMLElement) {
    const [body] = this.descendants(TableBody) as [TableBody]
    if (body == null || body.children.head == null) return

    const tableCells = this.descendants(TableCell) as TableCell[]
    const rId = rowId()
    const newRow = this.scroll.create(TableRow.blotName, {
      row: rId,
    }) as TableRow
    const addBelowCells: TableCell[] = []
    const modifiedCells: TableCell[] = []
    const affectedCells: TableCell[] = []

    tableCells.forEach(cell => {
      const cellRect = getRelativeRect(
        cell.domNode.getBoundingClientRect(),
        editorWrapper
      )

      if (isDown) {
        if (Math.abs(cellRect.y1 - compareRect.y1) < ERROR_LIMIT) {
          addBelowCells.push(cell)
        } else if (
          compareRect.y1 - cellRect.y > ERROR_LIMIT &&
          compareRect.y1 - cellRect.y1 < -ERROR_LIMIT
        ) {
          modifiedCells.push(cell)
        }
      } else {
        if (Math.abs(cellRect.y - compareRect.y) < ERROR_LIMIT) {
          addBelowCells.push(cell)
        } else if (
          compareRect.y - cellRect.y > ERROR_LIMIT &&
          compareRect.y - cellRect.y1 < -ERROR_LIMIT
        ) {
          modifiedCells.push(cell)
        }
      }
    })

    const sortFunc = (cellA: TableCell, cellB: TableCell) => {
      const x1 = cellA.domNode.getBoundingClientRect().x
      const x2 = cellB.domNode.getBoundingClientRect().x
      return x1 - x2
    }
    addBelowCells.sort(sortFunc)

    addBelowCells.forEach(cell => {
      const cId = cellId()
      const cellFormats = cell.formats()

      const tableCell = this.scroll.create(TableCell.blotName, Object.assign(
        {}, CELL_DEFAULT, { row: rId, colspan: cellFormats.colspan }
      )) as TableCell
      const cellLine = this.scroll.create(TableCellLine.blotName, {
        row: rId,
        cell: cId,
        colspan: cellFormats.colspan,
      }) as TableCellLine
      const empty = this.scroll.create(Break.blotName)
      cellLine.appendChild(empty)
      tableCell.appendChild(cellLine)
      newRow.appendChild(tableCell)
      affectedCells.push(tableCell)
    })

    modifiedCells.forEach(cell => {
      const cellRowspan = parseInt(cell.formats().rowspan, 10)
      cell.format("rowspan", cellRowspan + 1)
      affectedCells.push(cell)
    })

    const refRow = this.rows().find((row: any) => {
      const rowRect = getRelativeRect(
        row.domNode.getBoundingClientRect(),
        editorWrapper
      )
      if (isDown) {
        return Math.abs(rowRect.y - compareRect.y - compareRect.height) < ERROR_LIMIT
      } else {
        return Math.abs(rowRect.y - compareRect.y) < ERROR_LIMIT
      }
    })
    body.insertBefore(newRow, refRow)

    affectedCells.sort(sortFunc)
    return affectedCells
  }

  mergeCells(compareRect: any, mergingCells: TableCell[], rowspan: number, colspan: number, editorWrapper: HTMLElement) {
    const mergedCell = mergingCells.reduce((result: TableCell | null, tableCell: TableCell, index: number) => {
      if (index !== 0) {
        // Safe check: ensure moveChildren exists before calling
        if (result && typeof tableCell.moveChildren === 'function') {
          tableCell.moveChildren(result)
        }
        if (typeof tableCell.remove === 'function') {
          tableCell.remove()
        }
      } else {
        tableCell.format('colspan', colspan)
        tableCell.format('rowspan', rowspan)
        result = tableCell
      }

      return result
    }, null)

    if (!mergedCell) return null

    const rowIdAttr = mergedCell.domNode.getAttribute('data-row')
    const cellIdAttr = (mergedCell.children as any).head.domNode.getAttribute('data-cell')
    mergedCell.children.forEach((cellLine: any) => {
      cellLine.format('cell', cellIdAttr)
      cellLine.format('row', rowIdAttr)
      cellLine.format('colspan', colspan)
      cellLine.format('rowspan', rowspan)
    })

    return mergedCell
  }

  unmergeCells(unmergingCells: TableCell[], editorWrapper: HTMLElement) {
    let cellFormats: Record<string, any> = {}
    let cellRowspan = 1
    let cellColspan = 1

    unmergingCells.forEach(tableCell => {
      cellFormats = tableCell.formats()
      cellRowspan = parseInt(cellFormats.rowspan, 10) || 1
      cellColspan = parseInt(cellFormats.colspan, 10) || 1

      if (cellColspan > 1) {
        let ref = tableCell.next
        const row = tableCell.row() as TableRow
        tableCell.format('colspan', 1)
        for (let i = cellColspan; i > 1; i--) {
          this.insertCell(row, ref)
        }
      }

      if (cellRowspan > 1) {
        let i = cellRowspan
        let nextRow = (tableCell.row() as TableRow).next
        while (i > 1) {
          const refInNextRow = nextRow.children
            .reduce((result: any, cell: any) => {
              const compareRect = getRelativeRect(
                tableCell.domNode.getBoundingClientRect(),
                editorWrapper
              )
              const cellRect = getRelativeRect(
                cell.domNode.getBoundingClientRect(),
                editorWrapper
              )
              if (Math.abs(compareRect.x1 - cellRect.x) < ERROR_LIMIT) {
                result = cell
              }
              return result
            }, null)

          for (let j = cellColspan; j > 0; j--) {
            this.insertCell(nextRow, refInNextRow)
          }

          i -= 1
          nextRow = nextRow.next
        }

        tableCell.format('rowspan', 1)
      }
    })
  }

  rows() {
    const body = this.children.tail as TableBody | null
    if (body == null) return []
    return body.children.map((row: any) => row)
  }
}

TableContainer.blotName = "table-container"
TableContainer.className = "quill-better-table"
TableContainer.tagName = "TABLE"

class TableViewWrapper extends Container {
  constructor(scroll: any, domNode: any) {
    super(scroll, domNode)
    const quill = Quill.find(scroll.domNode.parentNode) as any
    domNode.addEventListener('scroll', (e: Event) => {
      const tableModule = quill.getModule('better-table-plus')
      if (tableModule.columnTool) {
        tableModule.columnTool.domNode.scrollLeft = (e.target as HTMLElement).scrollLeft
      }

      if (tableModule.tableSelection &&
        tableModule.tableSelection.selectedTds.length > 0) {
        tableModule.tableSelection.repositionHelpLines()
      }
    }, false)
  }

  table() {
    return this.children.head
  }
}

TableViewWrapper.blotName = "table-view"
TableViewWrapper.className = "quill-better-table-wrapper"
TableViewWrapper.tagName = "DIV"

TableViewWrapper.allowedChildren = [TableContainer]
TableContainer.requiredContainer = TableViewWrapper

TableContainer.allowedChildren = [TableBody, TableColGroup]
TableBody.requiredContainer = TableContainer

TableBody.allowedChildren = [TableRow]
TableRow.requiredContainer = TableBody

TableRow.allowedChildren = [TableCell]
TableCell.requiredContainer = TableRow

TableCell.allowedChildren = [TableCellLine, Header]
TableCellLine.requiredContainer = TableCell

TableColGroup.allowedChildren = [TableCol]
TableColGroup.requiredContainer = TableContainer

TableCol.requiredContainer = TableColGroup

function rowId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 6)
  return `row-${id}`
}

function cellId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 6)
  return `cell-${id}`
}

export {
  TableCol,
  TableColGroup,
  TableCellLine,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  TableViewWrapper,
  rowId,
  cellId,
  CELL_IDENTITY_KEYS,
  CELL_ATTRIBUTES,
}
