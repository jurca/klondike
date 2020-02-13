import {html, render} from 'lighterhtml'
import {DECK} from '../../game/Card'
import Card from './Card'

const uiRoot = document.getElementById('app')!
render(uiRoot, html`
  <ul style="font-size: 32px">
    ${DECK.map((card) =>
      html.for(card)`${Card(card, 0)}`,
    )}
  </ul>
`)
