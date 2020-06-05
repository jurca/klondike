import * as React from 'react'
import {render} from 'react-dom'
import {equals as cardsArEqual, ICard, Side} from '../../game/Card'
import {createNewGame, executeMove, IGame, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator'
import {lastItem, lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import * as DeskSkins from './deskSkins'

const ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER = false
const TABLEAU_PILES_COUNT = 7

const uiRoot = document.getElementById('app')!

let game = createGame(1)
let hint: null | ICard = null
let deskSkin = DeskSkins.GREEN_S
let cardBackStyle = CardBackfaceStyle.SeznamLogo

rerenderUI()

function rerenderUI() {
  render(
    <App
      game={game}
      hint={hint}
      deskSkin={deskSkin}
      cardBackFace={cardBackStyle}
      onMove={onMove}
      onUndo={onUndo}
      onRedo={onRedo}
      onReset={onReset}
      onNewGame={onNewGame}
      onShowHint={onShowHint}
      onDeskStyleChange={onDeskStyleChange}
      onCardStyleChange={onCardBackStyleChange}
    />,
    uiRoot,
  )
}

function onMove(move: Move): void {
  try {
    game = executeMove(game, move)
    const unrevealedCardPileIndex = game.state.tableau.piles.findIndex(
      (pile) => lastItemOrNull(pile.cards)?.side === Side.BACK,
    )
    if (unrevealedCardPileIndex > -1) {
      game = executeMove(game, {
        move: MoveType.REVEAL_TABLEAU_CARD,
        pileIndex: unrevealedCardPileIndex,
      })
    }
  } catch (moveError) {
    // tslint:disable-next-line:no-console
    console.error(moveError)
    return
  }

  const isHintCardInStock = [...game.state.stock.cards, ...game.state.waste.cards].some(
    (otherCard) => hint && cardsArEqual(otherCard, hint),
  )
  if (
    (
      move.move !== MoveType.DRAW_CARDS ||
      !isHintCardInStock
    ) && (
      move.move !== MoveType.REDEAL ||
      !isHintCardInStock
    )
  ) {
    hint = null
  }
  rerenderUI()
}

function onNewGame(drawnCards: 1 | 3): void {
  game = createGame(drawnCards)
  hint = null
  rerenderUI()
}

function onUndo(): void {
  if (game.history.length && lastItem(game.history)[1].move === MoveType.REVEAL_TABLEAU_CARD) {
    game = undoLastMove(game)
  }
  game = undoLastMove(game)
  hint = null
  rerenderUI()
}

function onRedo(): void {
  game = redoNextMove(game)
  if (game.future.length && game.future[0][1].move === MoveType.REVEAL_TABLEAU_CARD) {
    game = redoNextMove(game)
  }
  hint = null
  rerenderUI()
}

function onReset(): void {
  game = resetGame(game)
  hint = null
  rerenderUI()
}

function onShowHint(): void {
  if (hint) {
    hint = null
  } else {
    const generatedHints = getMoveHints(game.state, game.rules, HintGeneratorMode.WITH_FULL_STOCK)
    hint = generatedHints.length ? generatedHints[0][1] : null
  }
  rerenderUI()
}

function onDeskStyleChange(newDeskStyle: string): void {
  if (newDeskStyle in DeskSkins) {
    deskSkin = (DeskSkins as any)[newDeskStyle]
    rerenderUI()
  }
}

function onCardBackStyleChange(newCardBackStyle: CardBackfaceStyle): void {
  cardBackStyle = newCardBackStyle
  rerenderUI()
}

function createGame(drawnCards: 1 | 3): IGame {
  return createNewGame({
    allowNonKingToEmptyPileTransfer: ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER,
    drawnCards,
    tableauPiles: TABLEAU_PILES_COUNT,
  })
}
