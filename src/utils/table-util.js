import { getRelativeRect } from "src/utils/index";

function getColToolCellIndexByBoundary(cells, boundary, conditionFn, container) {
  return cells.reduce((findIndex, cell) => {
    let cellRect = getRelativeRect(cell.getBoundingClientRect(), container)
    if (conditionFn(cellRect, boundary)) {
      findIndex = cells.indexOf(cell)
    }
    return findIndex
  }, false)
}

function getColToolCellIndexesByBoundary(cells, boundary, conditionFn, container) {
  return cells.reduce((findIndexes, cell) => {
    let cellRect = getRelativeRect(
      cell.getBoundingClientRect(),
      container
    )
    if (conditionFn(cellRect, boundary)) {
      findIndexes.push(cells.indexOf(cell))
    }
    return findIndexes
  }, [])
}

export {
  getColToolCellIndexByBoundary,
  getColToolCellIndexesByBoundary,
}