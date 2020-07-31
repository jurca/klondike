import * as React from 'react'
import {Color, equals as cardsAreEqual, ICard} from '../../game/Card'
import {Desk} from '../../game/Desk'
import Card from './Card'
import Draggable from './Draggable'
import DropArea from './DropArea'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import FoundationPile from './FoundationPile'
import settingsContext from './settingsContext'
import style from './topBar.css'

interface IProps {
  stock: readonly ICard[]
  waste: readonly ICard[]
  foundation: Desk['foundation']
  hint: null | ICard
  foundationRefs: Map<Color, React.RefObject<Element>>
  onDraw(): void
  onRedeal(): void
  onTransferWasteCardToFoundation(): void
}

export default function TopBar(props: IProps) {
  const {foundation, foundationRefs, hint, stock, waste, onDraw, onRedeal, onTransferWasteCardToFoundation} = props
  const settings = React.useContext(settingsContext)

  return (
    <div className={style.topBar} style={{background: settings.deskColor.topBar}}>
      <div className={style.topBarContent}>
        <div className={`${style.stock} ${style.topBarItem}`}>
          <div className={style.cardHolder} onClick={stock.length ? onDraw : onRedeal}>
            <EmptyPilePlaceholder/>
            {stock.map((card, cardIndex, {length}) =>
              <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                <Card
                  card={card}
                  isHinted={hint ? cardsAreEqual(card, hint) : false}
                  withShadow={length - cardIndex < Math.min(3, length)}
                />
              </div>,
            )}
          </div>
        </div>
        <div className={`${style.waste} ${style.topBarItem}`}>
          <div className={style.cardHolder}>
            <EmptyPilePlaceholder/>
            {waste.map((card, cardIndex, {length}) =>
              <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                {cardIndex === length - 1 ?
                  <Draggable entity={card}>
                    <Card
                      card={card}
                      isHinted={hint ? cardsAreEqual(card, hint) : false}
                      withShadow={length - cardIndex < Math.min(3, length)}
                      onDoubleClick={onTransferWasteCardToFoundation}
                      onSecondaryClick={onTransferWasteCardToFoundation}
                    />
                  </Draggable>
                :
                  <Card
                    card={card}
                    isHinted={hint ? cardsAreEqual(card, hint) : false}
                    withShadow={length - cardIndex < Math.min(3, length)}
                  />
                }
              </div>,
            )}
          </div>
        </div>
        <div className={style.separator}/>
        <div className={`${style.foundationPile} ${style.topBarItem}`}>
          <div className={style.cardHolder}>
            <DropArea areaId={Color.SPADES}>
              <FoundationPile color={Color.SPADES} ref={foundationRefs.get(Color.SPADES)}/>
              {foundation[Color.SPADES].cards.map((card, cardIndex, {length}) =>
                <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                  {cardIndex === length - 1 ?
                    <Draggable entity={card}>
                      <Card
                        card={card}
                        isHinted={hint ? cardsAreEqual(card, hint) : false}
                        withShadow={length > 1}
                      />
                    </Draggable>
                  :
                    <Card
                      card={card}
                      isHinted={hint ? cardsAreEqual(card, hint) : false}
                      withShadow={length - cardIndex < Math.min(3, length)}
                    />
                  }
                </div>,
              )}
            </DropArea>
          </div>
        </div>
        <div className={`${style.foundationPile} ${style.topBarItem}`}>
          <div className={style.cardHolder}>
            <DropArea areaId={Color.HEARTHS}>
              <FoundationPile color={Color.HEARTHS} ref={foundationRefs.get(Color.HEARTHS)}/>
              {foundation[Color.HEARTHS].cards.map((card, cardIndex, {length}) =>
                <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                  {cardIndex === length - 1 ?
                    <Draggable entity={card}>
                      <Card
                        card={card}
                        isHinted={hint ? cardsAreEqual(card, hint) : false}
                        withShadow={length > 1}
                      />
                    </Draggable>
                  :
                    <Card
                      card={card}
                      isHinted={hint ? cardsAreEqual(card, hint) : false}
                      withShadow={length - cardIndex < Math.min(3, length)}
                    />
                  }
                </div>,
              )}
            </DropArea>
          </div>
        </div>
        <div className={`${style.foundationPile} ${style.topBarItem}`}>
          <div className={style.cardHolder}>
            <DropArea areaId={Color.CLUBS}>
              <FoundationPile color={Color.CLUBS} ref={foundationRefs.get(Color.CLUBS)}/>
              {foundation[Color.CLUBS].cards.map((card, cardIndex, {length}) =>
                <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                  {cardIndex === length - 1 ?
                    <Draggable entity={card}>
                      <Card
                        card={card}
                        isHinted={hint ? cardsAreEqual(card, hint) : false}
                        withShadow={length > 1}
                      />
                    </Draggable>
                  :
                    <Card
                      card={card}
                      isHinted={hint ? cardsAreEqual(card, hint) : false}
                      withShadow={length - cardIndex < Math.min(3, length)}
                    />
                  }
                </div>,
              )}
            </DropArea>
          </div>
        </div>
        <div className={`${style.foundationPile} ${style.topBarItem}`}>
          <div className={style.cardHolder}>
            <DropArea areaId={Color.DIAMONDS}>
              <FoundationPile color={Color.DIAMONDS} ref={foundationRefs.get(Color.DIAMONDS)}/>
              {foundation[Color.DIAMONDS].cards.map((card, cardIndex, {length}) =>
                <div key={`${card.rank}:${card.color}`} className={style.stackedCard}>
                  {cardIndex === length - 1 ?
                    <Draggable entity={card}>
                      <Card
                        card={card}
                        isHinted={hint ? cardsAreEqual(card, hint) : false}
                        withShadow={length > 1}
                      />
                    </Draggable>
                  :
                    <Card
                      card={card}
                      isHinted={hint ? cardsAreEqual(card, hint) : false}
                      withShadow={length - cardIndex < Math.min(3, length)}
                    />
                  }
                </div>,
              )}
            </DropArea>
          </div>
        </div>
      </div>
    </div>
  )
}
