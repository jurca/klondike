import * as React from 'react'
import {render} from 'react-dom'
import {defaultStateRankingHeuristic, IBotOptions, makeMove} from '../../game/Bot'
import {equals as cardsArEqual, ICard, Side} from '../../game/Card'
import {isVictoryGuaranteed} from '../../game/Desk'
import {createGameWithBotPredicate, createNewGame, executeMove, IGame, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode, MoveConfidence} from '../../game/MoveHintGenerator'
import {deserialize, serializeDeckFromDesk} from '../../game/Serializer'
import {lastItem, lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import * as DeskSkins from './deskSkins'

const ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER = false
const TABLEAU_PILES_COUNT = 7
const BOT_OPTIONS: IBotOptions = {
  lookAheadMoves: 2,
  maxConsideredConfidenceLevels: 3,
  minAutoAcceptConfidence: MoveConfidence.HIGH,
  stateRankingHeuristic: defaultStateRankingHeuristic,
}
const MAX_BOT_SIMULATION_MOVES = 300
const MAX_BOT_SIMULATION_TIME = 20_000 // milliseconds

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
      onNewWinnableGame={onNewWinnableGame}
      onShowHint={onShowHint}
      onDeskStyleChange={onDeskStyleChange}
      onCardStyleChange={onCardBackStyleChange}
      onBotMove={onBotMove}
      onImport={onImport}
      onGenerateWinnableGames={onGenerateWinnableGames}
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

function onBotMove() {
  game = makeMove(game, BOT_OPTIONS)
  rerenderUI()
}

function onImport() {
  const state = prompt('Exportovaný stav hry:') || ''
  game = deserialize(state)
  console.log(serializeDeckFromDesk(game.state))
  rerenderUI()
}

function createGame(drawnCards: 1 | 3): IGame {
  return createNewGame({
    allowNonKingToEmptyPileTransfer: ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER,
    drawnCards,
    tableauPiles: TABLEAU_PILES_COUNT,
  })
}

function createWinnableGame(drawnCards: 1 | 3): IGame {
  const [generatedGame, isWinnable] = createGameWithBotPredicate(
    {
      allowNonKingToEmptyPileTransfer: ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER,
      drawnCards,
      tableauPiles: TABLEAU_PILES_COUNT,
    },
    BOT_OPTIONS,
    {
      maxMoves: MAX_BOT_SIMULATION_MOVES,
      maxSimulationTime: MAX_BOT_SIMULATION_TIME,
      simulationEndPredicate: isVictoryGuaranteed,
    },
  )

  console.log(isWinnable)

  return generatedGame
}

let winnableGameGeneratorRafId: null | number = null
const knownWinnableDecks = new Set<string>()
function onGenerateWinnableGames(drawnCards: 1 | 3): void {
  if (winnableGameGeneratorRafId) {
    cancelAnimationFrame(winnableGameGeneratorRafId)
    winnableGameGeneratorRafId = null
    console.log(
      `Here are the generated decks:\n${JSON.stringify([...knownWinnableDecks], null, 2).replace(/"/g, '\'')}`,
    )
    knownWinnableDecks.clear()
    return
  }

  console.log(`Generating games for number drawn cards: ${drawnCards}`)
  winnableGameGeneratorRafId = requestAnimationFrame(tryAntoherGame)

  function tryAntoherGame() {
    const [generatedGame, isWinnable] = createGameWithBotPredicate(
      {
        allowNonKingToEmptyPileTransfer: ALLOW_NON_KING_TO_EMPTY_PILE_TRANSFER,
        drawnCards,
        tableauPiles: TABLEAU_PILES_COUNT,
      },
      BOT_OPTIONS,
      {
        maxMoves: MAX_BOT_SIMULATION_MOVES,
        maxSimulationTime: MAX_BOT_SIMULATION_TIME,
        simulationEndPredicate: isVictoryGuaranteed,
      },
    )

    if (isWinnable) {
      const deck = serializeDeckFromDesk(generatedGame.state)
      if (!knownWinnableDecks.has(deck)) {
        knownWinnableDecks.add(deck)
        console.log(`Found winnable deck: ${deck}`)
      } else {
        console.log('Generated a winnable deck again')
      }
    } else {
      console.log('The generated deck is not winnable')
    }

    winnableGameGeneratorRafId = requestAnimationFrame(tryAntoherGame)
  }
}
