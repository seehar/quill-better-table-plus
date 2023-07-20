# quill-better-table-plus

<p>
  <a href="https://www.npmjs.com/package/quill-better-table-plus"><img src="https://img.shields.io/npm/v/quill-better-table-plus.svg?sanitize=true" alt="Version"></a>
  <a href="https://npmcharts.com/compare/quill-better-table-plus?minimal=true"><img src="https://img.shields.io/npm/dm/quill-better-table-plus.svg?sanitize=true" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/quill-better-table-plus"><img src="https://img.shields.io/npm/l/quill-better-table-plus.svg?sanitize=true" alt="License"></a>
</p>

中文 | [English](https://github.com/seehar/quill-better-table-plus/blob/master/README.md)

> 注意：这是对 `quill-better-table` npm 包的增强版（Plus）。原始包已经很久没有维护，这个增强版将由我来维护和更新。

# 简介

`quill-better-table-plus` 是一个增强版的 `Quill` 富文本编辑器插件，提供了更强大和灵活的表格编辑功能。它使用户能够轻松地创建、编辑和格式化表格，以及进行更复杂的表格操作。

这个包是基于原始 `quill-better-table` 包的最新可用版本进行的增强，增加了一些新功能，并修复了一些已知问题，以确保它适用于当前的环境和需求。

## 必要条件

[quilljs](https://github.com/quilljs/quill) v2.0.0-dev.3

## 在线 Demo

[quill-better-table-plus Codepen Demo](https://codepen.io/seehar/pen/yLQopvq)

# 安装

你可以通过 npm 安装 `quill-better-table-plus`：

```shell
npm install quill-better-table-plus
```

# 使用

导入 `Quill` 和样式依赖项

```html

<script src="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.min.js" type="text/javascript"></script>
```

```html

<link href="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.snow.min.css" rel="stylesheet">
<link href="https://unpkg.com/quill-better-table-plus@0.1.3/dist/quill-better-table-plus.css" rel="stylesheet">
```

## ES6

```javascript
import QuillBetterTablePlus from 'quill-better-table-plus'

Quill.register({
  'modules/better-table-plus': QuillBetterTablePlus
}, true)

window.onload = () => {
  const quill = new Quill('#editor-wrapper', {
    theme: 'snow',
    modules: {
      table: false,  // disable table module
      'better-table-plus': {
        operationMenu: {
          items: {
            unmergeCells: {
              text: 'Another unmerge cells name'
            }
          }
        }
      },
      keyboard: {
        bindings: QuillBetterTablePlus.keyboardBindings
      }
    }
  })

  document.body.querySelector('#insert-table')
    .onclick = () => {
    let tableModule = quill.getModule('better-table-plus')
    tableModule.insertTable(3, 3)
  }
}
```

# 未来功能

我们计划在未来的版本中添加以下功能来进一步增强 `quill-better-table-plus`：

- [ ] **适配多种 `table` 格式**：支持多种直接复制粘贴的带样式的 `table` 数据，并且解析和渲染更优秀
- [ ] **暴露更多的 `api`**：提供更多的 `api` 供开发者使用，以便快速应用不同的功能、外观和风格。
- [ ] **`Typescript` 支持**

我们正在努力开发这些功能，并将在未来的版本中逐步推出。敬请期待！

如果你有任何其他功能建议或想法，欢迎在 issue 中提出，我们非常乐意听取你的反馈和贡献。

# 社区

欢迎贡献代码和提交问题。如果你发现任何 bug，或者有任何改进建议，请创建一个 issue 或提交一个 pull 请求。

> 开发注意：node 版本：`12.x`, 比如：`12.22.12`

# 许可证

[MIT License](https://rmm5t.mit-license.org/)
