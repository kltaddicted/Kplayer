import { Player } from './page/player'

window.onload = function () {
    const player = new Player({ container: document.getElementById('video') })
    console.log(player)
}
