import { Player } from './page/player'
import './index.css'
import dash from 'dashjs'
window.onload = function () {
    const player = new Player({
        url: 'https://novaex.cc/fireworks.mp4',
        container: document.getElementById('video'),
        streamPlay: true,
        thumbnails: {
            // 缩略图设置选项
            col: 1,
            row: 47,
            total: 47,
            source: 'https://novaex.cc/sprites.png',
            interval: 6,
        },
        danmaku: {
            //弹幕
            open: true,
            api: 'https://bilibili-service.vercel.app/api/danmaku',
            type: 'http',
            timeout: 5000,
        },
    })
}
