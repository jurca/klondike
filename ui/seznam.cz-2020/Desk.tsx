import * as React from 'react'
import {Color, ICard, Rank, Side} from '../../game/Card'
import {isVictory} from '../../game/Desk'
import {IGame} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {lastItemOrNull} from '../../game/util'
import BottomBar from './BottomBar'
import style from './desk.css'
import Clubs from './deskBackground/clubs.svg'
import Diamonds from './deskBackground/diamonds.svg'
import Hearths from './deskBackground/hearths.svg'
import GreenS from './deskBackground/s.svg'
import Spades from './deskBackground/spades.svg'
import DeskStyle from './DeskStyle'
import DragNDrop from './DragNDrop'
import FullscreenToggle from './FullscreenToggle'
import settingsContext from './settingsContext'
import StocksBar from './StocksBar'
import {StockPosition} from './storage/SettingsStorage'
import Tableau from './Tableau'
import TopBar from './TopBar'
import VictoryScreen from './VictoryScreen'

interface IProps {
  defaultTableauPiles: number
  game: null | IGame
  hint: null | ICard
  stockPosition: StockPosition
  previewMode: boolean
  onMove(move: Move): void
  onNewGame(): void
  onPauseGame(): void
  onUndo(): void
  onShowHint(): void
  onShowSettings(): void
}

const VICTORY_SCREEN_OPTIONS = {
  animationSpeed: 1,
  bounciness: 0.85,
  drag: 0.05,
  gravity: 1.5,
  maxHorizontalInitialForce: -20,
  minHorizontalInitialForce: -60,
  nextActorStartDelay: 200,
  squashiness: 1.75,
  timeDeltaCap: 100,
}

export default function Desk(
  {
    defaultTableauPiles,
    game,
    hint,
    stockPosition,
    previewMode,
    onMove,
    onNewGame,
    onPauseGame,
    onShowHint,
    onShowSettings,
    onUndo,
  }: IProps,
) {
  const {state: deskState, rules: gameRules} = game || {}
  const settings = React.useContext(settingsContext)
  const {desk: deskSkin} = settings

  const [spadesFoundationRef, hearthsFoundationRef, clubsFoundationRef, diamondsFoundationRef] = [
    React.useRef<Element>(null),
    React.useRef<Element>(null),
    React.useRef<Element>(null),
    React.useRef<Element>(null),
  ]
  const foundationRefs = React.useMemo(() => new Map([
    [Color.SPADES, spadesFoundationRef],
    [Color.HEARTHS, hearthsFoundationRef],
    [Color.CLUBS, clubsFoundationRef],
    [Color.DIAMONDS, diamondsFoundationRef],
  ]), [
    spadesFoundationRef,
    hearthsFoundationRef,
    clubsFoundationRef,
    diamondsFoundationRef,
  ])

  const [isFullscreenActive, setFullscreen] = React.useState(false)
  const onToggleFullscreen = React.useMemo(
    () => () => setFullscreen(!isFullscreenActive),
    [isFullscreenActive, setFullscreen],
  )

  const victoryScreenActors = React.useMemo(() => new Map(Array.from(foundationRefs).map(
    ([color, ref]) => [ref, {color, rank: Rank.KING, side: Side.FACE}],
  )), [foundationRefs])
  const [, setShowVictory] = React.useState(false)
  React.useEffect(() => {
    setShowVictory(true)
  }, [])

  return (
    <div className={style.desk} style={{background: deskSkin.background}}>
      <div className={style.background}>
        {deskSkin.style === DeskStyle.GREEN_S_TILES &&
          <div className={style.greenSTiles}/>
        }
        {deskSkin.style === DeskStyle.RED_S_TILES &&
          <div className={style.redSTiles}/>
        }
      </div>
      <DragNDrop onEntityDragged={onElementDragged}>
        <div className={style.deskContent}>
          {!isFullscreenActive && !previewMode &&
            <TopBar game={game} onShowSettings={onShowSettings}/>
          }

          <StocksBar
            stock={deskState?.stock.cards ?? []}
            waste={deskState?.waste.cards ?? []}
            foundation={deskState?.foundation ?? null}
            hint={hint}
            stockPosition={stockPosition}
            foundationRefs={foundationRefs}
            onDraw={onDraw}
            onRedeal={onRedeal}
            onTransferWasteCardToFoundation={onTransferWasteCardToFoundation}
          />

          <div className={style.main}>
            <div className={style.tableauBackground}>
              {deskSkin.style === DeskStyle.GREEN_S &&
                <div className={style.greenSImageWrapper}>
                  <div className={style.greenSInnerImageWrapper}>
                    <div className={style.greenSImage}>
                      <GreenS/>
                    </div>
                  </div>
                </div>
              }
              {deskSkin.style === DeskStyle.TEAL_COLORS &&
                <div className={style.tealColors}>
                  <div className={style.tealColorsGroup}>
                    <Hearths/>
                    <Spades/>
                  </div>
                  <div className={style.tealColorsGroup}>
                    <Diamonds/>
                    <Clubs/>
                  </div>
                </div>
              }
            </div>

            <div className={style.tableau}>
              <Tableau
                defaultTableauPiles={defaultTableauPiles}
                tableau={deskState?.tableau ?? null}
                hint={hint}
                onRevealCard={onRevealCard}
                onTransferCardToFoundation={onTransferTableauCardToFoundation}
              />
            </div>
          </div>

          {!previewMode &&
            <FullscreenToggle isFullscreenModeActive={isFullscreenActive} onToggleFullscreen={onToggleFullscreen}/>
          }

          {!isFullscreenActive && !previewMode &&
            <BottomBar onNewGame={onNewGame} onPauseGame={onPauseGame} onShowHint={onShowHint} onUndo={onUndo}/>
          }
        </div>
      </DragNDrop>
      {deskState && isVictory(deskState) &&
        <VictoryScreen
          {...VICTORY_SCREEN_OPTIONS}
          actors={victoryScreenActors}
        />
      }
    </div>
  )

  function onDraw() {
    if (gameRules) {
      onMove({
        drawnCards: gameRules.drawnCards,
        move: MoveType.DRAW_CARDS,
      })
    }
  }

  function onRedeal() {
    onMove({
      move: MoveType.REDEAL,
    })
  }

  function onElementDragged(draggedEntity: unknown, rawDropAreaId: unknown): void {
    if (!deskState) {
      return
    }

    const draggedCard = draggedEntity as ICard
    const dropAreaId = rawDropAreaId as (Color | {pileIndex: number})

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
    if (deskState) {
      onMove({
        move: MoveType.REVEAL_TABLEAU_CARD,
        pileIndex: deskState.tableau.piles.findIndex((pile) => pile.cards.includes(card)),
      })
    }
  }

  function onTransferWasteCardToFoundation(): void {
    onMove({
      move: MoveType.WASTE_TO_FOUNDATION,
    })
  }

  function onTransferTableauCardToFoundation(card: ICard): void {
    if (deskState) {
      onMove({
        move: MoveType.TABLEAU_TO_FOUNDATION,
        pileIndex: deskState.tableau.piles.findIndex((pile) => pile.cards.includes(card)),
      })
    }
  }
}
