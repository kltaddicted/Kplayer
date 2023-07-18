import { XHRLoader } from "./XHRLoader"
import { Log } from 'mp4box'
import { RequestHeader } from "@/type/mp4"
import HTTPRequest from "./HTTPRequest"
export class DownLoader {
    isActive: boolean = false
    realtime: boolean = false
    // chunkStart指的是请求的Chunk在整个文件中的初始偏移量
    chunkStart: number = 0
    chunkSize: number = 0 //每次加载多少
    totalLength: number = 0
    chunkTimeout: number = 1000
    timeoutID: number | null = null
    url: string = ''
    callback: Function = null
    eof: boolean = false
    loader: XHRLoader
    constructor(url?: string) {
        this.url = url || ''
        this.loader = new XHRLoader()
    }

    //start 从头请求文件
    start() {
        Log.info('Downloader', 'Starting file download')
        this.chunkStart = 0
        this.resume()
        return this
    }
    reset() {
        this.chunkStart = 0
        this.totalLength = 0
        this.eof = false
        return this
    }

    stop() {
        window.clearTimeout(this.timeoutID)
        this.timeoutID = null
        this.isActive = false
        return this
    }

    // resume和start不同的是resume可能是在文件的请求暂停后重新设置了chunkStart之后再去重新请求新的chunk,而start是重新请求
    resume() {
        Log.info('Downloader', 'Resuming file download')
        this.isActive = true
        if (this.chunkSize === 0) {
            this.chunkSize = Infinity
        }
        this.getFile()
        return this
    }
    //通过自定义xhr来分片下载数据
    initHttpRequest() {
        let xhr = new XMLHttpRequest();
        let header: RequestHeader = {};
        //加上chunkstart属性
        (xhr as XMLHttpRequest & { [props: string]: any }).start = this.chunkStart
        if (this.chunkStart + this.chunkSize < Infinity) {
            let endRange = 0
            let range = 'bytes=' + this.chunkStart + '-'
            endRange = this.chunkStart + this.chunkSize - 1
            range += endRange
            //关键:告知服务器返回文件的哪一部分
            // Range: <unit> = <range-start>-<range-end>
            header.Range = range
        }
        let request = new HTTPRequest({
            url: this.url,
            header: header,
            method: 'get',
            xhr: xhr
        })
        return request
    }
    getFile() {
        let ctx = this
        if (this.isStopped()) return
        // eof为true表示整个媒体文件已经请求完毕
        if (ctx.totalLength !== 0 && ctx.chunkStart >= ctx.totalLength) {
            ctx.eof = true
        }
        if (ctx.eof) {
            Log.info('Downloader', 'File download done.')
            ctx.callback(null, true)
            return
        }
        let request = this.initHttpRequest()
        this.loader.load({
            request: request,
            error: error,
            success: success,
        })

        function error(e) {
            ctx.callback(null, false, true)
        }
        function success() {
            //this在XHRLoader作用域内
            let xhr = this
            // let rangeReceived = xhr.getResponseHeader('Content-Range')
            // if (ctx.totalLength === 0 && rangeReceived) {
            //     let sizeIndex = rangeReceived.indexOf('/')
            //     if (sizeIndex > -1) {
            //         ctx.totalLength = rangeReceived.slice(sizeIndex + 1)
            //     }
            // }
            //当一轮的字节数小于每轮的chunksize则说明加载完成
            ctx.eof = xhr.response.byteLength !== ctx.chunkSize
            //  ||xhr.response.byteLength === ctx.totalLength
            let buffer = xhr.response
            buffer.fileStart = xhr.start
            ctx.callback(buffer, ctx.eof)
            // 如果下载器还是处于激活状态且还没全部下载完成的话,继续下载数据，实现切片下载
            if (ctx.isActive === true && ctx.eof === false) {
                let timeoutDuration = ctx.chunkTimeout
                ctx.timeoutID = window.setTimeout(
                    ctx.getFile.bind(ctx),
                    timeoutDuration
                )
            }
        }

    }
    isStopped() {
        return !this.isActive
    }
    setCallback(_callback: Function) {
        this.callback = _callback
        return this
    }
    getFileLength() {
        return this.totalLength
    }

    setUrl(_url: string): this {
        this.url = _url
        return this
    }

    setRealTime(_realtime: boolean): this {
        this.realtime = _realtime
        return this
    }

    setChunkSize(_size: number) {
        this.chunkSize = _size
        return this
    }

    setChunkStart(_start: number) {
        this.chunkStart = _start
        this.eof = false
        return this
    }

    setInterval(_timeout: number) {
        this.chunkTimeout = _timeout
        return this
    }

}