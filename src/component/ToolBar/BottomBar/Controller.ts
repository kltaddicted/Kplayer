import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentConstructor, ComponentItem } from "../../../type/Player";
import { DurationShow } from "./parts/durationShow";
import { PlayButton } from "./parts/playButton";
import { ONCE_COMPONENT_STORE, storeControlComponent } from "../../../utils/store";
import { $ } from '../../../utils/domUtils'
import { Volume } from "./parts/volumeBar";
import { VideoShot } from "./parts/videoShot";
import { ScreenShot } from "./parts/screenShot";
import { PicInPic } from "./parts/pictureInPicture";
import { FullPage } from "./parts/fullPage";
import { FullScreen } from "./parts/fullScreen";

export class Controller extends Component implements ComponentItem {
    id = 'Controller'
    leftArea: HTMLElement //Controller左侧部分
    rightArea: HTMLElement //Controller右侧部分
    mediumArea: HTMLElement
    player: Player
    leftController: ComponentConstructor[] = [PlayButton, Volume, DurationShow]
    rightController: ComponentConstructor[] = [
        VideoShot,
        ScreenShot,
        PicInPic,
        FullPage,
        FullScreen,
    ]

    constructor(player: Player, container: HTMLElement, desc?: string) {
        super(container, desc)
        this.player = player
        this.init()
    }

    init() {
        this.initControllers()
        this.initTemplate()
        this.initComponent()

        storeControlComponent(this)
    }

    initControllers() {
        //自定义组件
        let leftControllers = this.player.playOption.leftBottomBarControllers
        if (leftControllers) this.leftController = leftControllers
        let rightControllers =
            this.player.playOption.rightBottomBarControllers
        if (rightControllers) this.rightController = rightControllers
    }
    initTemplate() {
        this.leftArea = $('div.video-bottombar-left')
        this.mediumArea = $('div.video-bottombar-medium')
        this.rightArea = $('div.video-bottombar-right')
        this.el.appendChild(this.leftArea)
        this.el.appendChild(this.mediumArea)
        this.el.appendChild(this.rightArea)
    }
    initComponent(): void {
        this.leftController.forEach((ControlConstructor) => {
            let instance = new ControlConstructor(
                this.player,
                this.leftArea,
                'div'
            )
            if (!ONCE_COMPONENT_STORE.get(instance.id))
                storeControlComponent(instance)
            this[instance.id] = instance
        })
        this.rightController.forEach((ControlConstructor) => {
            let instance = new ControlConstructor(
                this.player,
                this.rightArea,
                'div'
            )
            if (!ONCE_COMPONENT_STORE.get(instance.id))
                storeControlComponent(instance)
            this[instance.id] = instance
        })
    }
}