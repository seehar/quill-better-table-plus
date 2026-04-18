import { getRelativeRect, Rect } from './index'

export function getColToolCellIndexByBoundary(
  cells: HTMLElement[],
  boundary: Rect,
  conditionFn: (cellRect: Rect, boundary: Rect) => boolean,
  container: HTMLElement
): number {
  return cells.reduce((findIndex, cell) => {
    const cellRect = getRelativeRect(cell.getBoundingClientRect(), container)
    if (conditionFn(cellRect, boundary)) {
      findIndex = cells.indexOf(cell)
    }
    return findIndex
  }, -1)
}

export function getColToolCellIndexesByBoundary(
  cells: HTMLElement[],
  boundary: Rect,
  conditionFn: (cellRect: Rect, boundary: Rect) => boolean,
  container: HTMLElement
): number[] {
  return cells.reduce((findIndexes, cell) => {
    const cellRect = getRelativeRect(
      cell.getBoundingClientRect(),
      container
    )
    if (conditionFn(cellRect, boundary)) {
      findIndexes.push(cells.indexOf(cell))
    }
    return findIndexes
  }, [] as number[])
}
