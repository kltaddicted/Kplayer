import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps, Node } from "../../type/Player";
import { addClass } from "../../utils/domUtils";
import { $, createSvg } from '../../utils/domUtils'
import { volumePath$1 } from '../../svg/index'
import './index.css'
import { EVENT } from "../../events";
import { MoveEvent, SwipeEvent } from "ntouch.js";
export class MobileVolume extends Component implements ComponentItem {
    readonly id = 'MobileVolume'
    props: DOMProps
    player: Player
    iconBox: HTMLElement
    progressBox: HTMLElement
    completedBox: HTMLElement
    icon: SVGSVGElement
    timer = 0
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(container, desc, props, children)
        this.player = player
        this.props = props || {}
        this.init()
    }

    init() {
        this.initTemplate()
        this.initEvent()
    }

    initTemplate(): void {
        //这里的el指的是player里的el
        addClass(this.el, ['video-mobile-medium-wrapper'])
        this.el.style.display = 'none'
        this.iconBox = $('div.video-mobile-medium-iconbox')
        this.progressBox = $('div.video-mobile-medium-progressbox')
        this.completedBox = $('div.video-mobile-medium-completed', {
            style: { width: '0px' },
        })
        this.icon = createSvg(volumePath$1)
        this.iconBox.appendChild(this.icon)
        this.progressBox.appendChild(this.completedBox)
        this.el.appendChild(this.iconBox)
        this.el.appendChild(this.progressBox)
    }
    //事件绑定初始化
    initEvent(): void {
        let width = this.completedBox.clientWidth
        this.player.on(EVENT.MOVE_VERTICAL, (e: MoveEvent) => {
            if (this.timer) {
                window.clearInterval(this.timer)
                this.timer = null
                //让音量条出现
                this.el.style.display = ''
                let dy = e.deltaY
                let scale = (width + -dy) / this.progressBox.clientWidth
                if (scale < 0) {
                    scale = 0
                } else { scale > 1 } {
                    scale = 1
                }
                //控制completedBox在progressBox中的宽度占比
                this.completedBox.style.width = scale * 100 + '%'
                this.player.video.volume = scale
            }
            this.player.on(EVENT.SLIDE_VERTICAL, (e: SwipeEvent) => {
                width = this.completedBox.clientWidth
                this.timer = window.setTimeout(() => {
                    this.el.style.display = 'none'
                }, 600)
            })

            this.player.on(EVENT.VIDEO_CLICK, () => {
                this.el.style.display = 'none'
            })
        })
    }
}