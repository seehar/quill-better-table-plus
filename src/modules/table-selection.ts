import Quill from 'quill'
import { css, getRelativeRect, Rect } from '../utils'
import { TableCell } from '../formats/table'

const PRIMARY_COLOR = '#0589f3'
const LINE_POSITIONS = ['left', 'right', 'top', 'bottom'] as const
const ERROR_LIMIT = 2

interface Boundary {
  x?: number
  y?: number
  x1?: number
  y1?: number
  width?: number
  height?: number
}

type Direction = typeof LINE_POSITIONS[number]

export default class TableSelection {
  table!: HTMLElement
  quill!: any
  options!: any
  boundary!: Boundary
  selectedTds!: TableCell[]
  dragging!: boolean
  selectingHandler!: (e: MouseEvent) => void
  clearSelectionHandler!: () => void
  left!: HTMLDivElement
  right!: HTMLDivElement
  top!: HTMLDivElement
  bottom!: HTMLDivElement

  constructor(table: HTMLElement | null, quill: any, options: any) {
    if (!table) return
    this.table = table
    this.quill = quill
    this.options = options
    this.boundary = {}
    this.selectedTds = []
    this.dragging = false
    this.selectingHandler = this.mouseDownHandler.bind(this)
    this.clearSelectionHandler = this.clearSelection.bind(this)

    this.helpLinesInitial()
    this.quill.root.addEventListener('mousedown',
      this.selectingHandler,
      false)

    this.quill.on('text-change', this.clearSelectionHandler)
  }

  helpLinesInitial() {
    const parent = this.quill.root.parentNode
    const self = this
    LINE_POSITIONS.forEach(function(direction: Direction) {
      (self as any)[direction] = document.createElement('div')
      ;(self as any)[direction].classList.add('qlbt-selection-line')
      ;(self as any)[direction].classList.add('qlbt-selection-line-' + direction)
      css((self as any)[direction], {
        position: 'absolute',
        display: 'none',
        'background-color': PRIMARY_COLOR,
      })
      parent.appendChild((self as any)[direction])
    })
  }

  mouseDownHandler(e: MouseEvent) {
    if (e.button !== 0 || !((e.target as HTMLElement).closest(".quill-better-table"))) return
    const self = this
    const startTd = (e.target as HTMLElement).closest('td[data-row]') as HTMLElement
    const startTdRect = getRelativeRect(
      startTd.getBoundingClientRect(),
      this.quill.root.parentNode as HTMLElement
    )
    this.dragging = true
    this.boundary = computeBoundaryFromRects(startTdRect, startTdRect)
    this.correctBoundary()
    this.selectedTds = this.computeSelectedTds()
    this.repositionHelpLines()

    function mouseMoveHandler(e: MouseEvent) {
      if (e.button !== 0 || !((e.target as HTMLElement).closest(".quill-better-table"))) return
      const endTd = (e.target as HTMLElement).closest('td[data-row]') as HTMLElement
      const endTdRect = getRelativeRect(
        endTd.getBoundingClientRect(),
        self.quill.root.parentNode as HTMLElement
      )
      self.boundary = computeBoundaryFromRects(startTdRect, endTdRect)
      self.correctBoundary()
      self.selectedTds = self.computeSelectedTds()
      self.repositionHelpLines()

      if (startTd !== endTd) {
        self.quill.blur()
      }
    }

    function mouseUpHandler() {
      self.quill.root.removeEventListener('mousemove', mouseMoveHandler, false)
      self.quill.root.removeEventListener('mouseup', mouseUpHandler, false)
      self.dragging = false
    }

    this.quill.root.addEventListener('mousemove', mouseMoveHandler, false)
    this.quill.root.addEventListener('mouseup', mouseUpHandler, false)
  }

  correctBoundary() {
    const tableContainer = Quill.find(this.table) as any
    const tableCells = tableContainer.descendants(TableCell) as TableCell[]

    const self = this
    tableCells.forEach(function(tableCell: TableCell) {
      const rect = getRelativeRect(
        tableCell.domNode.getBoundingClientRect(),
        self.quill.root.parentNode as HTMLElement
      )
      const x = rect.x
      const y = rect.y
      const width = rect.width
      const height = rect.height
      const isCellIntersected = (
        (x + ERROR_LIMIT >= (self.boundary.x || 0) && x + ERROR_LIMIT <= (self.boundary.x1 || 0)) ||
        (x - ERROR_LIMIT + width >= (self.boundary.x || 0) && x - ERROR_LIMIT + width <= (self.boundary.x1 || 0))
      ) && (
        (y + ERROR_LIMIT >= (self.boundary.y || 0) && y + ERROR_LIMIT <= (self.boundary.y1 || 0)) ||
        (y - ERROR_LIMIT + height >= (self.boundary.y || 0) && y - ERROR_LIMIT + height <= (self.boundary.y1 || 0))
      )
      if (isCellIntersected) {
        self.boundary = computeBoundaryFromRects(self.boundary as any, { x, y, x1: x + width, y1: y + height, width, height })
      }
    })
  }

  computeSelectedTds() {
    const tableContainer = Quill.find(this.table) as any
    const tableCells = tableContainer.descendants(TableCell) as TableCell[]
    const self = this

    return tableCells.reduce((selectedCells: TableCell[], tableCell: TableCell) => {
      const rect = getRelativeRect(
        tableCell.domNode.getBoundingClientRect(),
        self.quill.root.parentNode as HTMLElement
      )
      const x = rect.x
      const y = rect.y
      const width = rect.width
      const height = rect.height
      const isCellIncluded = (
        x + ERROR_LIMIT >= (self.boundary.x || 0) &&
        x - ERROR_LIMIT + width <= (self.boundary.x1 || 0)
      ) && (
        y + ERROR_LIMIT >= (self.boundary.y || 0) &&
        y - ERROR_LIMIT + height <= (self.boundary.y1 || 0)
      )

      if (isCellIncluded) {
        selectedCells.push(tableCell)
      }

      return selectedCells
    }, [])
  }

  repositionHelpLines() {
    const tableViewScrollLeft = (this.table.parentNode as HTMLElement).scrollLeft
    css(this.left, {
      display: 'block',
      left: `${(this.boundary.x || 0) - tableViewScrollLeft - 1}px`,
      top: `${this.boundary.y || 0}px`,
      height: `${(this.boundary.height || 0) + 1}px`,
      width: '1px',
    })

    css(this.right, {
      display: 'block',
      left: `${(this.boundary.x1 || 0) - tableViewScrollLeft}px`,
      top: `${this.boundary.y || 0}px`,
      height: `${(this.boundary.height || 0) + 1}px`,
      width: '1px',
    })

    css(this.top, {
      display: 'block',
      left: `${(this.boundary.x || 0) - 1 - tableViewScrollLeft}px`,
      top: `${this.boundary.y || 0}px`,
      width: `${(this.boundary.width || 0) + 1}px`,
      height: '1px',
    })

    css(this.bottom, {
      display: 'block',
      left: `${(this.boundary.x || 0) - 1 - tableViewScrollLeft}px`,
      top: `${(this.boundary.y1 || 0) + 1}px`,
      width: `${(this.boundary.width || 0) + 1}px`,
      height: '1px',
    })
  }

  refreshHelpLinesPosition() {
    const self = this
    const startRect = getRelativeRect(
      this.selectedTds[0].domNode.getBoundingClientRect(),
      this.quill.root.parentNode as HTMLElement
    )
    const endRect = getRelativeRect(
      this.selectedTds[this.selectedTds.length - 1].domNode.getBoundingClientRect(),
      this.quill.root.parentNode as HTMLElement
    )
    this.boundary = computeBoundaryFromRects(startRect, endRect)
    this.repositionHelpLines()
  }

  destroy() {
    const self = this
    LINE_POSITIONS.forEach(function(direction: Direction) {
      if ((self as any)[direction]) {
        ;(self as any)[direction].remove()
        ;(self as any)[direction] = null
      }
    })

    this.quill.root.removeEventListener('mousedown',
      this.selectingHandler,
      false)

    this.quill.off('text-change', this.clearSelectionHandler)

    return null
  }

  setSelection(startRect: DOMRect, endRect: DOMRect) {
    this.boundary = computeBoundaryFromRects(
      getRelativeRect(startRect, this.quill.root.parentNode as HTMLElement),
      getRelativeRect(endRect, this.quill.root.parentNode as HTMLElement)
    )
    this.correctBoundary()
    this.selectedTds = this.computeSelectedTds()
    this.repositionHelpLines()
  }

  clearSelection() {
    this.boundary = {}
    this.selectedTds = []
    const self = this
    LINE_POSITIONS.forEach(function(direction: Direction) {
      if ((self as any)[direction]) {
        css((self as any)[direction], {
          display: 'none',
        })
      }
    })
  }
}

function computeBoundaryFromRects(startRect: Rect, endRect: Rect) {
  const x = Math.min(
    startRect.x,
    endRect.x,
    startRect.x + startRect.width - 1,
    endRect.x + endRect.width - 1
  )

  const x1 = Math.max(
    startRect.x,
    endRect.x,
    startRect.x + startRect.width - 1,
    endRect.x + endRect.width - 1
  )

  const y = Math.min(
    startRect.y,
    endRect.y,
    startRect.y + startRect.height - 1,
    endRect.y + endRect.height - 1
  )

  const y1 = Math.max(
    startRect.y,
    endRect.y,
    startRect.y + startRect.height - 1,
    endRect.y + endRect.height - 1
  )

  const width = x1 - x
  const height = y1 - y

  return { x, x1, y, y1, width, height }
}
