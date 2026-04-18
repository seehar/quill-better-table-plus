import Quill from 'quill'
import { css, getRelativeRect } from '../utils'
import { getColToolCellIndexByBoundary, getColToolCellIndexesByBoundary } from '../utils/table-util'
import { ERROR_LIMIT } from "../contants"
import type { TableContainer } from '../formats/table'
import type { Rect } from '../utils'

import operationIcon1 from '../assets/icons/icon_operation_1.svg'
import operationIcon2 from '../assets/icons/icon_operation_2.svg'
import operationIcon3 from '../assets/icons/icon_operation_3.svg'
import operationIcon4 from '../assets/icons/icon_operation_4.svg'
import operationIcon5 from '../assets/icons/icon_operation_5.svg'
import operationIcon6 from '../assets/icons/icon_operation_6.svg'
import operationIcon7 from '../assets/icons/icon_operation_7.svg'
import operationIcon8 from '../assets/icons/icon_operation_8.svg'
import operationIcon9 from '../assets/icons/icon_operation_9.svg'

const MENU_MIN_HEIGHT = 150
const MENU_WIDTH = 200
const DEFAULT_CELL_COLORS = ['white', 'red', 'yellow', 'blue']
const DEFAULT_COLOR_SUBTITLE = 'Background Colors'

interface MenuItem {
  text: string
  iconSrc: string
  handler: () => void
}

interface MenuItems {
  insertColumnRight: MenuItem
  insertColumnLeft: MenuItem
  insertRowUp: MenuItem
  insertRowDown: MenuItem
  mergeCells: MenuItem
  unmergeCells: MenuItem
  deleteColumn: MenuItem
  deleteRow: MenuItem
  deleteTable: MenuItem
}

const MENU_ITEMS_DEFAULT: MenuItems = {
  insertColumnRight: {
    text: 'Insert column right',
    iconSrc: operationIcon1,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer as unknown as TableContainer
      let colIndex = getColToolCellIndexByBoundary(
        (this as any).columnToolCells,
        (this as any).boundary,
        (cellRect: Rect, boundary: Rect) => {
          return Math.abs(cellRect.x + cellRect.width - boundary.x1) <= ERROR_LIMIT
        },
        (this as any).quill.root.parentNode
      )

      const newColumn = tableContainer.insertColumn(
        (this as any).boundary,
        colIndex,
        true,
        (this as any).quill.root.parentNode)

      ;(this as any).tableColumnTool.updateToolCells()
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).quill.setSelection(
        (this as any).quill.getIndex(newColumn![0]),
        0,
        Quill.sources.SILENT
      )
      ;(this as any).tableSelection.setSelection(
        newColumn![0].domNode.getBoundingClientRect(),
        newColumn![0].domNode.getBoundingClientRect()
      )
    },
  },

  insertColumnLeft: {
    text: 'Insert column left',
    iconSrc: operationIcon2,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      let colIndex = getColToolCellIndexByBoundary(
        (this as any).columnToolCells,
        (this as any).boundary,
        (cellRect: Rect, boundary: Rect) => {
          return Math.abs(cellRect.x - boundary.x) <= ERROR_LIMIT
        },
        (this as any).quill.root.parentNode
      )

      const newColumn = tableContainer.insertColumn(
        (this as any).boundary,
        colIndex,
        false,
        (this as any).quill.root.parentNode)

      ;(this as any).tableColumnTool.updateToolCells()
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).quill.setSelection(
        (this as any).quill.getIndex(newColumn![0]),
        0,
        Quill.sources.SILENT
      )
      ;(this as any).tableSelection.setSelection(
        newColumn![0].domNode.getBoundingClientRect(),
        newColumn![0].domNode.getBoundingClientRect()
      )
    },
  },

  insertRowUp: {
    text: 'Insert row up',
    iconSrc: operationIcon3,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      const affectedCells = tableContainer.insertRow(
        (this as any).boundary,
        false,
        (this as any).quill.root.parentNode
      )
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).quill.setSelection(
        (this as any).quill.getIndex(affectedCells![0]),
        0,
        Quill.sources.SILENT
      )
      ;(this as any).tableSelection.setSelection(
        affectedCells![0].domNode.getBoundingClientRect(),
        affectedCells![0].domNode.getBoundingClientRect()
      )
    },
  },

  insertRowDown: {
    text: 'Insert row down',
    iconSrc: operationIcon4,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      const affectedCells = tableContainer.insertRow(
        (this as any).boundary,
        true,
        (this as any).quill.root.parentNode
      )
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).quill.setSelection(
        (this as any).quill.getIndex(affectedCells![0]),
        0,
        Quill.sources.SILENT
      )
      ;(this as any).tableSelection.setSelection(
        affectedCells![0].domNode.getBoundingClientRect(),
        affectedCells![0].domNode.getBoundingClientRect()
      )
    },
  },

  mergeCells: {
    text: 'Merge selected cells',
    iconSrc: operationIcon5,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      const rowspan = tableContainer.rows().reduce((sum: number, row: any) => {
        const rowRect = getRelativeRect(
          row.domNode.getBoundingClientRect(),
          (this as any).quill.root.parentNode
        )
        if (
          rowRect.y > (this as any).boundary.y - ERROR_LIMIT &&
          rowRect.y + rowRect.height < (this as any).boundary.y + (this as any).boundary.height + ERROR_LIMIT
        ) {
          sum += 1
        }
        return sum
      }, 0)

      const colspan = (this as any).columnToolCells.reduce((sum: number, cell: HTMLElement) => {
        const cellRect = getRelativeRect(
          cell.getBoundingClientRect(),
          (this as any).quill.root.parentNode
        )
        if (
          cellRect.x > (this as any).boundary.x - ERROR_LIMIT &&
          cellRect.x + cellRect.width < (this as any).boundary.x + (this as any).boundary.width + ERROR_LIMIT
        ) {
          sum += 1
        }
        return sum
      }, 0)

      const mergedCell = tableContainer.mergeCells(
        (this as any).boundary,
        (this as any).selectedTds,
        rowspan,
        colspan,
        (this as any).quill.root.parentNode
      )
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).tableSelection.setSelection(
        mergedCell!.domNode.getBoundingClientRect(),
        mergedCell!.domNode.getBoundingClientRect()
      )
    },
  },

  unmergeCells: {
    text: 'Unmerge cells',
    iconSrc: operationIcon6,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      tableContainer.unmergeCells(
        (this as any).selectedTds,
        (this as any).quill.root.parentNode
      )
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).tableSelection.clearSelection()
    },
  },

  deleteColumn: {
    text: 'Delete selected columns',
    iconSrc: operationIcon7,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      let colIndexes = getColToolCellIndexesByBoundary(
        (this as any).columnToolCells,
        (this as any).boundary,
        (cellRect: Rect, boundary: Rect) => {
          return cellRect.x + ERROR_LIMIT > boundary.x &&
            cellRect.x + cellRect.width - ERROR_LIMIT < boundary.x1
        },
        (this as any).quill.root.parentNode
      )

      const isDeleteTable = tableContainer.deleteColumns(
        (this as any).boundary,
        colIndexes,
        (this as any).quill.root.parentNode
      )
      if (!isDeleteTable) {
        ;(this as any).tableColumnTool.updateToolCells()
        ;(this as any).quill.update(Quill.sources.USER)
        ;(this as any).tableSelection.clearSelection()
      }
    },
  },

  deleteRow: {
    text: 'Delete selected rows',
    iconSrc: operationIcon8,
    handler() {
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      tableContainer.deleteRow(
        (this as any).boundary,
        (this as any).quill.root.parentNode
      )
      ;(this as any).quill.update(Quill.sources.USER)
      ;(this as any).tableSelection.clearSelection()
    },
  },

  deleteTable: {
    text: 'Delete table',
    iconSrc: operationIcon9,
    handler() {
      const betterTableModule = (this as any).quill.getModule('better-table-plus')
      const tableContainer = Quill.find((this as any).table) as unknown as TableContainer
      betterTableModule.hideTableTools()
      tableContainer.remove()
      ;(this as any).quill.update(Quill.sources.USER)
    },
  },
}

export default class TableOperationMenu {
  tableSelection!: any
  table!: HTMLElement
  quill!: any
  options!: any
  menuItems!: MenuItems
  tableColumnTool!: any
  boundary!: any
  selectedTds!: any[]
  destroyHandler!: () => void
  columnToolCells!: HTMLElement[]
  colorSubTitle!: string
  cellColors!: string[]
  domNode!: HTMLDivElement

  constructor(params: { table: HTMLElement, left: number, top: number, row?: HTMLElement, cell?: HTMLElement }, quill: any, options: any) {
    const betterTableModule = quill.getModule('better-table-plus')
    this.tableSelection = betterTableModule.tableSelection
    this.table = params.table
    this.quill = quill
    this.options = options
    this.menuItems = Object.assign({}, MENU_ITEMS_DEFAULT, options.items) as MenuItems
    this.tableColumnTool = betterTableModule.columnTool
    this.boundary = this.tableSelection.boundary
    this.selectedTds = this.tableSelection.selectedTds
    this.destroyHandler = this.destroy.bind(this)
    this.columnToolCells = this.tableColumnTool.colToolCells()
    this.colorSubTitle = options.color && (options.color as any).text ? (options.color as any).text : DEFAULT_COLOR_SUBTITLE
    this.cellColors = options.color && (options.color as any).colors ? (options.color as any).colors : DEFAULT_CELL_COLORS

    this.menuInitial(params)
    this.mount()
    document.addEventListener("click", this.destroyHandler, false)
  }

  mount() {
    document.body.appendChild(this.domNode)
  }

  destroy() {
    this.domNode.remove()
    document.removeEventListener("click", this.destroyHandler, false)
    return null
  }

  menuInitial({ table, left, top }: { table: HTMLElement, left: number, top: number }) {
    this.domNode = document.createElement('div')
    this.domNode.classList.add('qlbt-operation-menu')
    css(this.domNode, {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      'min-height': `${MENU_MIN_HEIGHT}px`,
      width: `${MENU_WIDTH}px`,
    })

    for (const name in this.menuItems) {
      if (this.menuItems[name as keyof MenuItems]) {
        this.domNode.appendChild(
          this.menuItemCreator(
            Object.assign({}, MENU_ITEMS_DEFAULT[name as keyof MenuItems], (this.menuItems as any)[name])
          )
        )

        if (['insertRowDown', 'unmergeCells'].indexOf(name) > -1) {
          this.domNode.appendChild(
            dividingCreator()
          )
        }
      }
    }

    if (this.options.color && this.options.color !== false) {
      this.domNode.appendChild(
        dividingCreator()
      )
      this.domNode.appendChild(
        subTitleCreator(this.colorSubTitle)
      )
      this.domNode.appendChild(this.colorsItemCreator(this.cellColors))
    }
  }

  colorsItemCreator(colors: string[]) {
    const self = this
    const node = document.createElement('div')
    node.classList.add('qlbt-operation-color-picker')

    colors.forEach(function(color: string) {
      const colorBox = colorBoxCreator(color)
      node.appendChild(colorBox)
    })

    function colorBoxCreator(color: string) {
      const box = document.createElement('div')
      box.classList.add('qlbt-operation-color-picker-item')
      box.setAttribute('data-color', color)
      box.style.backgroundColor = color

      box.addEventListener('click', function() {
        const selectedTds = self.tableSelection.selectedTds
        if (selectedTds && selectedTds.length > 0) {
          selectedTds.forEach((tableCell: any) => {
            tableCell.format('cell-bg', color)
          })
        }
      }, false)

      return box
    }

    return node
  }

  menuItemCreator({ text, iconSrc, handler }: MenuItem) {
    const node = document.createElement('div')
    node.classList.add('qlbt-operation-menu-item')

    const iconSpan = document.createElement('span')
    iconSpan.classList.add('qlbt-operation-menu-icon')
    iconSpan.innerHTML = iconSrc

    const textSpan = document.createElement('span')
    textSpan.classList.add('qlbt-operation-menu-text')
    textSpan.innerText = text

    node.appendChild(iconSpan)
    node.appendChild(textSpan)
    node.addEventListener('click', handler.bind(this), false)
    return node
  }
}

function dividingCreator() {
  const dividing = document.createElement('div')
  dividing.classList.add('qlbt-operation-menu-dividing')
  return dividing
}

function subTitleCreator(title: string) {
  const subTitle = document.createElement('div')
  subTitle.classList.add('qlbt-operation-menu-subtitle')
  subTitle.innerText = title
  return subTitle
}
