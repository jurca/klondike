import {Color, compareRank, ICard, isSameColorInFrenchDeck, Rank, Side} from './Card.js'
import {executeMove, IGame, Move, MoveType} from './Game.js'
import {draw} from './Pile.js'
import {ITableau} from './Tableau.js'

export enum HintGeneratorMode {
  CURRENT_STATE = 'HintGeneratorMode.CURRENT_STATE',
  WITH_FULL_STOCK = 'HintGeneratorMode.WITH_FULL_STOCK',
}

export enum MoveConfidence {
  ABSOLUTE = 'MoveConfidence.ABSOLUTE',
  VERY_HIGH = 'MoveConfidence.VERY_HIGH',
  HIGH = 'MoveConfidence.HIGH',
  MEDIUM = 'MoveConfidence.MEDIUM',
}

export const MOVE_CONFIDENCES = [
  MoveConfidence.ABSOLUTE,
  MoveConfidence.VERY_HIGH,
  MoveConfidence.HIGH,
  MoveConfidence.MEDIUM,
]

type MoveHint = [Move, ICard, MoveConfidence]

export function getMoveHints(game: IGame, mode: HintGeneratorMode): MoveHint[] {
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
  const moves: MoveHint[] = []

  moves.push(...getMovesWithAbsoluteConfidence(game, stockPlayableCards, topTableauCards, topFoundationCards))
  moves.push(...getMovesWithVeryHighConfidence(game, stockPlayableCards))
  moves.push(...getMovesWithHighConfidence(game, stockPlayableCards))
  moves.push(...getMovesWithMediumConfidence(game))

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
): MoveHint[] {
  const {tableau} = game.state
  const moves: MoveHint[] = []

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

  // Two to foundation
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

function getMovesWithVeryHighConfidence(
  game: IGame,
  stockPlayableCards: ICard[],
): MoveHint[] {
  const {tableau} = game.state
  const moves: MoveHint[] = []

  // Tableau to tableau transfer that allows revealing a card, source is not 5, 6, 7 or 8 and target pile is not empty
  const pilesFromLargestToSmallest = tableau.piles.slice().sort(
    (pile1, pile2) => pile2.cards.length - pile1.cards.length,
  )
  for (const pile of pilesFromLargestToSmallest) {
    const mostBottomRevealedCardIndex = pile.cards.findIndex((card) => card.side === Side.FACE)
    const sourceCard = pile.cards[mostBottomRevealedCardIndex]
    if (
      mostBottomRevealedCardIndex < 1 ||
      [Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT].includes(sourceCard.rank)
    ) {
      continue
    }
    const targetPileIndex = tableau.piles.findIndex((targetPile) => (
      targetPile.cards.length &&
      lastItem(targetPile.cards).side === Side.FACE &&
      !isSameColorInFrenchDeck(lastItem(targetPile.cards), sourceCard) &&
      compareRank(lastItem(targetPile.cards), sourceCard) === 1
    ))
    if (targetPileIndex > -1) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_TABLEAU,
          sourcePileIndex: getPileIndex(tableau, sourceCard),
          targetPileIndex,
          topMovedCardIndex: mostBottomRevealedCardIndex,
        },
        sourceCard,
        MoveConfidence.VERY_HIGH,
      ])
    }
  }

  // King to empty tableau pile transfer that allows transfer to the king's new pile that will reveal a new card
  const availableKings = tableau.piles
    // if the king is the top card in the pile, there is no point in making the transfer
    .filter((pile) => pile.cards.length > 1 && (pile.cards[0].side === Side.BACK || pile.cards[0].rank !== Rank.KING))
    .map((pile) => pile.cards.find((card) => card.rank === Rank.KING && card.side === Side.FACE))
    .filter((cardOrUndefined) => !!cardOrUndefined).map((card) => card as ICard)
    // tableau cards are preferred, so we'll put the stock cards at the end of the list
    .concat(stockPlayableCards.filter((card) => card.rank === Rank.KING))
  const emptyPileIndex = tableau.piles.findIndex((pile) => !pile.cards.length)
  if (availableKings.length && emptyPileIndex > -1) {
    for (const king of availableKings) {
      const kingSequenceEnd = stockPlayableCards.includes(king) ?
        king
      :
        lastItem(tableau.piles[getPileIndex(tableau, king)].cards)
      const isBeneficialTransferToKingSequencePossible = tableau.piles.find((pile) => {
        const visibleCards = pile.cards.filter((card) => card.side === Side.FACE)
        return (
          pile.cards.length > visibleCards.length &&
          visibleCards.length &&
          !isSameColorInFrenchDeck(kingSequenceEnd, visibleCards[0]) &&
          compareRank(kingSequenceEnd, visibleCards[0]) === 1
        )
      })
      if (isBeneficialTransferToKingSequencePossible) {
        const sourcePileIndex = getPileIndex(tableau, king)
        moves.push([
          stockPlayableCards.includes(king) ?
            {
              move: MoveType.WASTE_TO_TABLEAU,
              pileIndex: emptyPileIndex,
            }
          :
            {
              move: MoveType.TABLEAU_TO_TABLEAU,
              sourcePileIndex,
              targetPileIndex: emptyPileIndex,
              topMovedCardIndex: tableau.piles[sourcePileIndex].cards.indexOf(king),
            },
          king,
          MoveConfidence.VERY_HIGH,
        ])
      }
    }
  }

  return moves
}

function getMovesWithHighConfidence(game: IGame, stockPlayableCards: ICard[]): MoveHint[] {
  const moves: MoveHint[] = []
  const {state: {tableau}} = game

  // King to an empty tableau pile transfer that allows moving the largest built sequence to the king's pile
  const availableKings = tableau.piles
    // if the king is the top card in the pile, there is no point in making the transfer
    .filter((pile) => pile.cards.length > 1 && (pile.cards[0].side === Side.BACK || pile.cards[0].rank !== Rank.KING))
    .map((pile) => pile.cards.find((card) => card.rank === Rank.KING && card.side === Side.FACE))
    .filter((cardOrUndefined) => !!cardOrUndefined).map((card) => card as ICard)
    // tableau cards are preferred, so we'll put the stock cards at the end of the list
    .concat(stockPlayableCards.filter((card) => card.rank === Rank.KING))
  const emptyPileIndex = tableau.piles.findIndex((pile) => !pile.cards.length)
  if (availableKings.length && emptyPileIndex > -1) {
    for (const king of availableKings) {
      const kingSequenceEnd = stockPlayableCards.includes(king) ?
        king
      :
        lastItem(tableau.piles[getPileIndex(tableau, king)].cards)
      const largestSequences = tableau.piles
        .map((pile) => pile.cards.filter((card) => card.side === Side.FACE))
        .filter((pileCards) => pileCards.length)
        .map((pileCards, _, piles) => [pileCards, Math.max(...piles.map((pile) => pile.length))] as [ICard[], number])
        .filter(([pileCards, largestSequenceLength]) => pileCards.length === largestSequenceLength)
        .map(([pileCards]) => pileCards)
      const isBeneficialTransferToKingSequencePossible = largestSequences.find((cardSequence) =>
        !isSameColorInFrenchDeck(kingSequenceEnd, cardSequence[0]) &&
        compareRank(kingSequenceEnd, cardSequence[0]) === 1,
      )
      if (isBeneficialTransferToKingSequencePossible) {
        const sourcePileIndex = getPileIndex(tableau, king)
        moves.push([
          stockPlayableCards.includes(king) ?
            {
              move: MoveType.WASTE_TO_TABLEAU,
              pileIndex: emptyPileIndex,
            }
          :
            {
              move: MoveType.TABLEAU_TO_TABLEAU,
              sourcePileIndex,
              targetPileIndex: emptyPileIndex,
              topMovedCardIndex: tableau.piles[sourcePileIndex].cards.indexOf(king),
            },
          king,
          MoveConfidence.HIGH,
        ])
      }
    }
  }

  return moves
}

function getMovesWithMediumConfidence(game: IGame): MoveHint[] {
  const moves: MoveHint[] = []
  const {state: {tableau}} = game

  // Moving a 5, 6, 7 or 8 from a tableau pile that (probably) has not been touched yet and will reveal a card to
  // another tableau pile
  const candidateCards = tableau.piles
    .filter((pile) => pile.cards.length > 1)
    .filter((pile) => pile.cards.filter((card) => card.side === Side.FACE).length === 1)
    .map((pile) => lastItem(pile.cards))
    .filter((card) => [Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT].includes(card.rank))
  for (const candidateCard of candidateCards) {
    const sourcePileIndex = getPileIndex(tableau, candidateCard)
    const candidateTargets = tableau.piles.filter((pile) =>
      pile.cards.length &&
      lastItem(pile.cards).side === Side.FACE &&
      !isSameColorInFrenchDeck(candidateCard, lastItem(pile.cards)) &&
      compareRank(candidateCard, lastItem(pile.cards)) === -1,
    )
    for (const candidateTarget of candidateTargets) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_TABLEAU,
          sourcePileIndex,
          targetPileIndex: tableau.piles.indexOf(candidateTarget),
          topMovedCardIndex: tableau.piles[sourcePileIndex].cards.indexOf(candidateCard),
        },
        candidateCard,
        MoveConfidence.MEDIUM,
      ])
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
  return tableau.piles.findIndex((pile) => pile.cards.includes(card))
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
