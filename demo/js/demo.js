import QuillBetterTablePlus from 'src/quill-better-table-plus.js'
// import better-table styles file
import 'src/assets/quill-better-table-plus.less'

Quill.register({
  'modules/better-table-plus': QuillBetterTablePlus,
}, true)

window.onload = () => {
  const quill = new Quill('#editor-wrapper', {
    theme: 'snow',
    modules: {
      table: false,
      'better-table-plus': {
        operationMenu: {
          items: {
            unmergeCells: {
              text: 'Another unmerge cells name',
            },
          },

          color: {
            colors: ['red', 'green', 'yellow', 'white', 'gold', 'cadetblue', 'darkseagreen', 'skyblue'],
          },
        },
      },
      keyboard: {
        bindings: QuillBetterTablePlus.keyboardBindings,
      },
    },
  })

  let tableModule = quill.getModule('better-table-plus')
  document.body.querySelector('#insert-table')
    .onclick = () => {
    tableModule.insertTable(3, 3)
  }

  document.body.querySelector('#get-table')
    .onclick = () => {
    console.log(tableModule.getTable())
  }

  document.body.querySelector('#get-contents')
    .onclick = () => {
    console.log(quill.getContents())
  }

  document.body.querySelector('#insert-column-right')
    .onclick = () => {
    tableModule.insertColumnRight()
  }

  document.body.querySelector('#insert-column-left')
    .onclick = () => {
    tableModule.insertColumnLeft()
  }

  document.body.querySelector('#insert-row-above')
    .onclick = () => {
    tableModule.insertRowAbove()
  }

  document.body.querySelector('#insert-row-below')
    .onclick = () => {
    tableModule.insertRowBelow()
  }

  document.body.querySelector('#delete-column')
    .onclick = () => {
    tableModule.deleteColumn()
  }

  document.body.querySelector('#delete-row')
    .onclick = () => {
    tableModule.deleteRow()
  }

  document.body.querySelector('#delete-table')
    .onclick = () => {
    tableModule.deleteTable()
  }
}
