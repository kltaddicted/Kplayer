import { ComponentItem, PlayerOptions } from "../type/Player";
import { Component } from "../class/Component";
import { $, removeClass } from '../utils/domUtils'
import { Env } from "../utils/env";
import { COMPONENT_STORE } from "../utils/store";
import { MobileVolume } from "../component/Mobile/MobileVolume";

export class Player extends Component implements ComponentItem {
    readonly id = 'Player';
    readonly playOption: PlayerOptions;
    containerWidth: number;
    containerHeight: number;
    video: HTMLVideoElement;
    env = Env.env
    constructor(options: PlayerOptions) {
        super(options?.container, 'div.Niplayer_video-wrapper')//Component是用来创建dom元素的
        this.playOption = Object.assign({
            autoPlay: false,
            streamPlay: false
        },
            options
        )

        this.container = options.container as HTMLElement
        this.containerHeight = options.container?.clientHeight as number
        this.containerWidth = options.container?.clientWidth as number
        this.init()
    }
    init(): void {
        if (this.playOption.video) {
            this.video = this.playOption.video
            //不知道为什么有这一步
            this.video.parentNode && this.video.parentNode.removeChild(this.video)
        } else {
            this.video = $('video')
            //兼容移动端
            this.video['playsinline'] = true
            // 设置播放器为H5播放器
            this.video['x5-video-player-type'] = 'h5'
        }
        //跨域请求时不会进行身份认证，实现CROS跨域播放
        this.video.crossOrigin = 'anonymous'
        this.el.appendChild(this.video)

        //初始化播放源
        this.playOption.url && this.attachSource(this.playOption.url)
        // this.initPlugin()
        // this.initComponent()
        this.initTemplate()
        // this.initEvent()

        // this.initResizeObserver()
        // this.checkFullScreenMode()
    }
    // 对视频整体的模版进行初始化
    initTemplate(): void {
        if (this.env === 'Mobile') {
            //如果在移动端，则音量的控制由手势来控制
            // this.unmountComponent('Volume')
            new MobileVolume(this, this.el, 'div')
        }
    }
    // 对包含的所有组件进行初始化
    initComponent(): void {

    }
    // 初始化公有的事件
    initEvent(): void {

    }
    // 初始化PC端事件
    initPCEvent(): void {

    }
    // 初始化移动端事件
    initMobileEvent(): void {

    }

    // 初始化插件
    private initPlugin() {

    }

    //监听视频播放器大小的变化
    private initResizeObserver() {

    }
    //给video添加媒体资源，开始初始化媒体资源的解析,待写
    attachSource(url: string) { }

    unmountComponent(id: string) {
        if (!COMPONENT_STORE.has(id)) {
            throw new Error('改组件不存在或者已经被修改')
        }
        let instance = COMPONENT_STORE.get(id)
        instance.el.parentElement.removeChild(instance.el)
        removeClass(instance.el, [...instance.el.classList])
        COMPONENT_STORE.delete(id)
    }
}