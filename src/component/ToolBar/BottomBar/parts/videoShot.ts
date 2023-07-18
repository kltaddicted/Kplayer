import { Player } from "../../../../page/player";
import { DOMProps, Node } from "../../../../type/Player";
import { Options } from "./options";
import { $, addClass, createSvg, removeClass } from '../../../../utils/domUtils'
import { storeControlComponent } from "../../../../utils/store";
import { confirmPath, countdownPath, videoShotPath$1 } from "../../../../svg";
import { Toast } from "../../../../component/Toast/toast";
import { HTMLMediaElementWithCaputreStream } from "../../../../class/HTMLMediaElementWithCaputreStream";

export class VideoShot extends Options {
    readonly id = 'VideoShot'
    player: Player
    props: DOMProps
    icon: SVGSVGElement
    warnIcon: SVGSVGElement
    successIcon: SVGSVGElement
    inProgressIcon: SVGSVGElement
    countDown = 30 //最多录制多少秒
    timer: number | null = null
    constructor(
        player: Player,
        container: HTMLElement,
        desc?: string,
        props?: DOMProps,
        children?: Node[]
    ) {
        super(player, container, 0, 0, desc, props, children)
        this.player = player
        this.props = props || {}
        this.init()
    }

    init() {
        this.initTemplate()
        this.initEvent()
        storeControlComponent(this)
    }

    initTemplate() {
        addClass(this.el, ['video-videoshot', 'video-controller'])
        this.icon = createSvg(videoShotPath$1, '0 0 1024 1024')
        this.iconBox.appendChild(this.icon)

        this.hideBox.innerText = '视频录制'
    }

    initEvent() {
        this.onDown = this.onDown.bind(this)
        if (this.player.env === 'PC') {
            this.el.onmousedown = this.onDown
        } else {
            this.el.ontouchstart = this.onDown
        }
    }

    //鼠标按下或者手指按下时开始屏幕录制
    onDown(e: Event) {
        e.stopPropagation()
        addClass(this.icon, ['video-videoshot-animate'])
        if (this.player.video.played) {
            this.videoShot()
        }
    }
    videoShot() {
        let inProgressToast = this.createInProgressToast()
        //MediaRecorder为屏幕录制api，需要一个steam参数
        let recorder = new MediaRecorder((this.player.video as HTMLMediaElement as HTMLMediaElementWithCaputreStream).captureStream(60))
        //ondataavailable方法：每次记录一定时间的数据时（如果没有指定时间片，则记录整个数据时）会定期触发
        recorder.addEventListener('dataavailable', (e: BlobEvent) => {
            let data = e.data
            let a = document.createElement('a')
            //URL.createObjectURL() 静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象的URL。
            //这个 URL 的生命周期和创建它的窗口中的 document 绑定。这个新的URL 对象表示指定的 File 对象或 Blob 对象。
            a.href = window.URL.createObjectURL(data)
            a.download = 'Test.mp4'
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            a = null
        })
        //开始录制
        recorder.start()

        this.timer = window.setInterval(() => {
            inProgressToast.el.querySelector(
                'span'
            ).innerText = `开始录屏，最多录制30秒; 还剩${this.countDown}秒`
            if (this.countDown === 0) {
                this.stop(recorder)
                return
            }
            this.countDown--
        }, 1000)

        if (this.player.env === 'Mobile') {
            this.el.ontouchend = (e) => {
                removeClass(this.icon, ['video-videoshot-animate'])
                this.stop(recorder)
                // 销毁toast组件
                inProgressToast.dispose()
                inProgressToast = null
                let successToast = this.createSuccessToast()
                window.setTimeout(() => {
                    successToast.dispose()
                    successToast = null
                }, 2000)
            }
        } else {
            this.el.onmouseup = (e) => {
                removeClass(this.icon, ['video-videoshot-animate'])
                this.stop(recorder)
                // 销毁toast组件
                inProgressToast.dispose()
                inProgressToast = null
                let successToast = this.createSuccessToast()
                window.setTimeout(() => {
                    successToast.dispose()
                    successToast = null
                }, 2000)
            }
        }
    }
    stop(recorder: MediaRecorder) {
        recorder.stop()
        recorder = null
        window.clearInterval(this.timer)
        this.timer = 0
        this.el.onmouseup = null
        this.el.ontouchend = null
        this.countDown = 30
    }
    createInProgressToast(): Toast {
        let inProgressIcon = createSvg(countdownPath, '0 0 1024 1024')
        let dom = $('div.video-videoshot-inprogress-toast')
        let span = $('span')
        span.innerText = `开始录屏，最多录制30秒; 还剩${this.countDown}秒`
        dom.appendChild(inProgressIcon)
        dom.appendChild(span)
        let toast = new Toast(this.player, dom)

        return toast
    }

    createSuccessToast(): Toast {
        let successIcon = createSvg(confirmPath, '0 0 1024 1024')
        let dom = $('div.video-videoshot-success-toast')
        let span = $('span')
        span.innerText = `录制成功!`
        dom.appendChild(successIcon)
        dom.appendChild(span)
        let toast = new Toast(this.player, dom)

        return toast
    }
}