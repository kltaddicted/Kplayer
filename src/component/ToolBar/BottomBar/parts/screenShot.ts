import { Toast } from "../../../../component/Toast/toast"
import { Player } from "../../../../page/player"
import { confirmPath, screenShotPath } from "../../../../svg"
import { DOMProps, Node } from "../../../../type/Player"
import { createSvg, addClass, includeClass, removeClass, $ } from "../../../../utils/domUtils"
import { storeControlComponent } from "../../../../utils/store"
import { wrap, SingleTapEvent } from "ntouch.js"
import { Options } from "./options"

export class ScreenShot extends Options {
    readonly id = 'ScreenShot'
    confirmIcon: SVGSVGElement
    constructor(
        player: Player,
        container: HTMLElement,
        desc?: string,
        props?: DOMProps,
        children?: Node[]
    ) {
        super(player, container, 0, 0, desc, props, children)
        this.init()
    }

    init() {
        this.initTemplate()
        this.initEvent()
        storeControlComponent(this)
    }

    initTemplate() {
        this.confirmIcon = createSvg(confirmPath, '0 0 1024 1024')

        addClass(this.el, ['video-screenshot', 'video-controller'])
        this.icon = createSvg(screenShotPath, '0 0 1024 1024')
        this.iconBox.appendChild(this.icon)

        this.hideBox.innerText = '截图'
    }

    initEvent() {
        this.onClick = this.onClick.bind(this)
        if (this.player.env === 'PC') {
            this.el.addEventListener('click', this.onClick)
        } else {
            wrap(this.el).addEventListener('singleTap', this.onClick, {
                stopPropagation: true,
            })
        }
    }

    onClick(e: Event | SingleTapEvent) {
        if (e instanceof Event) {
            e.stopPropagation()
        }
        if (!includeClass(this.icon, 'video-screenshot-animate')) {
            addClass(this.icon, ['video-screenshot-animate'])
                ; (this.icon as SVGSVGElement).ontransitionend = (e) => {
                    removeClass(this.icon, ['video-screenshot-animate'])
                        ; (this.icon as SVGSVGElement).ontransitionend = null
                }
        }
        this.screenShot()
    }

    //截图操作
    screenShot() {
        const canvas = document.createElement('canvas')
        let video = this.player.video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        //绘制canvas截图
        //drawImage是截图api
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        //文件名
        const fileName = `${Math.random().toString(36).slice(-8)}_${video.currentTime
            }.png`
        //创造 Blob 对象，用以展示 canvas 上的图片；这个图片文件可以被缓存或保存到本地（由用户代理自行决定）
        canvas.toBlob((blob) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            //释放createObjectURL创建的对象
            URL.revokeObjectURL(url)
        }, 'image/png')

        let dom = $('div.video-screenshot-toast')
        let span = $('span')
        span.innerText = '截图成功!'
        let icon = this.confirmIcon.cloneNode(true)
        dom.appendChild(icon)
        dom.appendChild(span)
        let toast = new Toast(this.player, dom)

        setTimeout(() => {
            toast.dispose()
            toast = null
        }, 2000)
    }
}