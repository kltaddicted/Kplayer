import { Player } from "../page/player"
import { Video } from "../type/Player"
import MP4Box, { MP4ArrayBuffer, MP4File } from "mp4box"
import { DownLoader } from "./net/DownLoader"

export class Mp4Parser {
    url: string
    player: Player
    mp4boxfile: MP4File
    downloader: DownLoader
    constructor(url: string, player: Player) {
        this.url = url
        this.player = player
        this.mp4boxfile = MP4Box.createFile()
        this.downloader = new DownLoader(url)
        this.init()
    }
    init() {
        this.initEvent()
        this.loadFile()
    }
    initEvent() {
        //moov被解析完，将解析完的数据存入到video中
        this.stop()
        console.log('start')
        this.mp4boxfile.onReady = (info) => {
            console.log(info, 'info')
            let videoInfo: Video = {
                url: this.url,
                lastUpdateTime: info.modified,
                videoCodec: info.tracks[0].codec,
                audioCodec: info.tracks[1].codec,
                isFragmented: info.isFragmented,
                width: info.tracks[0].track_width,
                height: info.tracks[0].track_height,
            }
            this.player.setVideoInfo(videoInfo)
        }
    }
    loadFile() {
        let ctx = this
        this.downloader.setInterval(500)
        this.downloader.setChunkSize(1000000)
        this.downloader.setUrl(this.url)
        this.downloader.setCallback(function (response: MP4ArrayBuffer, end: boolean, error: any) {
            let nextStart = 0
            if (response) {
                nextStart = ctx.mp4boxfile.appendBuffer(response, end)
            }
            //下载完成
            if (end) {
                ctx.mp4boxfile.flush()
            } else {
                ctx.downloader.setChunkStart(nextStart)
            }
        })
        this.downloader.start()
    }
    //停止当前还在发送中的http请求
    stop() {
        if (!this.downloader.isStopped()) {
            this.downloader.stop()
        }
    }
}