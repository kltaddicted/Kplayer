import { DOMProps, Node } from "../type/Player";

import { ExternalHTMLElement } from "ntouch.js/lib/types"

//通过正则表达式的捕获组来获取相应的class，div，id等
const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/
//泛型
// function identity <T>(value: T) : T {
//     return value;
//   }
//   console.log(identity<Number>(1)) // 1
export function $<T extends ExternalHTMLElement>(desc?: string, props?: DOMProps, children?: string | Node[]): T {
    let match = []
    let regArray = SELECTOR_REG.exec(desc as string) as RegExpExecArray
    match[0] = regArray[1] || undefined
    match[1] = regArray[2] || undefined
    match[2] = regArray[3] || undefined
    let el = match[0] ? document.createElement(match[0]) : document.createElement('div')
    if (match[1]) {
        el.id = match[1] //加上id
    }

    match[2] && addClass(el, [match[2]])
    for (let key in props) {
        if (typeof props[key] === 'object') {
            if (key === 'style') {
                let str = ''
                let styles = props[key]
                for (let style in styles) {
                    str += `${style}:${styles[style as any]};`
                }
                el.setAttribute('style', str)
            }
        } else {
            el.setAttribute(key, String(props[key]))
        }
    }

    if (typeof children === 'string') {
        el.innerHTML = children
    } else if (children) {
        for (let child of children) {
            el.appendChild(child.el)
        }
    }
    return el as any
}

export function addClass(dom: Element, classNames: Array<string>) {
    //数组的浅拷贝
    let classList = dom.classList
    for (let name of classNames) {
        if (!includeClass) {
            classList.add(name)
        }
    }
}

export function removeClass(dom: Element, classNames: Array<string>) {
    let classList = dom.classList
    classList.remove(...classNames)
}

export function includeClass(dom: Element, className: string): boolean {
    let classList = dom.classList
    for (let key in classList) {
        if (classList[key] === className) return true
    }
    return false
}

const svgNS = 'http://www.w3.org/2000/svg'

export function createSvg(d?: string, viewBox = '0 0 24 24'): SVGSVGElement {
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', viewBox)
    if (d) {
        const path = document.createElementNS(svgNS, 'path')
        path.setAttributeNS(null, 'd', d)
        svg.appendChild(path)
    }
    return svg
}
