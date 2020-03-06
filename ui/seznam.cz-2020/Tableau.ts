import {html} from 'neverland'
import {Side} from '../../game/Card'
import {ITableau} from '../../game/Tableau'
import Card from './Card'
import draggable from './draggable'
import DropArea from './DropArea'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import style from './tableau.css'

export default function Tableau(tableau: ITableau) {
  return html`
    <klondike-tableau class=${style.tableau}>
      <div class=${style.tableauContent}>
        ${tableau.piles.map((pile) =>
          html`
            <div class=${style.pile}>
              ${DropArea(html`
                ${EmptyPilePlaceholder()}
                <div class=${style.pileCards}>
                  ${pile.cards.map((card, cardIndex) =>
                    html`
                      <div class=${style.pileCardHolder}>
                        <div class=${style.pileCardWrapper}>
                          ${card.side === Side.FACE ? draggable(Card(card, !!cardIndex)) : Card(card, !!cardIndex)}
                        </div>
                      </div>
                    `,
                  )}
                </div>
              `, style.pileDropArea)}
            </div>
          `,
        )}
      </div>
    </klondike-tableau>
  `
}
