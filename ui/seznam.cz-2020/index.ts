import {html, render} from 'neverland'
import {createNewGame, executeMove} from '../../game/Game'
import {Move} from '../../game/Move'
import Desk from './Desk'

const uiRoot = document.getElementById('app')!

let game = createNewGame({
  drawnCards: 1,
  tableauPiles: 7,
})

rerenderUI()

function rerenderUI() {
  render(uiRoot, html`
    <div style="width: 100%; height: 100%;">
      ${Desk(game.state, game.rules, onMove)}
    </div>
  `)
}

function onMove(move: Move): void {
  game = executeMove(game, move)
  rerenderUI()
}
