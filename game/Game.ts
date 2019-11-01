import {Color, DECK, ICard, Side} from './Card.js'
import {
  Desk,
  drawCards,
  IDesk,
  moveFoundationCardToTableauPile,
  moveTableauPilePart,
  moveTopTableauPileCardToFoundation,
  moveTopWasteCardToFoundation,
  moveTopWasteCardToTableau,
  redeal,
  revealTopTableauPileCard,
} from './Desk.js'
import {draw, IPile, Pile, shuffle, turnCard} from './Pile.js'
import {Tableau} from './Tableau.js'

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

interface IGameRules {
  readonly drawnCards: number,
  // The number of piles in tableau is already represented by the tableau itself, since the number of piles is
  // immutable.
}

interface INewGameRules extends IGameRules {
  readonly tableauPiles: number
}

export enum MoveType {
  DRAW_CARDS = 'MoveType.DRAW_CARDS',
  REDEAL = 'MoveType.REDEAL',
  WASTE_TO_FOUNDATION = 'MoveType.WASTE_TO_FOUNDATION',
  WASTE_TO_TABLEAU = 'MoveType.WASTE_TO_TABLEAU',
  TABLEAU_TO_FOUNDATION = 'MoveType.TABLEAU_TO_FOUNDATION',
  REVEAL_TABLEAU_CARD = 'MoveType.REVEAL_TABLEAU_CARD',
  FOUNDATION_TO_TABLEAU = 'MoveType.FOUNDATION_TO_TABLEAU',
  TABLEAU_TO_TABLEAU = 'MoveType.TABLEAU_TO_TABLEAU',
}

interface IMove {
  move: MoveType
}

interface IRecordTimestamp extends IMove {
  logicalTimestamp: number
}

interface IDrawCardsMove extends IMove {
  move: MoveType.DRAW_CARDS
  drawnCards: number
}

interface IRedealMove extends IMove {
  move: MoveType.REDEAL
}

interface IWasteToFoundationMove extends IMove {
  move: MoveType.WASTE_TO_FOUNDATION
}

interface IWasteToTableauMove extends IMove {
  move: MoveType.WASTE_TO_TABLEAU
  pileIndex: number
}

interface ITableauToFoundationMove extends IMove {
  move: MoveType.TABLEAU_TO_FOUNDATION
  pileIndex: number
}

interface IRevealTableauCardMove extends IMove {
  move: MoveType.REVEAL_TABLEAU_CARD
  pileIndex: number
}

interface IFoundationToTableauMove extends IMove {
  move: MoveType.FOUNDATION_TO_TABLEAU
  color: Color
  pileIndex: number
}

interface ITableauToTableauMove extends IMove {
  move: MoveType.TABLEAU_TO_TABLEAU
  sourcePileIndex: number
  topMovedCardIndex: number
  targetPileIndex: number
}

export type Move =
  IDrawCardsMove |
  IRedealMove |
  IWasteToFoundationMove |
  IWasteToTableauMove |
  ITableauToFoundationMove |
  IRevealTableauCardMove |
  IFoundationToTableauMove |
  ITableauToTableauMove

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
      piles.push(turnCard(currentPile, currentPile.cards[currentPile.cards.length - 1]))
    } else {
      piles.push(currentPile)
    }
    cardsToDeal = remainingCards
  }

  return {
    future: [],
    history: [],
    rules: {
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

export function executeMove(game: IGame, move: Move): IGame {
  const {state} = game
  switch (move.move) {
    case MoveType.DRAW_CARDS:
      return createGameState(drawCards(state, move.drawnCards))
    case MoveType.REDEAL:
      return createGameState(redeal(state))
    case MoveType.WASTE_TO_FOUNDATION:
      return createGameState(moveTopWasteCardToFoundation(state))
    case MoveType.WASTE_TO_TABLEAU:
      return createGameState(moveTopWasteCardToTableau(state, state.tableau.piles[move.pileIndex]))
    case MoveType.TABLEAU_TO_FOUNDATION:
      return createGameState(moveTopTableauPileCardToFoundation(state, state.tableau.piles[move.pileIndex]))
    case MoveType.REVEAL_TABLEAU_CARD:
      return createGameState(revealTopTableauPileCard(state, state.tableau.piles[move.pileIndex]))
    case MoveType.FOUNDATION_TO_TABLEAU:
      return createGameState(moveFoundationCardToTableauPile(state, move.color, state.tableau.piles[move.pileIndex]))
    case MoveType.TABLEAU_TO_TABLEAU:
      return createGameState(moveTableauPilePart(
        state,
        state.tableau.piles[move.sourcePileIndex],
        state.tableau.piles[move.sourcePileIndex].cards[move.topMovedCardIndex],
        state.tableau.piles[move.targetPileIndex],
      ))
  }

  function createGameState(nextState: IDesk): IGame {
    return createNextGameState(game, nextState, move)
  }
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

function createNextGameState(game: IGame, nextState: IDesk, appliedMove: Move): IGame {
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
