import {IBotOptions, makeMoveOnDesk} from './Bot'
import {Color, DECK, ICard, Side} from './Card'
import {
  Desk,
  executeMove as executeMoveOnDesk,
  IDesk,
  isVictory as isDeskInVictoryState,
  isVictoryGuaranteed as isDeskInVictoryGuaranteedState,
} from './Desk'
import {Move} from './Move'
import {draw, IPile, Pile, shuffle, turnCard} from './Pile'
import {Tableau} from './Tableau'
import {lastItem} from './util'

type HistoryRecord = [IDesk, Move & IRecordTimestamp]

export interface IGame {
  readonly history: ReadonlyArray<HistoryRecord>
  readonly future: ReadonlyArray<HistoryRecord>
  readonly state: IDesk
  readonly rules: IGameRules
  readonly startTime: {
    readonly absoluteTimestamp: number,
    readonly logicalTimestamp: number,
  }
}

export interface IGameRules {
  readonly drawnCards: number
  readonly allowNonKingToEmptyPileTransfer: boolean
  // The number of piles in tableau is already represented by the tableau itself, since the number of piles is
  // immutable.
}

export interface INewGameRules extends IGameRules {
  readonly tableauPiles: number
}

export interface IBotSimulationOptions {
  maxMoves: number,
  simulationEndPredicate: (dest: IDesk) => boolean,
  maxSimulationTime: number,
}

export interface IRecordTimestamp {
  logicalTimestamp: number
}

export function createNewGame(gameRules: INewGameRules, cardDeck: null | ReadonlyArray<ICard> = null): IGame {
  if (!Number.isSafeInteger(gameRules.drawnCards) || gameRules.drawnCards <= 0) {
    throw new TypeError(
      `The drawnCards game rule must be a positive safe integer, ${gameRules.drawnCards} was provided`,
    )
  }
  if (!Number.isSafeInteger(gameRules.tableauPiles) || gameRules.tableauPiles <= 0) {
    throw new TypeError(
      `The tableauPiles game rule must be a positive safe integer, ${gameRules.tableauPiles} was provided`,
    )
  }

  let cardsToDeal = cardDeck ? new Pile(cardDeck) : shuffle(new Pile(DECK))
  for (const card of cardsToDeal.cards) {
    if (card.side === Side.FACE) {
      cardsToDeal = turnCard(cardsToDeal, card)
    }
  }

  const piles: IPile[] = []
  for (let i = 0; i < gameRules.tableauPiles; i++) {
    const [remainingCards, cardsForPile] = draw(cardsToDeal, i + 1)
    const currentPile = new Pile(cardsForPile)
    if (currentPile.cards.length) {
      piles.push(turnCard(currentPile, lastItem(currentPile.cards)))
    } else {
      piles.push(currentPile)
    }
    cardsToDeal = remainingCards
  }

  return {
    future: [],
    history: [],
    rules: {
      allowNonKingToEmptyPileTransfer: gameRules.allowNonKingToEmptyPileTransfer,
      drawnCards: gameRules.drawnCards,
    },
    startTime: {
      absoluteTimestamp: Date.now(),
      logicalTimestamp: performance.now(),
    },
    state: new Desk(
      cardsToDeal,
      new Pile([]),
      {
        [Color.DIAMONDS]: new Pile([]),
        [Color.HEARTHS]: new Pile([]),
        [Color.CLUBS]: new Pile([]),
        [Color.SPADES]: new Pile([]),
      },
      new Tableau(piles),
    ),
  }
}

export function createGameWithBotPredicate(
  rules: INewGameRules,
  botOptions: IBotOptions,
  {maxMoves, maxSimulationTime, simulationEndPredicate}: IBotSimulationOptions,
): [IGame, boolean] {
  const game = createNewGame(rules)
  let lastDeskState = game.state
  let satisfiesPredicate = false
  let moveCount = 0
  const startTimestamp = performance.now()
  do {
    const newDeskState = makeMoveOnDesk(lastDeskState, rules, botOptions)
    moveCount++
    if (newDeskState === lastDeskState || moveCount >= maxMoves || simulationEndPredicate(newDeskState)) {
      satisfiesPredicate = simulationEndPredicate(newDeskState)
      break
    }
    if (!(moveCount % 10) && performance.now() - startTimestamp >= maxSimulationTime) {
      satisfiesPredicate = simulationEndPredicate(newDeskState) // for code consistency, but will be false
      break
    }
    lastDeskState = newDeskState
  } while (true)
  return [game, satisfiesPredicate]
}

export function executeMove(game: IGame, move: Move): IGame {
  const updatedDesk = executeMoveOnDesk(game.state, game.rules, move)
  return createNextGameState(game, updatedDesk, move)
}

export function resetGame(game: IGame): IGame {
  return {
    ...game,
    future: [],
    history: [],
    startTime: {
      absoluteTimestamp: Date.now(),
      logicalTimestamp: performance.now(),
    },
    state: game.history.length ? game.history[0][0] : game.state,
  }
}

export function undoLastMove(game: IGame): IGame {
  if (!game.history.length) {
    return game
  }

  const newHistory = game.history.slice()
  const [moveToUndo] = newHistory.splice(-1)

  return {
    ...game,
    future: [moveToUndo, ...game.future],
    history: newHistory,
    state: moveToUndo[0],
  }
}

export function redoNextMove(game: IGame): IGame {
  if (!game.future.length) {
    return game
  }

  const [moveToRedo, ...newFuture] = game.future
  const newState = newFuture.length ?
    newFuture[0][0]
  :
    executeMove({...game, state: moveToRedo[0]}, moveToRedo[1]).state

  return {
    ...game,
    future: newFuture,
    history: game.history.concat([moveToRedo]),
    state: newState,
  }
}

export function isVictory({state}: IGame): boolean {
  return isDeskInVictoryState(state)
}

export function isVictoryGuaranteed({state}: IGame): boolean {
  return isDeskInVictoryGuaranteedState(state)
}

export function createNextGameState(game: IGame, nextState: IDesk, appliedMove: Move): IGame {
  return {
    ...game,
    future: [],
    history: game.history.concat([[
      game.state,
      {
        ...appliedMove,
        logicalTimestamp: performance.now(),
      },
    ]]),
    state: nextState,
  }
}
