import * as React from 'react'
import {render} from 'react-dom'
import {makeMove} from '../../game/Bot'
import {ICard, Side} from '../../game/Card'
import {createNewGame, executeMove, IGame, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator'
import {deserialize} from '../../game/Serializer'
import {lastItem, lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS} from './config'
import * as DeskSkins from './deskSkins'
import WinnableGamesProvider from './WinnableGamesProvider'

const uiRoot = document.getElementById('app')!

let game: IGame // TODO: set explicitly to null until a game is generated or selected
let hint: null | ICard = null
let deskSkin = DeskSkins.GREEN_S
let cardBackStyle = CardBackfaceStyle.SeznamLogo

requestAnimationFrame(() => {
  return onNewWinnableGame(1)
})

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
      onNewWinnableGame={onNewWinnableGame}
      onShowHint={onShowHint}
      onDeskStyleChange={onDeskStyleChange}
      onCardStyleChange={onCardBackStyleChange}
      onBotMove={onBotMove}
      onImport={onImport}
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

  hint = null
  rerenderUI()
}

function onNewWinnableGame(drawnCards: 1 | 3): void {
  game = createWinnableGame(drawnCards)
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
    const basicHints = getMoveHints(game.state, game.rules, HintGeneratorMode.CURRENT_STATE)
    if (basicHints.length) {
      hint = basicHints[0][1]
    } else {
      const generalHints = getMoveHints(game.state, game.rules, HintGeneratorMode.WITH_FULL_STOCK)
      hint = generalHints.length ? generalHints[0][1] : null
    }
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

function onBotMove() {
  game = makeMove(game, BOT_OPTIONS)
  rerenderUI()
}

function onImport() {
  const state = prompt('Exportovaný stav hry:') || ''
  game = deserialize(state)
  rerenderUI()
}

const winnableGamesProvider = new WinnableGamesProvider()
function createWinnableGame(drawnCards: 1 | 3): IGame {
  return createNewGame(
    {
      ...DEFAULT_NEW_GAME_OPTIONS,
      drawnCards,
    },
    winnableGamesProvider.getWinnableCardDeck(drawnCards),
  )
}
