import { Player } from "../page/player";
import { DanmakuData, Track } from "../type/danmuku";
import { PriorityQueue } from "./utils/PriorityQueue";
import { $ } from '../utils/domUtils'
export class Danmaku {
    private queue: PriorityQueue<DanmakuData>
    private movingQueue: DanmakuData[] = []
    private container: HTMLElement
    private player: Player
    private timer: number | null = null
    //添加弹幕的时间间隔
    private renderInterval: number = 100
    //弹幕轨迹高度
    private trackHeight: number = 10
    //总共的轨道数
    private trackNumber: number
    private opacity: number = 1
    private fontSizeScale: number = 1
    private isHidden = false
    private isPaused = true
    // 弹幕占据屏幕的尺寸，默认占据一半屏幕
    private showScale = 1 / 2
    //总轨道数组
    private tracks: Array<{
        track: Track,
        datas: DanmakuData[]
    }>
    private defaultDanmaku: DanmakuData = {
        message: 'default message',
        fontColor: '#fff',
        fontSize: this.trackHeight,
        fontFamily: '',
        fontWeight: 500,
    }
    constructor(container: HTMLElement, player: Player) {
        this.queue = new PriorityQueue<DanmakuData>()
        this.container = container
        this.player = player
        //轨道数占屏幕的一半
        this.trackNumber = (this.container.clientHeight / 2) / this.trackHeight
        this.tracks = new Array((this.container.clientHeight / 2) / this.trackHeight)
        this.init()
    }
    init() {
        //初始化各轨道数据
        for (let i = 0; i < this.tracks.length; i++) {
            if (!this.tracks[i]) {
                this.tracks[i] = {
                    track: {
                        id: 0,
                        priority: 0 //轨道优先级
                    },
                    datas: []
                }
            }
            this.tracks[i].track = {
                id: i,
                priority: 15 - i, //轨道的优先级
            }

        }
    }
    pause() {
        this.setPaused(true)
        this.movingQueue.forEach((data) => {
            this.pauseOneData(data)
        })
    }
    resume() {
        this.setPaused(false)
        this.timer = window.setTimeout(() => {
            this.render()
        }, this.renderInterval)
        this.movingQueue.forEach((data) => {
            this.resumeOneData(data)
        })
    }
    //恢复某条弹幕的移动
    resumeOneData(data: DanmakuData) {
        data.startTime = Date.now()
        //剩下移动的时间
        data.rollTime = (data.totalDistance - data.rollDistance) / data.rollSpeed
        data.dom.style.transition = `transform ${data.rollTime}s linear`
        data.dom.style.transform = `translateX(-${data.totalDistance}px)`
    }
    //暂停某条弹幕的移动
    pauseOneData(data: DanmakuData) {
        //暂停时已经走过的路程
        let currentRollDistance = ((Date.now() - data.startTime) * data.rollSpeed) / 1000
        data.rollDistance =
            currentRollDistance + (data.rollDistance ? data.rollDistance : 0)
        data.dom.style.transition = ''
        data.dom.style.transform = `translateX(-${data.rollDistance}px)`
    }
    startDanmaku() {
        this.render()
    }
    // 向缓冲区内添加正确格式的弹幕
    //queue是存弹幕
    addData(data: any) {
        // console.log(data, '我被触发')
        this.queue.push(this.parseData(data))
        // 如果检测到缓冲区弹幕为0,也就是定时器被关闭的话就重新开启定时器
        if (this.timer === null) {
            this.render()
        }
    }

    parseData(data: any): DanmakuData {
        if (typeof data === 'string') {
            return {
                message: data,
                fontColor: '#fff',
                fontSize: this.trackHeight,
                fontWeight: 500,
                timestamp: this.player.video.currentTime,
            }
        }
        if (typeof data === 'object') {
            if (!data.message || data.message === '') {
                throw new Error(`传入的弹幕数据${data}不合法`)
            }
            let object = Object.assign(
                {
                    ...this.defaultDanmaku,
                    timestamp: this.player.video.currentTime,
                },
                data
            )
            return object
        }
        throw new Error(`传入的弹幕数据${data}不合法`)
    }
    render() {
        try {
            this.renderToDOM()
        } finally {
            this.renderEnd()
        }
    }


    renderEnd() {
        if (this.queue.length === 0) {
            window.clearTimeout(this.timer)
            this.timer = null
        } else {
            this.timer = window.setTimeout(() => {
                this.render()
            }, this.renderInterval)
        }
    }
    //向指定的DOM元素上渲染一条弹幕
    renderToDOM() {
        if (this.queue.length === 0) return
        let data = this.queue.shift()
        if (!data.dom) {
            let dom = $('div.video-danmaku-message')
            dom.innerText == data.message
            if (data.fontFamily !== '') {
                dom.style.fontFamily = data.fontFamily
            }
            dom.style.color = data.fontColor
            dom.style.fontSize = data.fontSize * this.fontSizeScale + 'px'
            dom.style.fontWeight = data.fontWeight + ''
            dom.style.position = 'absolute'
            dom.style.left = '100%'
            dom.style.whiteSpace = 'nowrap'
            dom.style.willChange = 'transform'//预加载要变化的值
            dom.style.cursor = 'pointer'
            dom.style.opacity = this.opacity + ''
            dom.style.visibility = this.isHidden ? 'hidden' : ''
            data.dom = dom
        }
        data.dom.innerText = data.message
        this.container.appendChild(data.dom)
        //弹幕总共需要走过的路程
        data.totalDistance = this.container.clientWidth + data.dom.clientWidth
        data.width = data.dom.clientWidth
        //弹幕的运动时间
        data.rollTime = data.rollTime ||
            Math.floor(
                data.totalDistance * 0.0058 * (Math.random() * 0.3 + 0.7)
            )
        //弹幕移动速度
        data.rollSpeed = parseFloat((data.totalDistance / data.rollTime).toFixed(2))

        //弹幕占用了多少行轨道（因为弹幕的大小不一）
        data.useTracks = Math.ceil(data.dom.clientHeight / this.trackHeight)
        // 此处数组y的作用是表明该弹幕占的轨道的id数组
        data.y = []

        this.addDataToTrack(data)
        // console.log(data.y, 'dataY')
        if (data.y.length === 0) {
            if ([...this.container.childNodes].includes(data.dom)) {
                this.container.removeChild(data.dom)
            }
            //没位置就重新加到queue中
            this.queue.push(data)
        } else {
            data.dom.style.top = data.y[0] * this.trackHeight + 'px'
            this.startAnimate(data) //开启弹幕的动画
        }
        data.dom.ontransitionstart = (e) => {
            data.startTime = Date.now()
        }

    }
    addDataToTrack(data: DanmakuData) {
        let y = []
        //遍历轨道数组，看哪个轨道可以放弹幕
        for (let i = 0; i < this.trackNumber; i++) {
            let track = this.tracks[i]
            let datas = track.datas
            if (datas.length === 0) {
                y.push(i)
            } else {
                //只需要看当前轨道的最后一个弹幕
                let lastItem = datas[datas.length - 1]
                //distance表示该弹幕已经走过的距离
                let distance = (lastItem.rollSpeed * (Date.now() - lastItem.startTime)) / 1000 //除1000是正则化Date.now() - lastItem.startTime
                //具体计算方法可以看文章
                if (distance > lastItem.width && ((data.rollSpeed <= lastItem.rollSpeed)
                    || ((this.container.clientWidth + lastItem.width - distance) / lastItem.rollSpeed) < (distance - lastItem.width) / (lastItem.rollSpeed - data.rollSpeed))) {
                    y.push(i)
                } else {
                    //因为没有连续满足的轨道，所以清空
                    y = []
                }
            }
            if (y.length >= data.useTracks) {
                data.y = y
                data.y.forEach(id => {
                    this.tracks[id].datas.push(data)
                })
                break;
            }
        }

    }
    //将弹幕移除出轨道
    removeDataFromTrack(data: DanmakuData) {
        data.y.forEach(id => {
            let datas = this.tracks[id].datas
            let index = datas.indexOf(data)
            if (index === -1) return
            this.tracks[id].datas.splice(index, 1)
        })
    }
    startAnimate(data: DanmakuData) {
        // movingQueue中存储的都是在运动中的弹幕
        // 如果当前是暂停的话则该弹幕不应该开启动画
        if (this.isPaused || this.player.video.paused) {
            this.queue.add(data)
            this.removeDataFromTrack(data)
            return
        }
        if (this.isHidden) {
            data.dom.style.visibility = 'hidden'
        }

        this.movingQueue.push(data)
        data.dom.style.transition = `transform ${data.rollTime}s linear`
        data.dom.style.transform = `translateX(-${data.totalDistance}px)`
        //动画结束的时候
        data.dom.ontransitionend = (e) => {
            this.container.removeChild(data.dom)
            this.removeDataFromTrack(data)
            this.movingQueue.splice(this.movingQueue.indexOf(data), 1)
        }
    }
    setPaused(val: boolean) {
        this.isPaused = val
    }

    //清空所有的弹幕，包括正在运动中的或者还在缓冲区未被释放的
    flush() {
        window.clearTimeout(this.timer)
        this.timer = null

        this.movingQueue.forEach((data) => {
            data.dom.parentNode?.removeChild(data.dom)
            data.dom.ontransitionend = null
            data.dom.ontransitionstart = null
        })

        this.queue.forEach((data, index) => {
            if ([...this.container.children].includes(data.dom)) {
                data.dom.parentNode?.removeChild(data.dom)
                data.dom.ontransitionend = null
                data.dom.ontransitionstart = null
            }
        })
        // 清空轨道上的所有数据
        this.tracks.forEach((obj) => {
            obj.datas = []
        })
        this.movingQueue = []
        this.queue.clear()
    }

    //隐藏所有的弹幕
    close() {
        this.isHidden = true
        this.movingQueue.forEach((data) => {
            data.dom.style.visibility = 'hidden'
        })

        this.queue.forEach((data, index) => {
            if (data.dom) {
                data.dom.style.visibility = ''
            }
        })
    }

    open() {
        this.isHidden = false
        this.movingQueue.forEach((data) => {
            data.dom.style.visibility = ''
        })

        this.queue.forEach((data, index) => {
            if (data.dom) {
                data.dom.style.visibility = ''
            }
        })
    }
    setTrackNumber(num?: number) {
        if (!num) {
            this.trackNumber =
                (this.container.clientHeight / this.trackHeight) *
                this.showScale
            return
        }
        this.showScale = num
        this.trackNumber =
            (this.container.clientHeight / this.trackHeight) * this.showScale
    }

    // 设置弹幕的移动距离，主要是为了防止在播放器尺寸发生变化时弹幕的运行信息还保存着旧的信息，需要及时更新移动的距离和移动时间
    setRollDistance() {
        this.movingQueue.forEach(data => {
            data.totalDistance = this.container.clientWidth + data.width;
            if (this.player.video.paused || this.isPaused) {
                return;
            } else {
                const currentTime = Date.now()
                const currentRollDistance =
                    ((currentTime - data.startTime) * data.rollSpeed) / 1000
                data.rollDistance =
                    currentRollDistance + (data.rollDistance ? data.rollDistance : 0)
                data.startTime = currentTime;
                // data.rolltime中保存的是弹幕还需要运动的时长
                data.rollTime =
                    (data.totalDistance - data.rollDistance) / data.rollSpeed;
                data.dom.style.transition = `transform ${data.rollTime}s linear`;
                data.dom.style.transform = `translateX(${-data.totalDistance}px)`;
            }

        })
    }

    setOpacity(opacity: number) {
        this.opacity = opacity
        this.movingQueue.forEach((data) => {
            data.dom.style.opacity = opacity + ''
        })
    }
    setFontSize(scale: number) {
        this.fontSizeScale = scale
        this.movingQueue.forEach((data) => {
            data.dom.style.fontSize = data.fontSize * this.fontSizeScale + 'px'
        })
    }
}