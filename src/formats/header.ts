import Quill from "quill"
import { CELL_ATTRIBUTES, CELL_IDENTITY_KEYS, TableCell, TableCellLine } from './table'

const Block = Quill.import("blots/block") as any

interface HeaderValue {
  value?: string
  row?: number | string
  cell?: number | string
  rowspan?: number | string
  colspan?: number | string
}

class Header extends Block {
  static create(value: HeaderValue | string) {
    if (typeof value === 'string') {
      value = { value }
    }

    const node = super.create((value as HeaderValue).value) as HTMLElement

    CELL_IDENTITY_KEYS.forEach(key => {
      if ((value as any)[key]) node.setAttribute(`data-${key}`, (value as any)[key])
    })

    CELL_ATTRIBUTES.forEach(key => {
      if ((value as any)[key]) node.setAttribute(`data-${key}`, (value as any)[key])
    })

    return node
  }

  static formats(domNode: HTMLElement) {
    const formats: Record<string, any> = {}
    formats.value = this.tagName.indexOf(domNode.tagName) + 1

    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).reduce((formats, attribute) => {
      if (domNode.hasAttribute(`data-${attribute}`)) {
        formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
      }
      return formats
    }, formats)
  }

  format(name: string, value: any) {
    const formats = Header.formats(this.domNode)
    const { row, cell, rowspan, colspan } = formats
    if (name === Header.blotName) {
      if (value) {
        super.format(name, {
          value,
          row, cell, rowspan, colspan,
        })
      } else {
        if (row) {
          this.replaceWith(TableCellLine.blotName, {
            row,
            cell,
            rowspan,
            colspan,
          })
        } else {
          super.format(name, value)
        }
      }
    } else {
      super.format(name, value)
    }
  }

  optimize(context: any) {
    const formats = Header.formats(this.domNode)
    const { rowspan, colspan } = formats
    const row = formats.row

    if (
      row &&
      !(this.parent instanceof TableCell)
    ) {
      this.wrap(TableCell.blotName, {
        row,
        colspan,
        rowspan,
      })
    }

    this.enforceAllowedChildren()
    if (this.uiNode != null && this.uiNode !== this.domNode.firstChild) {
      this.domNode.insertBefore(this.uiNode, this.domNode.firstChild as Node)
    }
    if (this.children.length === 0) {
      if (this.statics.defaultChild != null) {
        const child = this.scroll.create(this.statics.defaultChild.blotName)
        this.appendChild(child)
      } else {
        this.remove()
      }
    }
    this.cache = {}
  }
}

Header.blotName = 'header'
Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']

export default Header
