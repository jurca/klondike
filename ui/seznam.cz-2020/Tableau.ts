import {html} from 'neverland'
import {ITableau} from '../../game/Tableau'
import Card from './Card'
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
                          ${Card(card, !!cardIndex)}
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
