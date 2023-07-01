import { DOMProps, Node } from "../type/Player";
import { $, addClass } from "../utils/domUtils";
import { BaseEvent } from "./BaseEvent";

export class Component extends BaseEvent {
    //代表整个组件对应的整个HTML元素
    el: HTMLElement;
    //播放器的容器
    container: HTMLElement;
    constructor(
        container?: HTMLElement,
        desc?: string,
        props?: DOMProps,//元素的基本属性，如className，id，style等;
        children?: string | Node[]//Node为id和el
    ) {
        super()
        let dom = $(desc, props, children)
        this.el = dom
        this.container = container
        //不理解为什么还要写一遍
        if (props) {
            if (props.id) this.el.id = props.id
            if (props.className) addClass(this.el, props.className)
            if (props.style) {
                for (let key in props.style) {
                    this.el.style[key] = props.style[key] as string
                }
            }
        }

        //组件安装完成
        if (container) {
            container.appendChild(dom)
        }

    }
    init() { }
    initEvent() { }
    initPCEvent() { }
    initMobileEvent() { }
    initTemplate() { }
    initPCTemplate() { }
    initMobileTemplate() { }
    initComponent() { }
    resetEvent() { }
    // 销毁组件
    dispose() { }
}