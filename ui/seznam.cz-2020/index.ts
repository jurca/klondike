import {html, render} from 'lighterhtml'
import {createNewGame, executeMove} from '../../game/Game'
import {MoveType} from '../../game/Move'
import Desk from './Desk'

const uiRoot = document.getElementById('app')!
const defaultGame = executeMove(
  createNewGame({
    drawnCards: 3,
    tableauPiles: 7,
  }),
  {
    drawnCards: 6,
    move: MoveType.DRAW_CARDS,
  },
)
render(uiRoot, html`
  <div style="width: 100%; height: 100%;">
    ${Desk(defaultGame.state)}
  </div>
`)
