import { Player } from "../../../../page/player"
import { picInPicPath } from "../../../../svg"
import { DOMProps, Node } from "../../../../type/Player"
import { addClass, createSvg } from "../../../../utils/domUtils"
import { storeControlComponent } from "../../../../utils/store"
import { SwipeEvent, wrap } from "ntouch.js"
import { Options } from "./options"

export class PicInPic extends Options {
    readonly id = 'PicInPic'
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
        addClass(this.el, ['video-picInpic', 'video-controller'])
        this.icon = createSvg(picInPicPath, '0 0 1024 1024')
        this.iconBox.appendChild(this.icon)

        this.hideBox.innerText = '画中画'
    }

    initEvent() {
        this.onClick = this.onClick.bind(this)
        if (this.player.env === 'Mobile') {
            wrap(this.el).addEventListener('singleTap', this.onClick)
        } else {
            this.el.onclick = this.onClick
        }
    }
    onClick(e: Event | SwipeEvent) {
        if (e instanceof Event) {
            e.stopPropagation()
        }
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture()
        } else {
            this.player.video.requestPictureInPicture() //返回一个Promise,不一定支持进入画中画
        }
    }
}