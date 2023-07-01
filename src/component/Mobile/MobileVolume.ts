import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps, Node } from "../../type/Player";
import { addClass } from "../../utils/domUtils";
import { $, createSvg } from '../../utils/domUtils'
import { volumePath$1 } from '../../svg/index'
import './index.css'
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
    initEvent(): void {

    }
}