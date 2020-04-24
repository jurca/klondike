import * as React from 'react'
import {render} from 'react-dom'
import {Side} from '../../game/Card'
import {createNewGame, executeMove, IGame, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {lastItem, lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import {GREEN_S} from './deskSkins'

const ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER = false
const TABLEAU_PILES_COUNT = 7

const uiRoot = document.getElementById('app')!

let game = createGame(1)

rerenderUI()

function rerenderUI() {
  render(
    <App
      game={game}
      deskSkin={GREEN_S}
      cardBackFace={CardBackfaceStyle.SeznamLogo}
      onMove={onMove}
      onUndo={onUndo}
      onRedo={onRedo}
      onReset={onReset}
      onNewGame={onNewGame}
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

  rerenderUI()
}

function onNewGame(drawnCards: 1 | 3): void {
  game = createGame(drawnCards)
  rerenderUI()
}

function onUndo(): void {
  if (game.history.length && lastItem(game.history)[1].move === MoveType.REVEAL_TABLEAU_CARD) {
    game = undoLastMove(game)
  }
  game = undoLastMove(game)
  rerenderUI()
}

function onRedo(): void {
  game = redoNextMove(game)
  if (game.future.length && game.future[0][1].move === MoveType.REVEAL_TABLEAU_CARD) {
    game = redoNextMove(game)
  }
  rerenderUI()
}

function onReset(): void {
  game = resetGame(game)
  rerenderUI()
}

function createGame(drawnCards: 1 | 3): IGame {
  return createNewGame({
    allowNonKingToEmptyPileTransfer: ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER,
    drawnCards,
    tableauPiles: TABLEAU_PILES_COUNT,
  })
}
