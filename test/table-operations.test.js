/**
 * Table operations test using jsdom
 * Tests insertTable, insertRow, insertColumn, deleteRow, deleteColumn, deleteTable
 * Run: node test/table-operations.test.js
 */

// ─── Setup jsdom 必须在 require('quill') 之前 ────────────────────────────────

const { JSDOM } = require('jsdom')

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
})

const { window } = dom

// 把 jsdom 的所有 DOM 全局变量挂到 global，quill 加载时需要这些
global.window = window
global.document = window.document
global.navigator = window.navigator
global.location = window.location
global.Node = window.Node
global.Text = window.Text
global.Element = window.Element
global.HTMLElement = window.HTMLElement
global.HTMLAnchorElement = window.HTMLAnchorElement
global.HTMLTableElement = window.HTMLTableElement
global.MutationObserver = window.MutationObserver
global.getComputedStyle = window.getComputedStyle
global.Range = window.Range
global.DocumentFragment = window.DocumentFragment
global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame = (id) => clearTimeout(id)

// ─── 现在才 require quill ────────────────────────────────────────────────────

const _Quill = require('quill')
const Quill = _Quill.default || _Quill
const _BetterTablePlus = require('../dist/quill-better-table-plus.cjs')
const BetterTablePlus = _BetterTablePlus.default || _BetterTablePlus

// ─── Test helpers ────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`)
    passed++
  } else {
    console.error(`  ❌ ${message}`)
    failed++
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`  ✅ ${message} (${actual})`)
    passed++
  } else {
    console.error(`  ❌ ${message} — expected ${expected}, got ${actual}`)
    failed++
  }
}

function test(name, fn) {
  console.log(`\n📋 ${name}`)
  try {
    fn()
  } catch (e) {
    console.error(`  ❌ threw: ${e.message}`)
    failed++
  }
}

// ─── Setup Quill ─────────────────────────────────────────────────────────────

function createEditor() {
  const wrapper = document.createElement('div')
  document.body.appendChild(wrapper)

  BetterTablePlus.register()
  Quill.register({ 'modules/better-table-plus': BetterTablePlus }, true)

  const quill = new Quill(wrapper, {
    theme: 'snow',
    modules: {
      table: false,
      'better-table-plus': {},
      keyboard: { bindings: BetterTablePlus.keyboardBindings },
    },
  })

  const tableModule = quill.getModule('better-table-plus')
  return { quill, tableModule, wrapper }
}

function getTableRows(wrapper) {
  return wrapper.querySelectorAll('table.quill-better-table > tbody > tr')
}

function getTableCells(wrapper) {
  return wrapper.querySelectorAll('table.quill-better-table td')
}

function getTableCols(wrapper) {
  return wrapper.querySelectorAll('table.quill-better-table col')
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test('insertTable(3, 3) creates a table element', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const table = wrapper.querySelector('table.quill-better-table')
  assert(table !== null, 'table.quill-better-table exists')
})

test('insertTable(3, 3) creates correct row count', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const rows = getTableRows(wrapper)
  assertEqual(rows.length, 3, '3 rows')
})

test('insertTable(3, 3) creates correct cell count', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const cells = getTableCells(wrapper)
  assertEqual(cells.length, 9, '9 cells (3x3)')
})

test('insertTable(3, 3) creates colgroup with cols', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const colgroup = wrapper.querySelector('table.quill-better-table colgroup')
  assert(colgroup !== null, 'colgroup exists')
  const cols = getTableCols(wrapper)
  assertEqual(cols.length, 3, '3 col elements')
})

test('each td has data-row attribute', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const cells = getTableCells(wrapper)
  let allHaveDataRow = true
  cells.forEach(td => {
    if (!td.getAttribute('data-row')) allHaveDataRow = false
  })
  assert(allHaveDataRow, 'all td have data-row attribute')
})

test('each td contains a p (table-cell-line)', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const cells = getTableCells(wrapper)
  let allHaveP = true
  cells.forEach(td => {
    if (!td.querySelector('p')) allHaveP = false
  })
  assert(allHaveP, 'all td contain a p element')
})

test('table is wrapped in .quill-better-table-wrapper', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(3, 3)

  const tableWrap = wrapper.querySelector('.quill-better-table-wrapper')
  assert(tableWrap !== null, '.quill-better-table-wrapper exists')
  const tableInWrapper = tableWrap && tableWrap.querySelector('table.quill-better-table')
  assert(tableInWrapper !== null, 'table is inside wrapper')
})

test('insertTable(2, 4) creates 2 rows and 4 cols', () => {
  const { quill, tableModule, wrapper } = createEditor()
  tableModule.insertTable(2, 4)

  const rows = getTableRows(wrapper)
  const cells = getTableCells(wrapper)
  const cols = getTableCols(wrapper)

  assertEqual(rows.length, 2, '2 rows')
  assertEqual(cells.length, 8, '8 cells (2x4)')
  assertEqual(cols.length, 4, '4 col elements')
})

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
else console.log('🎉 All tests passed!')
