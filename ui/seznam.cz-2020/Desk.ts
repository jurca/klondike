import {html, neverland, useContext} from 'neverland'
import {Color, ICard} from '../../game/Card'
import {IDesk} from '../../game/Desk'
import {IGame} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {lastItemOrNull} from '../../game/util'
import Card from './Card'
import style from './desk.css'
import GREEN_S from './deskBackground/s.svg'
import DeskStyle from './DeskStyle'
import draggable from './draggable'
import DragNDrop from './DragNDrop'
import DropArea from './DropArea'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import FoundationPile from './FoundationPile'
import InlineSvg from './InlineSvg'
import settingsContext from './settingsContext'
import Tableau from './Tableau'

export default neverland<any>(function Desk(deskState: IDesk, gameRules: IGame['rules'], onMove: (move: Move) => void) {
  const settings = useContext(settingsContext)
  const {deskStyle} = settings

  return html`
    <klondike-desk class=${style.desk} style="background: ${settings.deskColor.background}">
      ${DragNDrop(
        html`
          <div class=${style.deskContent}>
            <div class=${style.topBar} style="background: ${settings.deskColor.topBar}">
              <div class="${style.stock} ${style.topBarItem}">
                <div class=${style.cardHolder} onclick=${deskState.stock.cards.length ? onDraw : onRedeal}>
                  ${EmptyPilePlaceholder()}
                  ${deskState.stock.cards.map((card, cardIndex, {length}) =>
                    html`<div class=${style.stackedCard}>
                      ${Card(card, null, length - cardIndex < Math.min(3, length))}
                    </div>`,
                  )}
                </div>
              </div>
              <div class="${style.waste} ${style.topBarItem}">
                <div class=${style.cardHolder}>
                  ${EmptyPilePlaceholder()}
                  ${deskState.waste.cards.map((card, cardIndex, {length}) =>
                    html`<div class=${style.stackedCard}>
                      ${cardIndex === length - 1 ?
                        draggable(card, Card(card, null, length - cardIndex < Math.min(3, length)))
                      :
                        Card(card, null, length - cardIndex < Math.min(3, length))
                      }
                    </div>`,
                  )}
                </div>
              </div>
              <div class=${style.separator}></div>
              <div class="${style.foundationPile} ${style.topBarItem}">
                <div class=${style.cardHolder}>
                  ${DropArea(Color.SPADES, html`
                    ${FoundationPile(Color.SPADES, {cards: []})}
                    ${deskState.foundation[Color.SPADES].cards.map((card) =>
                      html`<div class=${style.stackedCard}>${Card(card)}</div>`,
                    )}
                  `)}
                </div>
              </div>
              <div class="${style.foundationPile} ${style.topBarItem}">
                <div class=${style.cardHolder}>
                  ${DropArea(Color.HEARTHS, html`
                    ${FoundationPile(Color.HEARTHS, {cards: []})}
                    ${deskState.foundation[Color.HEARTHS].cards.map((card) =>
                      html`<div class=${style.stackedCard}>${Card(card)}</div>`,
                    )}
                  `)}
                </div>
              </div>
              <div class="${style.foundationPile} ${style.topBarItem}">
                <div class=${style.cardHolder}>
                  ${DropArea(Color.CLUBS, html`
                    ${FoundationPile(Color.CLUBS, {cards: []})}
                    ${deskState.foundation[Color.CLUBS].cards.map((card) =>
                      html`<div class=${style.stackedCard}>${Card(card)}</div>`,
                    )}
                  `)}
                </div>
              </div>
              <div class="${style.foundationPile} ${style.topBarItem}">
                <div class=${style.cardHolder}>
                  ${DropArea(Color.DIAMONDS, html`
                    ${FoundationPile(Color.DIAMONDS, {cards: []})}
                    ${deskState.foundation[Color.DIAMONDS].cards.map((card) =>
                      html`<div class=${style.stackedCard}>${Card(card)}</div>`,
                    )}
                  `)}
                </div>
              </div>
            </div>

            <div class=${style.main}>
              <div class=${style.background}>
                ${deskStyle === DeskStyle.GREEN_S ?
                  html`
                    <div class=${style.greenSImageWrapper}>
                      <div class=${style.greenSInnerImageWrapper}>
                        <div class=${style.greenSImage}>
                          ${InlineSvg(GREEN_S)}
                        </div>
                      </div>
                    </div>
                  `
                :
                  null
                }
              </div>

              <div class=${style.tableau}>
                ${Tableau(deskState.tableau, onRevealCard)}
              </div>
            </div>
          </div>
        `,
        onElementDragged,
      )}
    </klondike-desk>
  `

  function onDraw() {
    onMove({
      drawnCards: gameRules.drawnCards,
      move: MoveType.DRAW_CARDS,
    })
  }

  function onRedeal() {
    onMove({
      move: MoveType.REDEAL,
    })
  }

  function onElementDragged(draggedElement: Element, dropArea: Element): void {
    const draggedCard = (draggedElement as Element & {entity: unknown}).entity as ICard
    const dropAreaId = (dropArea as Element & {areaId: unknown}).areaId as (Color | {pileIndex: number})
    console.log(draggedCard, dropAreaId)

    if (Object.values(Color).includes(dropAreaId as Color)) {
      if (draggedCard === lastItemOrNull(deskState.waste.cards)) {
        if (draggedCard.color === dropAreaId) {
          onMove({
            move: MoveType.WASTE_TO_FOUNDATION,
          })
        }
      } else {
        const pileIndex = deskState.tableau.piles.findIndex((pile) => pile.cards.includes(draggedCard))
        onMove({
          move: MoveType.TABLEAU_TO_FOUNDATION,
          pileIndex,
        })
      }
      return
    }

    const {pileIndex: dropPileIndex} = dropAreaId as {pileIndex: number}
    if (draggedCard === lastItemOrNull(deskState.waste.cards)) {
      onMove({
        move: MoveType.WASTE_TO_TABLEAU,
        pileIndex: dropPileIndex,
      })
    } else if (deskState.tableau.piles.some((pile) => pile.cards.includes(draggedCard))) {
      const sourcePileIndex = deskState.tableau.piles.findIndex((pile) => pile.cards.includes(draggedCard))
      const movedCardIndex = deskState.tableau.piles[sourcePileIndex].cards.indexOf(draggedCard)
      onMove({
        move: MoveType.TABLEAU_TO_TABLEAU,
        sourcePileIndex,
        targetPileIndex: dropPileIndex,
        topMovedCardIndex: movedCardIndex,
      })
    }
  }

  function onRevealCard(card: ICard): void {
    onMove({
      move: MoveType.REVEAL_TABLEAU_CARD,
      pileIndex: deskState.tableau.piles.findIndex((pile) => pile.cards.includes(card)),
    })
  }
})
