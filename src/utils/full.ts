export interface HTMLFullScreenELement extends HTMLElement {
    mozRequestFullScreen: () => Promise<void>
    webkitRequestFullscreen: () => Promise<void>
    msRequestFullscreen: () => Promise<void>
    mozCancelFullScreen: () => Promise<void>
    webkitExitFullscreen: () => Promise<void>
    msExitFullscreen: () => Promise<void>
}


export function enterFull(full: HTMLFullScreenELement) {
    if (full.requestFullscreen) {
        return full.requestFullscreen()
        //兼容Firefox
    } else if (full.mozRequestFullScreen) {
        return full.mozRequestFullScreen()
        //兼容Chrome, Safari and Opera等
    } else if (full.webkitRequestFullscreen) {
        return full.webkitRequestFullscreen()
        //兼容IE/Edge
    } else if (full.msRequestFullscreen) {
        return full.msRequestFullscreen()
    } else {
        throw new Error('你的浏览器不支持任何全屏请求')
    }
}

export function exitFull(): Promise<void> {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        //兼容Firefox
    } else if (document['mozCancelFullScreen']) {
        return document['mozCancelFullScreen']();
        //兼容Chrome, Safari and Opera等
    } else if (document['webkitExitFullscreen']) {
        return document['webkitExitFullscreen']();
        //兼容IE/Edge
    } else if (document['msExitFullscreen']) {
        return document['msExitFullscreen']();
    } else {
        throw new Error('你的浏览器不支持任何退出全屏请求')
    }
}
