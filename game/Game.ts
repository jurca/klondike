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

export interface IGame {
  readonly history: ReadonlyArray<[IDesk, Move]>
  readonly state: IDesk
  readonly rules: IGameRules
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
    piles.push(turnCard(currentPile, currentPile.cards[currentPile.cards.length - 1]))
    cardsToDeal = remainingCards
  }

  return {
    history: [],
    rules: {
      drawnCards: gameRules.drawnCards,
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

function createNextGameState(game: IGame, nextState: IDesk, appliedMove: Move): IGame {
  return {
    ...game,
    history: game.history.concat([[game.state, appliedMove]]),
    state: nextState,
  }
}
