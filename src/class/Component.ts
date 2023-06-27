import { DOMProps, Node } from "../../type/Player";
import { BaseEvent } from "./BaseEvent";

class Component extends BaseEvent {
    //代表整个组件对应的整个HTML元素
    // el: HTMLElement;
    //播放器的容器
    // container: HTMLElement;
    constructor(
        container?: HTMLElement,
        desc?: string,
        props?: DOMProps,//元素的基本属性，如className，id，style等;
        children?: string | Node[]//Node为id和el
    ) {
        super()
        //根据给定的代码 let dom = $(desc, props, children);，我们可以假设 $ 是一个函数，用于创建并返回一个 DOM 元素。
        //desc：这是描述 DOM 元素的字符串或标签名。它指定要创建的元素类型，例如 'div'、'span'、'input' 等。
        //props：这是一个对象，包含要设置给 DOM 元素的属性和属性值。属性可以是标准的 HTML 属性，如 'id'、'class'，也可以是自定义属性。
        //children：这是一个参数，表示 DOM 元素的子元素。它可以是单个 DOM 元素或一个包含多个 DOM 元素的数组。
        //通过调用 $ 函数并传递相应的参数，我们可以创建一个表示 DOM 元素的变量 dom。这个变量可以包含一个 DOM 元素节点，具体取决于传递的描述、属性和子元素。
        // let dom = $(desc, props, children)

    }
}