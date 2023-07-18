import { ComponentItem, PlayerOptions, Plugin, RegisterComponentOptions, Video } from "../type/Player";
import { Component } from "../class/Component";
import { $, addClass, removeClass } from '../utils/domUtils'
import { Env } from "../utils/env";
import { COMPONENT_STORE, ONCE_COMPONENT_STORE } from "../utils/store";
import { MobileVolume } from "../component/Mobile/MobileVolume";
import base64str from "../svg/base64";
import { ErrorLoading, TimeLoading } from "../component/Loading";
import { ToolBar } from "../component/ToolBar/toolbar";
import { EVENT } from "../events";
import { MoveEvent } from "ntouch.js";
import { DanmukuController } from "../danmuku/DanmukuController";
import { getExtension } from "../utils/getExtension";
import { Mp4Parser } from "../mp4/Mp4Parser";

export class Player extends Component implements ComponentItem {
    readonly id = 'Player';
    readonly playOption: PlayerOptions;
    containerWidth: number;
    containerHeight: number;
    video: HTMLVideoElement;
    enableSeek = true
    env = Env.env
    private videoInfo: Video
    pauseIcon: HTMLElement
    loading: TimeLoading
    error: ErrorLoading
    toolBar: ToolBar
    isFullscreen: boolean;
    baseSize: number = 16 //跟节点fontSize大小，用于移动端适配
    danmakuController: DanmukuController
    private mediaProportion: number = 9 / 16
    constructor(options: PlayerOptions) {
        super(options.container, 'div.Niplayer_video-wrapper')//Component是用来创建dom元素的
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
        this.initComponent()
        this.initTemplate()
        this.initEvent()

        // this.initResizeObserver()
        // this.checkFullScreenMode()
    }
    initEvent() {
        if (this.env === 'Mobile') {
            this.initMobileEvent()
        } else {
            this.initPCEvent()
        }

        this.video.addEventListener('loadedmetadata', (e) => {
            this.emit(EVENT.LOADED_META_DATA, e)
            // this.adjustMediaSize()
        })

        this.video.addEventListener('timeupdate', (e) => {
            this.emit(EVENT.TIME_UPDATE, e)
        })

        this.video.addEventListener('play', (e) => {
            this.pauseIcon.style.display = 'none'
            this.emit(EVENT.PLAY, e)
        })

        this.video.addEventListener('pause', (e) => {
            this.pauseIcon.style.display = ''
            this.emit(EVENT.PAUSE, e)
        })

        this.video.addEventListener('seeking', (e) => {
            if (this.enableSeek) {
                this.emit(EVENT.SEEKING, e)
            }
        })

        this.video.addEventListener('seeked', (e) => {
            this.emit(EVENT.SEEKED, e)
        })

        //loading
        this.video.addEventListener('waiting', (e) => {
            this.emit(EVENT.WAITING, e)
        })

        this.video.addEventListener('canplay', (e) => {
            this.emit(EVENT.CAN_PLAY, e)
        })

        this.video.addEventListener('error', (e) => {
            this.emit(EVENT.ERROR)
        })

        this.video.addEventListener('abort', (e) => {
            this.emit(EVENT.ERROR)
        })

        this.video.addEventListener('ratechange', (e) => {
            this.emit(EVENT.RATE_CHANGE)
        })

        this.on(EVENT.DANMAKU_INPUT_FOCUS, () => {
            this.el.onmouseleave = null
        })

        this.on(EVENT.DANMAKU_INPUT_BLUR, () => {
            this.el.onmouseleave = (e) => {
                this.emit(EVENT.HIDE_TOOLBAR, e)
            }
        })

        this.on(EVENT.DOT_DOWN, () => {
            this.enableSeek = false
        })

        this.on(EVENT.DOT_UP, () => {
            this.enableSeek = true
        })

        this.on(EVENT.VIDEO_DOT_DRAG, (val: number, e: Event | MoveEvent) => {
            this.emit(EVENT.SHOW_TOOLBAR, e)
        })

        this.on(EVENT.ENTER_FULLSCREEN, () => {
            this.isFullscreen = true
            this.adjustRem(this.el.clientWidth)
        })

        this.on(EVENT.LEAVE_FULLSCREEN, () => {
            this.isFullscreen = false
            this.adjustRem()
        })

        this.on(EVENT.ENTER_FULLPAGE, () => {
            this.adjustRem(this.el.clientWidth)
        })

        this.on(EVENT.LEAVE_FULLPAGE, () => {
            this.adjustRem()
        })
    }
    //通过跟节点的fontsize大小来改变全屏
    adjustRem(width: number = 600) {
        const scale = width / 600
        let number = 1
        if (scale > 1.75) {
            number = 1.25
        }
        document.documentElement.style.fontSize = this.baseSize * number + 'px'
    }
    // 对视频整体的模版进行初始化
    initTemplate(): void {
        if (this.env === 'Mobile') {
            //如果在移动端，则音量的控制由手势来控制
            // this.unmountComponent('Volume')
            new MobileVolume(this, this.el, 'div')
        }
        //初始化暂停图标
        this.pauseIcon = $('div.pauseIcon')
        const img: HTMLImageElement = $('img')
        img.src = base64str
        this.pauseIcon.append(img)
        this.pauseIcon.style.display = 'none'
        this.el.append(this.pauseIcon)

    }
    // 对包含的所有组件进行初始化
    initComponent(): void {
        this.loading = new TimeLoading(this, '视频正在加载中', this.el)
        this.error = new ErrorLoading(this, '视频加载失败', this.el)
        this.toolBar = new ToolBar(this, this.el, 'div')
        if (this.playOption.danmaku && this.playOption.danmaku.open) {
            this.danmakuController = new DanmukuController(
                this,
                this.playOption.danmaku
            )
        }
    }
    // 初始化移动端事件
    initMobileEvent(): void {

    }

    // 初始化插件
    private initPlugin() {

    }


    //给video添加媒体资源，开始初始化媒体资源的解析,待写
    attachSource(url: string) {
        let extension = getExtension(url)
        this.emit(EVENT.SOURCE_ATTACHED, url) // 触发资源加载完毕事件
        if (extension === 'mp4') {
            new Mp4Parser(url, this)
            if (this.playOption.streamPlay) {
                // 是否启动流式播放
                // new Mp4MediaPlayer(url, this)
            } else {
                this.video.src = url
            }
        }
    }

    use(plugin: Plugin) {
        plugin.install(this)
    }
    mountComponent(id: string, component: ComponentItem, options: RegisterComponentOptions) {
        if (COMPONENT_STORE.has(id)) {
            throw new Error(
                '无法挂载一个已经存在于视图上的组件，请先将其卸载或者删除'
            )
        }
        COMPONENT_STORE.set(id, component)
        if (!ONCE_COMPONENT_STORE.has(id)) {
            ONCE_COMPONENT_STORE.set(id, component)
        }
        if (!options) {
            if (!component.container) {
                throw new Error(
                    '必须传入Options选项或者传入的组件实例中需要有container选项'
                )
            }
            component.container.appendChild(component.el)
        } else {
            let mode = options.mode
            if (mode.type === 'BottomToolBar') {
                let area: HTMLElement
                //注意是数组的浅拷贝，会相互影响
                if (mode.pos === 'left') {
                    area = this.toolBar.controller.leftArea
                } else if (mode.pos === 'right') {
                    area = this.toolBar.controller.rightArea
                } else if (mode.pos === 'medium') {
                    area = this.toolBar.controller.mediumArea
                }
                let children = [...area.children]
                if (!options.index) {
                    area.appendChild(component.el)
                } else {
                    if (options.index < 0) throw new Error('index不能传入负值')
                    //var insertedNode = parentNode.insertBefore(newNode, referenceNode);
                    area.insertBefore(component.el, children[options.index] || null)
                }
            }
            // else if (mode.type === 'TopToolBar') {
            //     let area: HTMLElement
            //     if (mode.pos === 'left') {
            //         area = this.topbar.leftArea
            //     } else {
            //         area = this.topbar.rightArea
            //     }
            //     let children = [...area.children]
            //     if (!options.index) area.appendChild(component.el)
            //     else {
            //         if (options.index < 0) throw new Error('index不能传入负值')
            //         area.insertBefore(
            //             component.el,
            //             children[options.index] || null
            //         )
            //     }
            // } 
            else if (mode.type === 'AnyPosition') {
                this.el.appendChild(component.el)
            }
            // 给组件中的container赋予新的值
            component.container = component.el.parentElement
        }

    }

    unmountComponent(id: string) {
        if (!COMPONENT_STORE.has(id)) {
            throw new Error('改组件不存在或者已经被修改')
        }
        let instance = COMPONENT_STORE.get(id)
        instance.el.parentElement.removeChild(instance.el)
        removeClass(instance.el, [...instance.el.classList])
        COMPONENT_STORE.delete(id)
    }

    // 设置视频信息
    setVideoInfo(info: Video): void {
        this.videoInfo = info
        console.log(this.videoInfo, 'setinfo')
    }

}