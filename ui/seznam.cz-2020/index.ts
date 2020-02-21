import {html, render} from 'lighterhtml'
import {Color, Rank, Side} from '../../game/Card'
import {createNewGame} from '../../game/Game'
import Card from './Card'
import CardBackface from './CardBackface'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import FoundationPile from './FoundationPile'

const uiRoot = document.getElementById('app')!
const defaultGame = createNewGame({
  drawnCards: 3,
  tableauPiles: 7,
})
render(uiRoot, html`
  <ul style="padding: 10px 20px; font-size: 72px; background: wheat">
    ${Object.values(Color).map((color) =>
      html`<li style="display: flex; padding: 10px 0">${Object.values(Rank).map((rank) =>
        html`<div style="margin: 0 10px">${Card({color, rank, side: Side.FACE})}</div>`,
      )}</li>`,
    )}
    <li style="display: flex; padding: 10px 0">
      ${Object.values(CardBackfaceStyle).map((style) =>
        html`<div style="margin: 0 10px; width: 1em; height: 1.5em">${CardBackface(style)}</div>`,
      )}
    </li>
    <li style="display: flex; padding: 10px 0">
      ${Object.values(Color).map((color) =>
        html`<div style="margin: 0 10px">${FoundationPile(color, {cards: []})}</div>`,
      )}
      <div style="margin: 0 10px">
        ${EmptyPilePlaceholder()}
      </div>
    </li>
  </ul>

  <div style="width: 90vw; height: 90vh">
    ${Desk(defaultGame.state)}
  </div>
`)
