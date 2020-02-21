import {augmentor, useContext} from 'dom-augmentor'
import {html} from 'lighterhtml'
import {Color} from '../../game/Card'
import {IDesk} from '../../game/Desk'
import Card from './Card'
import style from './desk.css'
import GREEN_S from './deskBackground/s.svg'
import DeskStyle from './DeskStyle'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import FoundationPile from './FoundationPile'
import InlineSvg from './InlineSvg'
import settingsContext from './settingsContext'
import Tableau from './Tableau'

export default augmentor(function Desk(deskState: IDesk) {
  const settings = useContext(settingsContext)
  const {deskStyle} = settings

  return html`
    <klondike-desk class=${style.desk} style="background: ${settings.deskColor.background}">
      <div class=${style.topBar} style="background: ${settings.deskColor.topBar}">
        <div class="${style.stock} ${style.topBarItem}">
          <div class=${style.cardHolder}>
            ${EmptyPilePlaceholder()}
            ${deskState.stock.cards.map((card) =>
              html.for(card)`<div class=${style.stackedCard}>${Card(card)}</div>`,
            )}
          </div>
        </div>
        <div class="${style.waste} ${style.topBarItem}">
          <div class=${style.cardHolder}>
            ${EmptyPilePlaceholder()}
            ${deskState.waste.cards.map((card, cardIndex, {length}) =>
              html.for(card)`<div class=${style.stackedCard}>
                ${Card(card, length - cardIndex < Math.min(3, length))}
              </div>`,
            )}
          </div>
        </div>
        <div class=${style.separator}></div>
        <div class="${style.foundationPile} ${style.topBarItem}">
          <div class=${style.cardHolder}>
            ${FoundationPile(Color.SPADES, {cards: []})}
            ${deskState.foundation[Color.SPADES].cards.map((card) =>
              html.for(card)`<div class=${style.stackedCard}>${Card(card)}</div>`,
            )}
          </div>
        </div>
        <div class="${style.foundationPile} ${style.topBarItem}">
          <div class=${style.cardHolder}>
            ${FoundationPile(Color.HEARTHS, {cards: []})}
            ${deskState.foundation[Color.HEARTHS].cards.map((card) =>
              html.for(card)`<div class=${style.stackedCard}>${Card(card)}</div>`,
            )}
          </div>
        </div>
        <div class="${style.foundationPile} ${style.topBarItem}">
          <div class=${style.cardHolder}>
            ${FoundationPile(Color.CLUBS, {cards: []})}
            ${deskState.foundation[Color.CLUBS].cards.map((card) =>
              html.for(card)`<div class=${style.stackedCard}>${Card(card)}</div>`,
            )}
          </div>
        </div>
        <div class="${style.foundationPile} ${style.topBarItem}">
          <div class=${style.cardHolder}>
            ${FoundationPile(Color.DIAMONDS, {cards: []})}
            ${deskState.foundation[Color.DIAMONDS].cards.map((card) =>
              html.for(card)`<div class=${style.stackedCard}>${Card(card)}</div>`,
            )}
          </div>
        </div>
      </div>
      <div class=${style.main}>
        ${deskStyle === DeskStyle.GREEN_S ?
          html`
            <div class=${style.greenS}>
              <div class=${style.greenSImageWrapper}>
                <div class=${style.greenSInnerImageWrapper}>
                  <div class=${style.greenSImage}>
                    ${InlineSvg(GREEN_S)}
                  </div>
                </div>
              </div>
            </div>
          `
        :
          null
        }

        <div class=${style.tableau}>
          ${Tableau(deskState.tableau)}
        </div>
      </div>
    </klondike-desk>
  `
})
