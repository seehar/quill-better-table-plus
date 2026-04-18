export interface Rect {
  x: number
  y: number
  x1: number
  y1: number
  width: number
  height: number
}

export interface CSSRules {
  [prop: string]: string | number
}

export function css(domNode: HTMLElement, rules: CSSRules): void {
  if (typeof rules === 'object') {
    for (const prop in rules) {
      domNode.style[prop as any] = String(rules[prop])
    }
  }
}

export function getRelativeRect(targetRect: DOMRect, container: HTMLElement): Rect {
  const containerRect = container.getBoundingClientRect()

  return {
    x: targetRect.x - containerRect.x - container.scrollLeft,
    y: targetRect.y - containerRect.y - container.scrollTop,
    x1: targetRect.x - containerRect.x - container.scrollLeft + targetRect.width,
    y1: targetRect.y - containerRect.y - container.scrollTop + targetRect.height,
    width: targetRect.width,
    height: targetRect.height,
  }
}

export function _omit<T extends Record<string, any>, K extends keyof T>(obj: T, uselessKeys: K[]): Omit<T, K> {
  return obj && Object.keys(obj).reduce((acc, key) => {
    return uselessKeys.includes(key as unknown as K) ?
      acc :
      Object.assign({}, acc, { [key]: obj[key] })
  }, {} as Omit<T, K>)
}

export function getEventComposedPath(evt: Event): EventTarget[] {
  let path: EventTarget[] | undefined
  path = (evt as any).path || (evt.composedPath && evt.composedPath())

  if (path === undefined && evt.target) {
    path = []
    let target = evt.target as HTMLElement
    path.push(target)

    while (target && target.parentNode) {
      target = target.parentNode as HTMLElement
      path.push(target)
    }
  }

  return path || []
}

export function convertToHex(rgb: string): string {
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (/^(rgb|RGB)/.test(rgb)) {
    const color = rgb.toString().match(/\d+/g)
    if (!color) return rgb
    let hex = '#'

    for (let i = 0; i < 3; i++) {
      hex += ('0' + Number(color[i]).toString(16)).slice(-2)
    }
    return hex
  } else if (reg.test(rgb)) {
    const aNum = rgb.replace(/#/, '').split('')
    if (aNum.length === 6) {
      return rgb
    } else if (aNum.length === 3) {
      let numHex = '#'
      for (let index = 0; index < aNum.length; index += 1) {
        numHex += (aNum[index] + aNum[index])
      }
      return numHex
    }
  }

  return rgb
}
