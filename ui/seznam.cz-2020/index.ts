import {html, render} from 'lighterhtml'
import {createNewGame} from '../../game/Game'
import Desk from './Desk'

const uiRoot = document.getElementById('app')!
const defaultGame = createNewGame({
  drawnCards: 3,
  tableauPiles: 7,
})
render(uiRoot, html`
  <div style="width: 100%; height: 100%;">
    ${Desk(defaultGame.state)}
  </div>
`)
