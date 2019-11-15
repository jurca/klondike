import {Color, compareRank, ICard, Rank, Side} from './Card.js'
import {executeMove, IGame, Move, MoveType} from './Game.js'
import {draw} from './Pile.js'
import {ITableau} from './Tableau.js'

export enum HintGeneratorMode {
  CURRENT_STATE = 'HintGeneratorMode.CURRENT_STATE',
  WITH_FULL_STOCK = 'HintGeneratorMode.WITH_FULL_STOCK',
}

export enum MoveConfidence {
  ABSOLUTE = 'MoveConfidence.ABSOLUTE',
}

export function getMoveHints(game: IGame, mode: HintGeneratorMode): Array<[Move, ICard, MoveConfidence]> {
  const desk = game.state
  const stockPlayableCards: ICard[] = getStockPlayableCards(game, mode)
  const {foundation, tableau} = desk
  const topTableauCards = tableau.piles.filter((pile) => pile.cards.length).map((pile) => lastItem(pile.cards))
  const topFoundationCards = {
    [Color.DIAMONDS]: lastItemOrNull(foundation[Color.DIAMONDS].cards),
    [Color.HEARTHS]: lastItemOrNull(foundation[Color.HEARTHS].cards),
    [Color.CLUBS]: lastItemOrNull(foundation[Color.CLUBS].cards),
    [Color.SPADES]: lastItemOrNull(foundation[Color.SPADES].cards),
  }
  const moves: Array<[Move, ICard, MoveConfidence]> = []

  moves.push(...getMovesWithAbsoluteConfidence(game, stockPlayableCards, topTableauCards, topFoundationCards))

  return moves
}

function getMovesWithAbsoluteConfidence(
  game: IGame,
  stockPlayableCards: ICard[],
  topTableauCards: ICard[],
  topFoundationCards: {
    [Color.DIAMONDS]: null | ICard,
    [Color.HEARTHS]: null | ICard,
    [Color.CLUBS]: null | ICard,
    [Color.SPADES]: null | ICard,
  },
): Array<[Move, ICard, MoveConfidence]> {
  const {tableau} = game.state
  const moves: Array<[Move, ICard, MoveConfidence]> = []

  // Revealing a card
  const cardToReveal = topTableauCards.find((card) => card.side === Side.BACK)
  if (cardToReveal) {
    moves.push([
      {
        move: MoveType.REVEAL_TABLEAU_CARD,
        pileIndex: getPileIndex(tableau, cardToReveal),
      },
      cardToReveal,
      MoveConfidence.ABSOLUTE,
    ])
  }

  // Ace to foundation
  for (const card of stockPlayableCards) {
    if (card.rank === Rank.ACE) {
      moves.push([
        {
          move: MoveType.WASTE_TO_FOUNDATION,
        },
        card,
        MoveConfidence.ABSOLUTE,
      ])
    }
  }
  for (const card of topTableauCards) {
    if (card.side === Side.FACE && card.rank === Rank.ACE) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_FOUNDATION,
          pileIndex: getPileIndex(tableau, card),
        },
        card,
        MoveConfidence.ABSOLUTE,
      ])
    }
  }

  // Two to foundation
  for (const card of stockPlayableCards) {
    if (card.rank === Rank.TWO && topFoundationCards[card.color]?.rank === Rank.ACE) {
      moves.push([
        {
          move: MoveType.WASTE_TO_FOUNDATION,
        },
        card,
        MoveConfidence.ABSOLUTE,
      ])
    }
  }
  for (const card of topTableauCards) {
    if (card.side === Side.FACE && card.rank === Rank.TWO && topFoundationCards[card.color]?.rank === Rank.ACE) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_FOUNDATION,
          pileIndex: getPileIndex(tableau, card),
        },
        card,
        MoveConfidence.ABSOLUTE,
      ])
    }
  }

  // Finishing the game
  if (isVictoryGuaranteed(game)) {
    for (const card of topTableauCards) {
      const topFoundationCard = topFoundationCards[card.color]
      if (topFoundationCard && compareRank(card, topFoundationCard) === 1) {
        moves.push([
          {
            move: MoveType.TABLEAU_TO_FOUNDATION,
            pileIndex: getPileIndex(tableau, card),
          },
          card,
          MoveConfidence.ABSOLUTE,
        ])
      }
    }
  }

  return moves
}

function isVictoryGuaranteed({state: {stock, waste, tableau: {piles: tableauPiles}}}: IGame): boolean {
  return (
    !stock.cards.length &&
    !waste.cards.length &&
    tableauPiles.every((pile) => pile.cards.every((card) => card.side === Side.FACE))
  )
}

function getStockPlayableCards(game: IGame, mode: HintGeneratorMode): ICard[] {
  switch (mode) {
    case HintGeneratorMode.CURRENT_STATE:
      return game.state.waste.cards.length ? [draw(game.state.waste, 1)[1][0]] : []
    case HintGeneratorMode.WITH_FULL_STOCK: {
        if (!game.state.waste.cards.length && !game.state.stock.cards.length) {
          return []
        }
        let inspectedGame = game
        if (inspectedGame.state.waste.cards.length) {
          while (inspectedGame.state.stock.cards.length) {
            inspectedGame = executeMove(inspectedGame, {
              drawnCards: inspectedGame.rules.drawnCards,
              move: MoveType.DRAW_CARDS,
            })
          }
          inspectedGame = executeMove(inspectedGame, {
            move: MoveType.REDEAL,
          })
        }
        const cards: ICard[] = []
        while (inspectedGame.state.stock.cards.length) {
          inspectedGame = executeMove(inspectedGame, {
            drawnCards: inspectedGame.rules.drawnCards,
            move: MoveType.DRAW_CARDS,
          })
          cards.push(draw(inspectedGame.state.waste, 1)[1][0])
        }
        return cards
      }
    default:
      throw new TypeError(`Unknown hint generator mode: ${mode}`)
  }
}

function getPileIndex(tableau: ITableau, card: ICard): number {
  return tableau.piles.findIndex((pile) => lastItemOrNull(pile.cards) === card)
}

function lastItemOrNull<T>(array: readonly T[]): null | T {
  return array.length ? lastItem(array) : null
}

function lastItem<T>(array: readonly T[]): T {
  if (array.length) {
    return array[array.length - 1]
  }

  throw new Error('The provided array is empty')
}
