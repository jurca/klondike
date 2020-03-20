import * as React from 'react'
import {Color, ICard} from '../../game/Card'
import {IDesk} from '../../game/Desk'
import {IGame} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {lastItemOrNull} from '../../game/util'
import Card from './Card'
import style from './desk.css'
import GreenS from './deskBackground/s.svg'
import DeskStyle from './DeskStyle'
import Draggable from './Draggable'
import DragNDrop from './DragNDrop'
import DropArea from './DropArea'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import FoundationPile from './FoundationPile'
import settingsContext from './settingsContext'
import Tableau from './Tableau'

interface IProps {
  deskState: IDesk,
  gameRules: IGame['rules'],
  onMove(move: Move): void,
}

export default function Desk({deskState, gameRules, onMove}: IProps) {
  const settings = React.useContext(settingsContext)
  const {deskStyle} = settings

  return (
    <div className={style.desk} style={{background: settings.deskColor.background}}>
      <DragNDrop onEntityDragged={onElementDragged}>
        <div className={style.deskContent}>
          <div className={style.topBar} style={{background: settings.deskColor.topBar}}>
            <div className={`${style.stock} ${style.topBarItem}`}>
              <div className={style.cardHolder} onClick={deskState.stock.cards.length ? onDraw : onRedeal}>
                <EmptyPilePlaceholder/>
                {deskState.stock.cards.map((card, cardIndex, {length}) =>
                  <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                    <Card card={card} withShadow={length - cardIndex < Math.min(3, length)}/>
                  </div>,
                )}
              </div>
            </div>
            <div className={`${style.waste} ${style.topBarItem}`}>
              <div className={style.cardHolder}>
                <EmptyPilePlaceholder/>
                {deskState.waste.cards.map((card, cardIndex, {length}) =>
                  <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                    {cardIndex === length - 1 ?
                      <Draggable entity={card}>
                        <Card card={card} withShadow={length - cardIndex < Math.min(3, length)}/>
                      </Draggable>
                    :
                      <Card card={card} withShadow={length - cardIndex < Math.min(3, length)}/>
                    }
                  </div>,
                )}
              </div>
            </div>
            <div className={style.separator}/>
            <div className={`${style.foundationPile} ${style.topBarItem}`}>
              <div className={style.cardHolder}>
                <DropArea areaId={Color.SPADES}>
                  <FoundationPile color={Color.SPADES}/>
                  {deskState.foundation[Color.SPADES].cards.map((card, cardIndex, {length}) =>
                    <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                      {cardIndex === length - 1 ?
                        <Draggable entity={card}>
                          <Card card={card}/>
                        </Draggable>
                      :
                        <Card card={card}/>
                      }
                    </div>,
                  )}
                </DropArea>
              </div>
            </div>
            <div className={`${style.foundationPile} ${style.topBarItem}`}>
              <div className={style.cardHolder}>
                <DropArea areaId={Color.HEARTHS}>
                  <FoundationPile color={Color.HEARTHS}/>
                  {deskState.foundation[Color.HEARTHS].cards.map((card, cardIndex, {length}) =>
                    <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                      {cardIndex === length - 1 ?
                        <Draggable entity={card}>
                          <Card card={card}/>
                        </Draggable>
                      :
                        <Card card={card}/>
                      }
                    </div>,
                  )}
                </DropArea>
              </div>
            </div>
            <div className={`${style.foundationPile} ${style.topBarItem}`}>
              <div className={style.cardHolder}>
                <DropArea areaId={Color.CLUBS}>
                  <FoundationPile color={Color.CLUBS}/>
                  {deskState.foundation[Color.CLUBS].cards.map((card, cardIndex, {length}) =>
                    <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                      {cardIndex === length - 1 ?
                        <Draggable entity={card}>
                          <Card card={card}/>
                        </Draggable>
                      :
                        <Card card={card}/>
                      }
                    </div>,
                  )}
                </DropArea>
              </div>
            </div>
            <div className={`${style.foundationPile} ${style.topBarItem}`}>
              <div className={style.cardHolder}>
                <DropArea areaId={Color.DIAMONDS}>
                  <FoundationPile color={Color.DIAMONDS}/>
                  {deskState.foundation[Color.DIAMONDS].cards.map((card, cardIndex, {length}) =>
                    <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                      {cardIndex === length - 1 ?
                        <Draggable entity={card}>
                          <Card card={card}/>
                        </Draggable>
                      :
                        <Card card={card}/>
                      }
                    </div>,
                  )}
                </DropArea>
              </div>
            </div>
          </div>

          <div className={style.main}>
            <div className={style.background}>
              {deskStyle === DeskStyle.GREEN_S &&
                <div className={style.greenSImageWrapper}>
                  <div className={style.greenSInnerImageWrapper}>
                    <div className={style.greenSImage}>
                      <GreenS/>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div className={style.tableau}>
              <Tableau tableau={deskState.tableau} onRevealCard={onRevealCard}/>
            </div>
          </div>
        </div>
      </DragNDrop>
    </div>
  )

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

  function onElementDragged(draggedEntity: unknown, rawDropAreaId: unknown): void {
    const draggedCard = draggedEntity as ICard
    const dropAreaId = rawDropAreaId as (Color | {pileIndex: number})
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
    } else {
      onMove({
        color: draggedCard.color,
        move: MoveType.FOUNDATION_TO_TABLEAU,
        pileIndex: dropPileIndex,
      })
    }
  }

  function onRevealCard(card: ICard): void {
    onMove({
      move: MoveType.REVEAL_TABLEAU_CARD,
      pileIndex: deskState.tableau.piles.findIndex((pile) => pile.cards.includes(card)),
    })
  }
}
