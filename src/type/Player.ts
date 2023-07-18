import { Component } from "../class/Component";
import { Player } from "../page/player";

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
    danmaku?: DanmakuOptions
    plugins?: Plugin[]
    bilibiliMode?: boolean
    title?:
    | string
    | {
        message: string
        style?: Partial<CSSStyleDeclaration>
    }
    thumbnails?: Thumbnails
    leftBottomBarControllers?: ComponentConstructor[]
    rightBottomBarControllers?: ComponentConstructor[]
    leftTopBarControllers?: ComponentConstructor[]
    rightTopBarController?: ComponentConstructor[]
    leftMediumBarController?: ComponentConstructor[]
    mediumMediumBarController?: ComponentConstructor[]
    rightMediumBarController?: ComponentConstructor[]
}

export interface Thumbnails {
    row?: number // 精灵图的行数
    col?: number // 列数
    total?: number // 精灵图的总数
    margin?: number // 距离上下左右的像素大小
    source?: string // 资源的地址
    interval?: number //间隔时间
    width?: number
    height?: number
}

export interface Thumbnails {
    row?: number // 精灵图的行数
    col?: number // 列数
    total?: number // 精灵图的总数
    margin?: number // 距离上下左右的像素大小
    source?: string // 资源的地址
    interval?: number //间隔时间
    width?: number
    height?: number
}

export interface ComponentConstructor {
    new(
        player: Player,
        container: HTMLElement,
        desc?: string,
        props?: DOMProps,
        children?: string | Node[]
    ): Component & ComponentItem
} // 组件的构造函数


export type ContentType =
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'application/json'
    | 'text/xml'

export type RequestHeader = {
    'Content-Type'?: ContentType
    Range?: string
    Authroization?: string
}

export type AxiosConfig = {
    baseURL?: string
    header?: RequestHeader
    timeout?: number //请求的超时时长
}

export type AxiosOptions = {
    header?: RequestHeader //请求头
    query?: { [props: string]: any } // get请求的查询参数
}

export type DanmakuOptions = {
    open: boolean
    api?: string
    type?: 'websocket' | 'http'
    timeout?: number
}
export type Plugin = {
    install: (player: Player) => any
}
//对应最顶层的ToolBar的注册选项
export type TopToolBarOptions = {
    type: 'TopToolBar'
    pos: 'left' | 'right'
}

export type BottomToolBarOptions = {
    type: 'BottomToolBar'
    pos: 'left' | 'right' | 'medium'
}

export type AnyPositionOptions = {
    type: 'AnyPosition'
}

export type RegisterComponentOptions = {
    mode: TopToolBarOptions | BottomToolBarOptions | AnyPositionOptions
    index?: number
}

export type Video = {
    url?: string //视频的源地址
    volume?: number // 视频的音量
    time?: string // 视频的当前时间
    duration?: number // 视频的总时长
    frameRate?: number //视频的帧率 kps;
    brandRate?: number //视频的码率 bps
    videoCodec?: string //视频的编码方式
    audioCodec?: string // 音频的编码方式
    lastUpdateTime?: Date //视频最后一次更新时间
    isFragmented?: boolean //是否为fragmented类型的mp4文件
    width?: number //视频宽度上的分辨率（像素个数）
    height?: number // 视频高度上的分辨率（像素个数）
}
