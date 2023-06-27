import { Player } from './page/player'
window.onload = function () {
    const video = document.getElementById('video')
    console.log(video)
    const player = new Player()
    player.hello()
}
