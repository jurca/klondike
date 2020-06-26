import * as React from 'react'
import {render} from 'react-dom'
import {makeMove} from '../../game/Bot'
import {ICard, Side} from '../../game/Card'
import {createNewGame, executeMove, IGame, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator'
import {deserialize, deserializeDeck} from '../../game/Serializer'
import {lastItem, lastItemOrNull} from '../../game/util'
import WinnableGamesGenerator from '../../game/WinnableGamesGenerator'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS, GAME_SIMULATION_OPTIONS} from './config'
import * as DeskSkins from './deskSkins'

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

  hint = null
  rerenderUI()
}

function onNewGame(drawnCards: 1 | 3): void {
  game = createGame(drawnCards)
  hint = null
  rerenderUI()
}

async function onNewWinnableGame(drawnCards: 1 | 3): Promise<void> {
  game = await createWinnableGame(drawnCards)
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

function createGame(drawnCards: 1 | 3): IGame {
  return createNewGame({
    ...DEFAULT_NEW_GAME_OPTIONS,
    drawnCards,
  })
}

const winnableGamesProviderWorker = new Worker('./winnableGamesProvider.js', {
  name: 'Winnable games generator',
})
let currentWinnableGameRequestResolver: null | ((game: IGame) => void) = null
winnableGamesProviderWorker.onmessage = (event) => {
  if (event.data && event.data.deck && event.data.drawnCards && currentWinnableGameRequestResolver) {
    const deck = deserializeDeck(event.data.deck)
    game = createNewGame(
      {
        ...DEFAULT_NEW_GAME_OPTIONS,
        drawnCards: event.data.drawnCards,
      },
      deck,
    )
    currentWinnableGameRequestResolver(game)
  }
}

function createWinnableGame(drawnCards: 1 | 3): Promise<IGame> {
  if (currentWinnableGameRequestResolver) {
    return Promise.reject(new Error('A winnable game is already being requested'))
  }

  return new Promise((resolve) => {
    currentWinnableGameRequestResolver = (generatedGame) => {
      currentWinnableGameRequestResolver = null
      resolve(generatedGame)
    }
    winnableGamesProviderWorker.postMessage({drawnCards})
  })
}

let winnableGamesGenerator: null | WinnableGamesGenerator = null
function onGenerateWinnableGames(drawnCards: 1 | 3): void {
  if (winnableGamesGenerator) {
    winnableGamesGenerator.stopGenerator()
    const {generatedDecks} = winnableGamesGenerator
    console.log(
      `Here are the generated decks:\n${JSON.stringify([...generatedDecks], null, 2).replace(/"/g, '\'')}`,
    )
    winnableGamesGenerator = null
    return
  }

  console.log(`Generating games for number drawn cards: ${drawnCards}`)
  winnableGamesGenerator = new WinnableGamesGenerator(
    {
      ...DEFAULT_NEW_GAME_OPTIONS,
      drawnCards,
    },
    BOT_OPTIONS,
    GAME_SIMULATION_OPTIONS,
    (task) => {
      const animationFrameRequestId = requestAnimationFrame(task)
      return {
        cancel() {
          cancelAnimationFrame(animationFrameRequestId)
        },
      }
    },
  )
  winnableGamesGenerator.onProgress = (lastWinnableDeck) => {
    console.log(lastWinnableDeck ? `Found winnable deck: ${lastWinnableDeck}` : 'The generated deck is not winnable')
  }
  winnableGamesGenerator.runGenerator()
}
