import { Player } from "../page/player"
import MP4Box, { MP4File, Log, MP4ArrayBuffer, MP4SourceBuffer, MP4Info } from 'mp4box'
import { MediaTrack, MoovBoxInfo } from "../type/mp4"
import { DownLoader } from "./net/DownLoader"

export class Mp4MediaPlayer {
    url: string
    player: Player
    mp4boxfile: MP4File
    mediaSource: MediaSource
    mediaInfo: MoovBoxInfo
    downloader: DownLoader
    lastSeekTime: number = 0
    constructor(url: string, player: Player) {
        this.url = url
        this.player = player
        this.init()
    }
    init() {
        this.mp4boxfile = MP4Box.createFile()
        this.mediaSource = new MediaSource()
        this.downloader = new DownLoader(this.url)
        this.player.video.src = URL.createObjectURL(this.mediaSource)
        this.initEvent()
    }
    initEvent() {
        let ctx = this
        this.mediaSource.addEventListener('sourceopen', (e) => {
            this.loadFile()
        })
        this.mp4boxfile.onReady = function (info: MoovBoxInfo) {
            ctx.mediaInfo = info
            //计算视频时间
            if (info.isFragmented) {
                ctx.mediaSource.duration =
                    info.fragment_duration / info.timescale
            } else {
                ctx.mediaSource.duration = info.duration / info.timescale
            }

            //获取到moov后停止http请求
            ctx.stop()
            //将mp4box.js解析出来的切片信息传到mse
            ctx.initializeAllSourceBuffers()
        }
        this.mp4boxfile.onSegment = function (
            id,
            user,
            buffer,
            sampleNum,
            is_last
        ) {
            var sb = user
            sb.segmentIndex++
            sb.pendingAppends.push({
                id: id,
                buffer: buffer,
                sampleNum: sampleNum,
                is_last: is_last,
            })
            ctx.onUpdateEnd.call(sb, true, false, ctx)
        }

        //绑定进度变化的函数的时候
        this.player.on('seeking', (e: Event) => {
            var video = this.player.video
            if (this.lastSeekTime !== video.currentTime) {
                // video.buffered获得音频/视频中已缓冲范围的数量
                for (let i = 0; i < video.buffered.length; i++) {
                    let start = video.buffered.start(i)
                    let end = video.buffered.end(i)
                    if (
                        video.currentTime >= start &&
                        video.currentTime <= end
                    ) {
                        return
                    }
                }
                this.downloader.stop()
                let seek_info = this.mp4boxfile.seek(video.currentTime, true)
                this.downloader.setChunkStart(seek_info.offset)
                this.downloader.resume()
                this.lastSeekTime = video.currentTime
            }
        })
    }


    loadFile() {
        let ctx = this
        if (this.mediaSource.readyState !== 'open') return
        this.downloader.setInterval(500)
        this.downloader.setChunkSize(1000000)
        this.downloader.setUrl(this.url)
        //downloader完成一次请求就会调用这个函数
        this.downloader.setCallback(function (response: MP4ArrayBuffer, end: boolean, error: any) {
            let nextStart = 0
            if (response) {
                nextStart = ctx.mp4boxfile.appendBuffer(response, end)
            }
            if (end) {
                // 如果存在end的话则意味着所有的chunk已经加载完毕
                ctx.mp4boxfile.flush()
            } else {
                ctx.downloader.setChunkStart(nextStart)
            }
        })

        this.downloader.start()
    }
    initializeAllSourceBuffers() {
        if (this.mediaInfo) {
            let info = this.mediaInfo
            for (let i = 0; i < info.tracks.length; i++) {
                //根据音频轨道和视频轨道创建sourceBuffer
                this.addBuffer(info.tracks[i])
            }
            this.initializeSourceBuffers()
        }
    }
    initializeSourceBuffers() {
        let initSegs = this.mp4boxfile.initializeSegmentation() //视频切片成功后返回的数据
        for (let i = 0; i < initSegs.length; i++) {
            let sourceBuffer = initSegs[i].user
            if (i === 0) {
                sourceBuffer.ms.pendingInits = 0
            }
            //开始切片
            this.onInitAppended = this.onInitAppended.bind(this)
            sourceBuffer.onupdateend = this.onInitAppended
            //重点：将切片的arraybuffer传到sourceBuffer中
            sourceBuffer.appendBuffer(initSegs[i].buffer)
            sourceBuffer.segmentIndex = 0
            sourceBuffer.ms.pendingInits++
        }
    }
    addBuffer(mp4track: MediaTrack) {
        var track_id = mp4track.id
        var codec = mp4track.codec
        // mime指定对应媒体的编解码方式/规范
        var mime = 'video/mp4; codecs="' + codec + '"'
        console.log(mime, 'mime')
        var sourceBuffer: MP4SourceBuffer
        if (MediaSource.isTypeSupported(mime)) {
            sourceBuffer = this.mediaSource.addSourceBuffer(mime)
            sourceBuffer.ms = this.mediaSource
            //设置切片的参数，user为sourceBuffer
            this.mp4boxfile.setSegmentOptions(track_id, sourceBuffer)
            sourceBuffer.pendingAppends = []
        } else {
            throw new Error(`你的浏览器不支持${mime}类型`)
        }

    }
    start() {
        this.downloader.setChunkStart(this.mp4boxfile.seek(0, true).offset)
        this.downloader.setChunkSize(1000000)
        this.downloader.setInterval(1000)
        this.mp4boxfile.start()
        this.downloader.resume()
    }

    stop() {
        if (!this.downloader.isStopped()) {
            this.downloader.stop()
        }
    }
    onInitAppended(e: Event) {
        let ctx = this
        var sb = e.target as MP4SourceBuffer
        if (sb.ms.readyState === 'open') {
            sb.sampleNum = 0
            sb.onupdateend = null
            sb.addEventListener(
                'updateend',
                this.onUpdateEnd.bind(sb, true, true, ctx)
            )
            /* In case there are already pending buffers we call onUpdateEnd to start appending them*/
            this.onUpdateEnd.call(sb, false, true, ctx)
            sb.ms.pendingInits--
            if (sb.ms.pendingInits === 0) {
                this.start()
            }
        }
    }

    onUpdateEnd(isNotInit: boolean, isEndOfAppend: boolean, ctx: Mp4MediaPlayer) {
        if (isEndOfAppend === true) {
            console.log('appendBuffer的操作已经结束')
            if ((this as unknown as MP4SourceBuffer).sampleNum) {
                // ctx.mp4boxfile.releaseUsedSamples(
                //     (this as unknown as MP4SourceBuffer).id,
                //     (this as unknown as MP4SourceBuffer).sampleNum
                // )
                delete (this as unknown as MP4SourceBuffer).sampleNum
            }
            if ((this as unknown as MP4SourceBuffer).is_last) {
                // ; (this as unknown as MP4SourceBuffer).ms.endOfStream()
            }
        }
        if (
            (this as unknown as MP4SourceBuffer).ms.readyState === 'open' &&
            (this as unknown as MP4SourceBuffer).updating === false &&
            (this as unknown as MP4SourceBuffer).pendingAppends.length > 0
        ) {
            var obj = (
                this as unknown as MP4SourceBuffer
            ).pendingAppends.shift()
                ; (this as unknown as MP4SourceBuffer).sampleNum = obj.sampleNum
                ; (this as unknown as MP4SourceBuffer).is_last = obj.is_last
                ; (this as unknown as MP4SourceBuffer).appendBuffer(obj.buffer)
        }
    }
}