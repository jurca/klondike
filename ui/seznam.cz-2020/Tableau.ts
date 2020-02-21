import {html} from 'lighterhtml'
import {ITableau} from '../../game/Tableau'
import Card from './Card'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import style from './tableau.css'

export default function Tableau(tableau: ITableau) {
  return html`
    <klondike-tableau class=${style.tableau}>
      <div class=${style.tableauContent}>
        ${tableau.piles.map((pile) =>
          html.for(pile)`
            <div class=${style.pile}>
              ${EmptyPilePlaceholder()}
              <div class=${style.pileCards}>
                ${pile.cards.map((card, cardIndex) =>
                  html.for(card)`
                    <div class=${style.pileCardHolder}>
                      <div class=${style.pileCardWrapper}>
                        ${Card(card, !!cardIndex)}
                      </div>
                    </div>
                  `,
                )}
              </div>
            </div>
          `,
        )}
      </div>
    </klondike-tableau>
  `
}
