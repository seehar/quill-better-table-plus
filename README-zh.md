# quill-better-table-plus

[![npm version](https://badge.fury.io/js/quill-better-table-plus.svg)](https://badge.fury.io/js/quill-better-table-plus)

> 注意：这是对 `quill-better-table` npm 包的增强版（Plus）。原始包已经很久没有维护，而这个增强版由我来维护和更新。


# 简介

`quill-better-table-plus` 是一个增强版的 `Quill` 富文本编辑器插件，提供了更强大和灵活的表格编辑功能。它使用户能够轻松地创建、编辑和格式化表格，以及进行更复杂的表格操作。

这个包是基于原始 `quill-better-table` 包的最新可用版本进行的增强，增加了一些新功能，并修复了一些已知问题，以确保它适用于当前的环境和需求。

## 必要条件
[quilljs](https://github.com/quilljs/quill) v2.0.0-dev.3


# 安装

你可以通过 npm 安装 `quill-better-table-plus`：

```shell
npm install quill-better-table-plus
```

## 使用

## 导入插件
在使用 `Quill` 编辑器时，导入 `quill-better-table-plus` 插件：


```javascript
import Quill from 'quill';
import QuillBetterTablePlus from 'quill-better-table-plus';

Quill.register('modules/better-table-plus', QuillBetterTablePlus);
```

## 初始化 `Quill` 编辑器
```javascript
const quill = new Quill('#editor-container', {
  // ...其他配置项

  modules: {
    // ...其他模块
    betterTablePlus: true // 启用表格插件
  }
});
```

## 示例代码
你可以使用以下示例代码来展示 `quill-better-table-plus` 插件的一些功能：

```javascript
// 创建表格
quill.getModule('quill-better-table-plus').createTable(3, 3);

// 合并单元格
quill.getModule('quill-better-table-plus').mergeCells(0, 0, 1, 1);

// 拆分单元格
quill.getModule('quill-better-table-plus').splitCell(0, 0);

// 设置表格属性
quill.getModule('quill-better-table-plus').setTableAttribute(0, 'border', '2px solid red');
```
请参阅原始 `quill-better-table-plus` 文档以获取更多详细信息和示例。

# 未来功能

我们计划在未来的版本中添加以下功能来进一步增强 `quill-better-table-plus`：

- [ ] **适配多种 `table` 格式**：支持多种直接复制粘贴的带样式的 `table` 数据，并且解析和渲染更优秀
- [ ] **暴露更多的 `api`**：提供更多的 `api` 供开发者使用，以便快速应用不同的功能、外观和风格。
- [ ] **`Typescript` 支持**

我们正在努力开发这些功能，并将在未来的版本中逐步推出。敬请期待！

如果你有任何其他功能建议或想法，欢迎在 issue 中提出，我们非常乐意听取你的反馈和贡献。

# 贡献

欢迎贡献代码和提交问题。如果你发现任何 bug，或者有任何改进建议，请创建一个 issue 或提交一个 pull 请求。

> 开发注意：node 版本：`12.x`, 比如：`12.22.12`


# 许可证
`quill-better-table-plus` 使用 MIT 许可证。
