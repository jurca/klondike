import * as React from 'react'
import {equals as cardsAreEqual, ICard, Side} from '../../game/Card'
import {ITableau} from '../../game/Tableau'
import Card from './Card'
import Draggable from './Draggable'
import DropArea from './DropArea'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import style from './tableau.css'

interface IProps {
  tableau: ITableau
  hint: null | ICard
  onRevealCard(card: ICard): void
  onTransferCardToFoundation(card: ICard): void
}

export default function Tableau({tableau, hint, onRevealCard, onTransferCardToFoundation}: IProps) {
  return (
    <div className={style.tableau}>
      <div className={style.tableauContent}>
        {tableau.piles.map((pile, pileIndex) =>
          <div key={pileIndex} className={style.pile}>
            <DropArea areaId={{pileIndex}} className={style.pileDropArea}>
              <EmptyPilePlaceholder/>
              <div className={style.pileCards}>
                {pile.cards.map((card, cardIndex, {length}) =>
                  <div
                    key={`${card.color}:${card.rank}`}
                    className={card.side === Side.FACE ? style.revealedCardHolder : style.unrevealedCardHolder}
                  >
                    <div className={style.pileCardWrapper}>
                      {card.side === Side.FACE ?
                        <Draggable entity={card} relatedEntities={pile.cards.slice(cardIndex + 1)}>
                          <Card
                            card={card}
                            isHinted={hint ? cardsAreEqual(card, hint) : false}
                            withShadow={!!cardIndex}
                            onDoubleClick={cardIndex === length - 1 ? onTransferCardToFoundation : null}
                            onSecondaryClick={cardIndex === length - 1 ? onTransferCardToFoundation : null}
                          />
                        </Draggable>
                      :
                        <Card
                          card={card}
                          isHinted={hint ? cardsAreEqual(card, hint) : false}
                          withShadow={!!cardIndex}
                          onClick={cardIndex === length - 1 ? onRevealCard : null}
                        />
                      }
                    </div>
                  </div>,
                )}
              </div>
            </DropArea>
          </div>,
        )}
      </div>
    </div>
  )
}
