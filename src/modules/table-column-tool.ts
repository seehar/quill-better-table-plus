import Quill from 'quill'
import { css } from '../utils'
import { getColToolCellIndexByBoundary, getColToolCellIndexesByBoundary } from '../utils/table-util'
import { ERROR_LIMIT } from "../contants"
import type { TableContainer } from '../formats/table'

const CELL_MIN_WIDTH = 50
const COL_TOOL_CELL_HEIGHT = 12
const COL_TOOL_HEIGHT = 12
const PRIMARY_COLOR = '#35A7ED'

export default class TableColumnTool {
  table!: HTMLElement
  quill!: any
  options!: any
  domNode: HTMLDivElement | null = null

  constructor(table: HTMLElement | null, quill: any, options: any) {
    if (!table) return
    this.table = table
    this.quill = quill
    this.options = options
    this.domNode = null

    this.initColTool()
  }

  initColTool() {
    const parent = this.quill.root.parentNode as HTMLElement
    const containerRect = parent.getBoundingClientRect()
    const tableViewRect = ((this.table as HTMLElement).parentNode as HTMLElement).getBoundingClientRect()

    this.domNode = document.createElement('div')
    this.domNode.classList.add('qlbt-col-tool')
    this.updateToolCells()
    parent.appendChild(this.domNode)
    css(this.domNode, {
      width: `${tableViewRect.width}px`,
      height: `${COL_TOOL_HEIGHT}px`,
      left: `${tableViewRect.left - containerRect.left + parent.scrollLeft}px`,
      top: `${tableViewRect.top - containerRect.top + parent.scrollTop - COL_TOOL_HEIGHT - 5}px`,
    })
  }

  createToolCell(isClassName = true) {
    const toolCell = document.createElement('div')
    toolCell.classList.add('qlbt-col-tool-cell')
    const resizeHolder = document.createElement('div')
    if (isClassName) {
      resizeHolder.classList.add('qlbt-col-tool-cell-holder')
    }
    css(toolCell, {
      'height': `${COL_TOOL_CELL_HEIGHT}px`,
    })
    toolCell.appendChild(resizeHolder)
    return toolCell
  }

  updateToolCells() {
    if (!this.domNode) return

    const tableContainer = Quill.find(this.table) as unknown as TableContainer
    if (!tableContainer || !tableContainer.children) return
    const CellsInFirstRow = (tableContainer.children.tail as any).children.head.children
    const tableCols = tableContainer.colGroup().children

    const tableWidth = (tableContainer.children.tail as any).domNode.clientWidth

    const cellsNumber = computeCellsNumber(CellsInFirstRow)
    const existCells = Array.from(this.domNode.querySelectorAll('.qlbt-col-tool-cell')) as HTMLDivElement[]

    const totalCount = Math.max(cellsNumber, existCells.length)
    for (let index = 0; index < totalCount; index++) {
      const col = tableCols.at(index) as any
      const colWidth = col && col.domNode.clientWidth
      let toolCell: HTMLDivElement | null = null
      if (!existCells[index]) {
        toolCell = this.createToolCell(index + 1 !== totalCount)
        this.domNode!.appendChild(toolCell)
        this.addColCellHolderHandler(toolCell)
        const colWidthRate = (colWidth / tableWidth * 100).toFixed(2)
        css(toolCell, {
          'min-width': `${colWidthRate}%`,
        })
      } else if (existCells[index] && index >= cellsNumber) {
        existCells[index].remove()
      } else {
        toolCell = existCells[index]
        const colWidthRate = (colWidth / tableWidth * 100).toFixed(2)
        css(toolCell, {
          'min-width': `${colWidthRate}%`,
        })
      }
    }
  }

  destroy() {
    if (this.domNode) {
      this.domNode.remove()
    }
    return null
  }

  addColCellHolderHandler(cell: HTMLDivElement) {
    const tableContainer = Quill.find(this.table) as unknown as TableContainer
    if (!tableContainer) return
    const $holder = cell.querySelector(".qlbt-col-tool-cell-holder") as HTMLDivElement
    let dragging = false
    let x0 = 0
    let x = 0
    let delta = 0
    let width0 = 0
    let tableRect: DOMRect = {} as DOMRect
    let cellRect: DOMRect = {} as DOMRect
    let $helpLine: HTMLDivElement | null = null

    const self = this

    const handleDrag = (e: MouseEvent) => {
      e.preventDefault()

      if (dragging) {
        x = e.clientX

        if (width0 + x - x0 >= CELL_MIN_WIDTH) {
          delta = x - x0
        } else {
          delta = CELL_MIN_WIDTH - width0
        }

        if ($helpLine) {
          css($helpLine, {
            'left': `${cellRect.left + cellRect.width - 1 + delta}px`,
          })
        }
      }
    }

    const handleMouseup = () => {
      const existCells = Array.from(this.domNode!.querySelectorAll('.qlbt-col-tool-cell')) as HTMLDivElement[]
      const colIndex = existCells.indexOf(cell)
      const colBlot = tableContainer.colGroup().children.at(colIndex) as any
      const nextColBlot = colBlot.next
      const nextCell = nextColBlot.domNode
      const nextCellWidth = nextCell.clientWidth

      if (dragging) {
        colBlot.format('width', width0 + delta)
        nextColBlot.format('width', nextCellWidth - delta)
        css(cell, { 'min-width': `${width0 + delta}px` })
        css(nextCell as HTMLElement, { 'min-width': `${nextCellWidth - delta}px` })

        x0 = 0
        x = 0
        delta = 0
        width0 = 0
        dragging = false
        $holder.classList.remove('dragging')
      }

      document.removeEventListener('mousemove', handleDrag, false)
      document.removeEventListener('mouseup', handleMouseup, false)
      tableRect = {} as DOMRect
      cellRect = {} as DOMRect
      if ($helpLine) {
        $helpLine.remove()
        $helpLine = null
      }
      tableContainer.updateTableWidth()

      const tableSelection = self.quill.getModule('better-table-plus').tableSelection
      if (tableSelection) tableSelection.clearSelection()
      this.updateToolCells()
    }

    const handleMousedown = (e: MouseEvent) => {
      document.addEventListener('mousemove', handleDrag, false)
      document.addEventListener('mouseup', handleMouseup, false)

      tableRect = self.table.getBoundingClientRect()
      cellRect = cell.getBoundingClientRect()
      $helpLine = document.createElement('div')
      css($helpLine, {
        position: 'fixed',
        top: `${cellRect.top}px`,
        left: `${cellRect.left + cellRect.width - 1}px`,
        zIndex: '100',
        height: `${tableRect.height + COL_TOOL_HEIGHT + 4}px`,
        width: '1px',
        backgroundColor: PRIMARY_COLOR,
      })

      document.body.appendChild($helpLine)
      dragging = true
      x0 = e.clientX
      width0 = cellRect.width
      $holder.classList.add('dragging')
    }
    if ($holder !== null) {
      $holder.addEventListener('mousedown', handleMousedown, false)
    }
  }

  colToolCells() {
    if (!this.domNode) return []
    return Array.from(this.domNode.querySelectorAll('.qlbt-col-tool-cell')) as HTMLDivElement[]
  }
}

function computeCellsNumber(CellsInFirstRow: any) {
  return CellsInFirstRow.reduce((sum: number, cell: any) => {
    const cellColspan = cell.formats().colspan
    sum = sum + parseInt(cellColspan, 10)
    return sum
  }, 0)
}
