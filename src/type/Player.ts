export type DOMProps = {
    className?: string[];
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    [props: string]: any;
};

export interface Node {
    id?: string;
    el?: HTMLElement;
}

//用于描述一个组件
export interface ComponentItem {
    id: string,
    el: HTMLElement,
    container?: HTMLElement,
    props?: DOMProps,
    [props: string]: any
}

export interface PlayerOptions {
    url?: string
    container?: HTMLElement
    video?: HTMLVideoElement
    post?: string
    autoPlay?: boolean
    streamPlay?: boolean
    // subtitles?: Subtitles[]
    // danmaku?: DanmakuOptions
    // plugins?: Plugin[]
    bilibiliMode?: boolean
    title?:
    | string
    | {
        message: string
        style?: Partial<CSSStyleDeclaration>
    }
}