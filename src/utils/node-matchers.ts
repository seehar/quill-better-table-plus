import { _omit, convertToHex } from './index'

export interface TableCellAttributes {
  row?: number
  cell?: number
  rowspan?: number | string
  colspan?: number | string
  'cell-bg'?: string
  table?: any
  background?: string
  [key: string]: any
}

export function matchTableCell(node: HTMLTableCellElement, delta: any, scroll: any): any {
  const Delta = (scroll as any).Delta || ((scroll as any).quill && (scroll as any).quill.constructor.Delta) || Object
  const row = node.parentNode as HTMLTableRowElement
  const parentNode = row.parentNode as HTMLElement
  const table = parentNode && parentNode.tagName === 'TABLE'
    ? parentNode as HTMLTableElement
    : (parentNode as HTMLTableSectionElement).parentNode as HTMLTableElement
  const rows = Array.from(table.querySelectorAll('tr'))
  const cells = Array.from(row.querySelectorAll('td'))
  const rowId = rows.indexOf(row) + 1
  const cellId = cells.indexOf(node) + 1
  const colspan = node.getAttribute('colspan') || false
  const rowspan = node.getAttribute('rowspan') || false
  const cellBg = node.getAttribute('data-cell-bg') || node.style.backgroundColor

  if (delta.length() === 0) {
    return new Delta().insert('\n', {
      'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan },
    } as any)
  }

  const processedDelta = delta.reduce((newDelta: any, op: any) => {
    if (op.insert && typeof op.insert === 'string') {
      const lines: string[] = []
      const insertStr = op.insert
      let start = 0
      for (let i = 0; i < op.insert.length; i++) {
        if (insertStr.charAt(i) === '\n') {
          if (i === 0) {
            lines.push('\n')
          } else {
            lines.push(insertStr.substring(start, i))
            lines.push('\n')
          }
          start = i + 1
        }
      }

      const tailStr = insertStr.substring(start)
      if (tailStr) lines.push(tailStr)

      lines.forEach(text => {
        if (text === '\n') {
          newDelta.insert('\n', op.attributes)
        } else {
          newDelta.insert(text, _omit(op.attributes || {}, ['table', 'table-cell-line']))
        }
      })
    } else {
      newDelta.insert(op.insert, op.attributes)
    }

    return newDelta
  }, new Delta())

  return processedDelta.reduce((newDelta: any, op: any) => {
    if (op.insert && typeof op.insert === 'string' &&
      op.insert.startsWith('\n')) {
      newDelta.insert(op.insert, Object.assign(
        {},
        Object.assign({}, { row: rowId }, (op.attributes && op.attributes.table)),
        { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan, 'cell-bg': cellBg } },
        _omit(op.attributes || {}, ['table'])
      ))
    } else {
      if (op.attributes && op.attributes.background && op.attributes.background === convertToHex(cellBg)) {
        newDelta.insert(op.insert, Object.assign(
          {},
          _omit(op.attributes, ['table', 'table-cell-line', 'background'])
        ))
      } else {
        newDelta.insert(op.insert, Object.assign(
          {},
          _omit(op.attributes || {}, ['table', 'table-cell-line'])
        ))
      }
    }

    return newDelta
  }, new Delta())
}

export function matchTableHeader(node: HTMLTableCellElement, delta: any, scroll: any): any {
  const Delta = (scroll as any).Delta || ((scroll as any).quill && (scroll as any).quill.constructor.Delta) || Object
  const row = node.parentNode as HTMLTableRowElement
  const parentNode = row.parentNode as HTMLElement
  const table = parentNode && parentNode.tagName === 'TABLE'
    ? parentNode as HTMLTableElement
    : (parentNode as HTMLTableSectionElement).parentNode as HTMLTableElement
  const rows = Array.from(table.querySelectorAll('tr'))
  const cells = Array.from(row.querySelectorAll('th'))
  const rowId = rows.indexOf(row) + 1
  const cellId = cells.indexOf(node) + 1
  const colspan = node.getAttribute('colspan') || false
  const rowspan = node.getAttribute('rowspan') || false

  if (delta.length() === 0) {
    return new Delta().insert('\n', {
      'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan },
    } as any)
  }

  const processedDelta = delta.reduce((newDelta: any, op: any) => {
    if (op.insert && typeof op.insert === 'string') {
      const lines: string[] = []
      const insertStr = op.insert
      let start = 0
      for (let i = 0; i < op.insert.length; i++) {
        if (insertStr.charAt(i) === '\n') {
          if (i === 0) {
            lines.push('\n')
          } else {
            lines.push(insertStr.substring(start, i))
            lines.push('\n')
          }
          start = i + 1
        }
      }

      const tailStr = insertStr.substring(start)
      if (tailStr) lines.push(tailStr)

      if (lines.indexOf('\n') < 0) {
        lines.push('\n')
      }

      lines.forEach(text => {
        if (text === '\n') {
          newDelta.insert('\n', { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan } } as any)
        } else {
          newDelta.insert(text, op.attributes)
        }
      })
    } else {
      newDelta.insert(op.insert, op.attributes)
    }

    return newDelta
  }, new Delta())

  return processedDelta.reduce((newDelta: any, op: any) => {
    if (op.insert && typeof op.insert === 'string' &&
      op.insert.startsWith('\n')) {
      newDelta.insert(op.insert, Object.assign(
        {},
        { 'table-cell-line': { row: rowId, cell: cellId, rowspan, colspan } }
      ))
    } else {
      newDelta.insert(op.insert, Object.assign(
        {},
        _omit(op.attributes || {}, ['table', 'table-cell-line'])
      ))
    }

    return newDelta
  }, new Delta())
}

export function matchTable(node: HTMLTableElement, delta: any, scroll: any): any {
  const Delta = (scroll as any).Delta || ((scroll as any).quill && (scroll as any).quill.constructor.Delta) || Object
  let newColDelta = new (Delta as any)()
  const topRow = node.querySelector('tr')

  if (topRow === null) return newColDelta

  const cellsInTopRow = Array.from(topRow.querySelectorAll('td'))
    .concat(Array.from(topRow.querySelectorAll('th')))
  const maxCellsNumber = cellsInTopRow.reduce((sum, cell) => {
    const cellColspan = cell.getAttribute('colspan') || 1
    return sum + parseInt(cellColspan as string, 10)
  }, 0)
  const colsNumber = node.querySelectorAll('col').length

  if (colsNumber === maxCellsNumber) {
    return delta
  } else {
    for (let i = 0; i < maxCellsNumber - colsNumber; i++) {
      newColDelta.insert('\n', { 'table-col': true } as any)
    }

    if (colsNumber === 0) return newColDelta.concat(delta)

    let lastNumber = 0
    return delta.reduce((finalDelta: any, op: any) => {
      finalDelta.insert(op.insert, op.attributes)

      if (op.attributes && op.attributes['table-col']) {
        lastNumber += op.insert.length
        if (lastNumber === colsNumber) {
          finalDelta = finalDelta.concat(newColDelta)
        }
      }

      return finalDelta
    }, new Delta())
  }
}
