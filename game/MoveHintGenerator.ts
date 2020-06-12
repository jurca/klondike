// This file is a prime candidate for refactoring. Some suggested helper functions to create and use:
// - getFoundationTop(game: IGame): IFoundationTop
// - getFoundationTopCards(game: IGame): ICard[]
// - getPlayablePiles(game: IGame): IPile[] // only piles where each pile contains at least one revealed card
// - ...and others

import {
  Color,
  compareRank,
  ICard,
  isValidFoundationSequence,
  isValidTableauSequence,
  Rank,
  Side,
  turnOver,
} from './Card'
import {IDesk, isVictoryGuaranteed} from './Desk'
import {IGameRules} from './Game'
import {Move, MoveType} from './Move'
import {ITableau} from './Tableau'
import {lastItem, lastItemOrNull} from './util'

export enum HintGeneratorMode {
  CURRENT_STATE = 'HintGeneratorMode.CURRENT_STATE',
  WITH_FULL_STOCK = 'HintGeneratorMode.WITH_FULL_STOCK',
}

export enum MoveConfidence {
  ABSOLUTE = 'MoveConfidence.ABSOLUTE',
  VERY_HIGH = 'MoveConfidence.VERY_HIGH',
  HIGH = 'MoveConfidence.HIGH',
  MEDIUM = 'MoveConfidence.MEDIUM',
  LOW = 'MoveConfidence.LOW',
  VERY_LOW = 'MoveConfidence.VERY_LOW',
  MINISCULE = 'MoveConfidence.MINISCULE',
}

export const MOVE_CONFIDENCES: ReadonlyArray<MoveConfidence> = [
  MoveConfidence.ABSOLUTE,
  MoveConfidence.VERY_HIGH,
  MoveConfidence.HIGH,
  MoveConfidence.MEDIUM,
  MoveConfidence.LOW,
  MoveConfidence.VERY_LOW,
  MoveConfidence.MINISCULE,
]

export type MoveHint = [Move, ICard, MoveConfidence]

interface IFoundationTop {
  [Color.DIAMONDS]: null | ICard
  [Color.HEARTHS]: null | ICard
  [Color.CLUBS]: null | ICard
  [Color.SPADES]: null | ICard
}

export function getMoveHints(desk: IDesk, rules: IGameRules, mode: HintGeneratorMode): MoveHint[] {
  const stockPlayableCards: ICard[] = getStockPlayableCards(desk, rules, mode)
  const {foundation, tableau} = desk
  const topTableauCards = tableau.piles.filter((pile) => pile.cards.length).map((pile) => lastItem(pile.cards))
  const topFoundationCards = {
    [Color.DIAMONDS]: lastItemOrNull(foundation[Color.DIAMONDS].cards),
    [Color.HEARTHS]: lastItemOrNull(foundation[Color.HEARTHS].cards),
    [Color.CLUBS]: lastItemOrNull(foundation[Color.CLUBS].cards),
    [Color.SPADES]: lastItemOrNull(foundation[Color.SPADES].cards),
  }
  const moves: MoveHint[] = []

  moves.push(...getMovesWithAbsoluteConfidence(desk, stockPlayableCards, topTableauCards, topFoundationCards))
  moves.push(...getMovesWithVeryHighConfidence(desk, stockPlayableCards))
  moves.push(...getMovesWithHighConfidence(desk, stockPlayableCards))
  moves.push(...getMovesWithMediumConfidence(desk))
  moves.push(...getMovesWithLowConfidence(desk))
  moves.push(...getMovesWithVeryLowConfidence(desk, stockPlayableCards, topFoundationCards, rules))
  moves.push(...getMovesWithMinisculeConfidence(desk, rules, stockPlayableCards, topFoundationCards))

  return filterFoundationToTableauHints(filterDuplicateHints(moves))
}

function filterFoundationToTableauHints(hints: MoveHint[]): MoveHint[] {
  const hintsWithoutTransfersFromFoundation = hints.filter(([move]) => move.move !== MoveType.FOUNDATION_TO_TABLEAU)
  if (hintsWithoutTransfersFromFoundation.length && hintsWithoutTransfersFromFoundation.length !== hints.length) {
    return hintsWithoutTransfersFromFoundation
  }

  return hints
}

function filterDuplicateHints(hints: MoveHint[]): MoveHint[] {
  const filteredHints: MoveHint[] = []

  for (const hint of hints) {
    const isHintAlreadyPresent = filteredHints.some((otherHint) =>
      areObjectsShallowlyEqual(hint[0], otherHint[0]) &&
      hint[1] === otherHint[1],
    )
    if (!isHintAlreadyPresent) {
      filteredHints.push(hint)
    }
  }

  return filteredHints

  function areObjectsShallowlyEqual<T>(object1: T, object2: T): boolean {
    const keys1 = Object.keys(object1) as Array<keyof T>
    const keys2 = Object.keys(object2)
    if (keys1.length !== keys2.length) {
      return false
    }

    return keys1.every((key) => object1[key] === object2[key])
  }
}

function getMovesWithAbsoluteConfidence(
  desk: IDesk,
  stockPlayableCards: ICard[],
  topTableauCards: ICard[],
  topFoundationCards: {
    [Color.DIAMONDS]: null | ICard,
    [Color.HEARTHS]: null | ICard,
    [Color.CLUBS]: null | ICard,
    [Color.SPADES]: null | ICard,
  },
): MoveHint[] {
  const {tableau} = desk
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
  if (isVictoryGuaranteed(desk)) {
    for (const card of topTableauCards) {
      const topFoundationCard = topFoundationCards[card.color]
      if (topFoundationCard && isValidFoundationSequence(topFoundationCard, card)) {
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
  desk: IDesk,
  stockPlayableCards: ICard[],
): MoveHint[] {
  const {tableau} = desk
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
      isValidTableauSequence(lastItem(targetPile.cards), sourceCard)
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
          isValidTableauSequence(kingSequenceEnd, visibleCards[0])
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

function getMovesWithHighConfidence(desk: IDesk, stockPlayableCards: ICard[]): MoveHint[] {
  const moves: MoveHint[] = []
  const {tableau} = desk

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
      const isBeneficialTransferToKingSequencePossible = largestSequences.find(
        (cardSequence) => isValidTableauSequence(kingSequenceEnd, cardSequence[0]),
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

function getMovesWithMediumConfidence(desk: IDesk): MoveHint[] {
  const moves: MoveHint[] = []
  const {tableau} = desk

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
      isValidTableauSequence(lastItem(pile.cards), candidateCard),
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

function getMovesWithLowConfidence(desk: IDesk): MoveHint[] {
  const moves: MoveHint[] = []
  const {tableau} = desk

  // Making a transfer from tableau pile to a non-empty tableau pile that will reveal a card
  const pilesOfVisibleCards = tableau.piles.map(
    (pile) => pile.cards.filter((card) => card.side === Side.FACE),
  ).filter(
    (pile) => pile.length,
  )
  const candidateSourcePiles = pilesOfVisibleCards.filter(
    (pile) => tableau.piles[getPileIndex(tableau, pile[0])].cards[0].side === Side.BACK,
  )
  for (const pile of candidateSourcePiles) {
    const topSourceCard = pile[0]
    for (const otherPile of pilesOfVisibleCards) {
      const bottomTargetCard = lastItem(otherPile)
      if (isValidTableauSequence(bottomTargetCard, topSourceCard)) {
        const sourcePileIndex = getPileIndex(tableau, topSourceCard)
        moves.push([
          {
            move: MoveType.TABLEAU_TO_TABLEAU,
            sourcePileIndex,
            targetPileIndex: getPileIndex(tableau, bottomTargetCard),
            topMovedCardIndex: tableau.piles[sourcePileIndex].cards.indexOf(topSourceCard),
          },
          topSourceCard,
          MoveConfidence.LOW,
        ])
      }
    }
  }

  // Tableau to tableau transfers that leaves the source pile empty, but there is a king that can be transferred there
  const pilesOfOnlyVisibleCards = tableau.piles.filter(
    (pile) => pile.cards.length && pile.cards.every((card) => card.side === Side.FACE),
  )
  const pilesWithKing = tableau.piles.filter(
    (pile) => pile.cards.some((card) => card.side === Side.FACE && card.rank === Rank.KING),
  )
  if (pilesWithKing.length) {
    for (const sourcePile of pilesOfOnlyVisibleCards) {
      const topSourceCard = sourcePile.cards[0]
      for (const otherPile of pilesOfVisibleCards) {
        const bottomTargetCard = lastItem(otherPile)
        if (isValidTableauSequence(bottomTargetCard, topSourceCard)) {
          const sourcePileIndex = getPileIndex(tableau, topSourceCard)
          moves.push([
            {
              move: MoveType.TABLEAU_TO_TABLEAU,
              sourcePileIndex,
              targetPileIndex: getPileIndex(tableau, bottomTargetCard),
              topMovedCardIndex: tableau.piles[sourcePileIndex].cards.indexOf(topSourceCard),
            },
            topSourceCard,
            MoveConfidence.LOW,
          ])
        }
      }
    }
  }

  return moves
}

function getMovesWithVeryLowConfidence(
  desk: IDesk,
  stockPlayableCards: ICard[],
  topFoundationCards: IFoundationTop,
  rules: IGameRules,
): MoveHint[] {
  const moves: MoveHint[] = []
  const {tableau} = desk
  const filteredTopFoundationCards: ICard[] = Object.values(topFoundationCards).filter((card) => card)

  // Foundation to tableau transfer that allows revealing a card by tableau to tableau transfer
  for (const foundationCard of filteredTopFoundationCards) {
    const isTherePileTransferableToCard = tableau.piles.some((pile) => {
      const highestVisibleCard = pile.cards.find((card) => card.side === Side.FACE)
      return (
        highestVisibleCard &&
        pile.cards[0] !== highestVisibleCard &&
        isValidTableauSequence(foundationCard, highestVisibleCard)
      )
    })
    if (!isTherePileTransferableToCard) {
      continue
    }

    const targetPileIndex = tableau.piles.findIndex((pile) => {
      const lastCard = lastItemOrNull(pile.cards)
      return lastCard && lastCard.side === Side.FACE && isValidTableauSequence(lastCard, foundationCard)
    })
    if (targetPileIndex > -1) {
      moves.push([
        {
          color: foundationCard.color,
          move: MoveType.FOUNDATION_TO_TABLEAU,
          pileIndex: targetPileIndex,
        },
        foundationCard,
        MoveConfidence.VERY_LOW,
      ])
    }
  }

  // Foundation to tableau transfer that allows a stock to tableau transfer
  for (const foundationCard of filteredTopFoundationCards) {
    const isThereMatchingStockCard = stockPlayableCards.some((card) => isValidTableauSequence(foundationCard, card))
    if (!isThereMatchingStockCard) {
      continue
    }

    const targetPileIndex = tableau.piles.findIndex((pile) => {
      const lastCard = lastItemOrNull(pile.cards)
      return lastCard && lastCard.side === Side.FACE && isValidTableauSequence(lastCard, foundationCard)
    })
    if (targetPileIndex > -1) {
      moves.push([
        {
          color: foundationCard.color,
          move: MoveType.FOUNDATION_TO_TABLEAU,
          pileIndex: targetPileIndex,
        },
        foundationCard,
        MoveConfidence.VERY_LOW,
      ])
    }
  }

  const emptyPileIndex = tableau.piles.findIndex((candidatePile) => !candidatePile.cards.length)

  // King to empty pile transfer that reveals a new card
  for (const pile of tableau.piles) {
    const kingIndex = pile.cards.findIndex((card) => card.side === Side.FACE && card.rank === Rank.KING)
    const king = pile.cards[kingIndex]
    if (king && kingIndex > 0 && pile.cards[kingIndex - 1].side === Side.BACK && emptyPileIndex > -1) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_TABLEAU,
          sourcePileIndex: getPileIndex(tableau, king),
          targetPileIndex: emptyPileIndex,
          topMovedCardIndex: kingIndex,
        },
        king,
        MoveConfidence.VERY_LOW,
      ])
    }
  }

  // Tableau to tableau transfers that leaves the source pile empty
  const pilesOfOnlyVisibleCards = tableau.piles.filter(
    (pile) => pile.cards.length && pile.cards.every((card) => card.side === Side.FACE),
  )
  const pilesWithVisibleCards = tableau.piles.filter(
    (pile) => pile.cards.some((card) => card.side === Side.FACE),
  )
  for (const sourcePile of pilesOfOnlyVisibleCards) {
    const topSourceCard = sourcePile.cards[0]
    for (const otherPile of pilesWithVisibleCards) {
      const bottomTargetCard = lastItem(otherPile.cards)
      if (isValidTableauSequence(bottomTargetCard, topSourceCard)) {
        const sourcePileIndex = getPileIndex(tableau, topSourceCard)
        moves.push([
          {
            move: MoveType.TABLEAU_TO_TABLEAU,
            sourcePileIndex,
            targetPileIndex: getPileIndex(tableau, bottomTargetCard),
            topMovedCardIndex: tableau.piles[sourcePileIndex].cards.indexOf(topSourceCard),
          },
          topSourceCard,
          MoveConfidence.VERY_LOW,
        ])
      }
    }
  }

  // Stock to tableau
  for (const card of stockPlayableCards) {
    for (const pile of tableau.piles) {
      const lastCard = lastItemOrNull(pile.cards)
      if (lastCard && lastCard.side === Side.FACE && isValidTableauSequence(lastCard, card)) {
        moves.push([
          {
            move: MoveType.WASTE_TO_TABLEAU,
            pileIndex: getPileIndex(tableau, lastCard),
          },
          card,
          MoveConfidence.VERY_LOW,
        ])
      }
    }
  }

  // Stock to foundation
  for (const stockCard of stockPlayableCards) {
    for (const foundationCard of filteredTopFoundationCards) {
      if (isValidFoundationSequence(foundationCard, stockCard)) {
        moves.push([
          {
            move: MoveType.WASTE_TO_FOUNDATION,
          },
          stockCard,
          MoveConfidence.VERY_LOW,
        ])
      }
    }
  }

  // Card from waste/stock to an empty tableau pile transfer
  if (emptyPileIndex > -1) {
    const usableCards = rules.allowNonKingToEmptyPileTransfer ?
      stockPlayableCards
    :
      stockPlayableCards.filter((card) => card.rank === Rank.KING)
    for (const card of usableCards) {
      moves.push([
        {
          move: MoveType.WASTE_TO_TABLEAU,
          pileIndex: emptyPileIndex,
        },
        card,
        MoveConfidence.VERY_LOW,
      ])
    }
  }

  return moves
}

function getMovesWithMinisculeConfidence(
  desk: IDesk,
  rules: IGameRules,
  stockPlayableCards: ICard[],
  topFoundationCards: IFoundationTop,
): MoveHint[] {
  const moves: MoveHint[] = []
  const {tableau} = desk

  // Tableau to foundation transfer that allows a transfer revealing card or reveal a card
  for (const pile of tableau.piles) {
    const lastCard = lastItemOrNull(pile.cards)
    if (!lastCard || lastCard.side === Side.BACK) {
      continue
    }

    const foundationCard = topFoundationCards[lastCard.color]
    if (!foundationCard || !isValidFoundationSequence(foundationCard, lastCard)) {
      continue
    }

    const nextToLastCard = pile.cards.slice(-2)[0]

    // Will the transfer reveal a card?
    if (pile.cards.length > 1 && nextToLastCard.side === Side.BACK) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_FOUNDATION,
          pileIndex: getPileIndex(tableau, lastCard),
        },
        lastCard,
        MoveConfidence.MINISCULE,
      ])
      continue
    }

    // Will the transfer allow a transfer that will reveal a card?
    for (const otherPile of tableau.piles) {
      const highestVisibleCard = otherPile.cards.find((card) => card.side === Side.FACE)
      if (
        highestVisibleCard &&
        otherPile.cards[0] !== highestVisibleCard &&
        isValidTableauSequence(nextToLastCard, highestVisibleCard)
      ) {
        moves.push([
          {
            move: MoveType.TABLEAU_TO_FOUNDATION,
            pileIndex: getPileIndex(tableau, lastCard),
          },
          lastCard,
          MoveConfidence.MINISCULE,
        ])
      }
    }
  }

  // Tableau to foundation transfer that that allows a waste to tableau or foundation transfer
  for (const pile of tableau.piles) {
    const lastCard = lastItemOrNull(pile.cards)
    if (!lastCard || lastCard.side === Side.BACK) {
      continue
    }

    const foundationCard = topFoundationCards[lastCard.color]
    if (!foundationCard || !isValidFoundationSequence(foundationCard, lastCard)) {
      continue
    }

    // Will the transfer allow a waste to foundation transfer?
    for (const stockCard of stockPlayableCards) {
      if (isValidFoundationSequence(lastCard, stockCard)) {
        moves.push([
          {
            move: MoveType.TABLEAU_TO_FOUNDATION,
            pileIndex: getPileIndex(tableau, lastCard),
          },
          lastCard,
          MoveConfidence.MINISCULE,
        ])
      }
    }

    // Will the transfer allow a waste to tableau transfer?
    if (pile.cards.length <= 1) {
      continue
    }
    const nextToLastCard = pile.cards.slice(-2)[0]
    if (nextToLastCard.side === Side.FACE) {
      for (const stockCard of stockPlayableCards) {
        if (isValidTableauSequence(nextToLastCard, stockCard)) {
          moves.push([
            {
              move: MoveType.TABLEAU_TO_FOUNDATION,
              pileIndex: getPileIndex(tableau, lastCard),
            },
            lastCard,
            MoveConfidence.MINISCULE,
          ])
        }
      }
    }
  }

  const emptyPileIndex = tableau.piles.findIndex((pile) => !pile.cards.length)

  // Stock to empty pile transfer, prefer higher-ranking cards - applies only if allowed by game rules
  if (rules.allowNonKingToEmptyPileTransfer && emptyPileIndex > -1) {
    for (const card of stockPlayableCards.slice().sort((card1, card2) => compareRank(card2, card1))) {
      moves.push([
        {
          move: MoveType.WASTE_TO_TABLEAU,
          pileIndex: emptyPileIndex,
        },
        card,
        MoveConfidence.MINISCULE,
      ])
    }
  }

  // Tableau to empty pile transfer that allows revealing a card - applies only if allowed by game rules
  if (rules.allowNonKingToEmptyPileTransfer && emptyPileIndex > -1) {
    const sourcePiles = tableau.piles.filter(
      (pile) => pile.cards.length && pile.cards[0].side === Side.BACK && lastItem(pile.cards).side === Side.FACE,
    ).sort(
      (pile1, pile2) => (
        pile2.cards.filter((card) => card.side === Side.FACE).length -
        pile1.cards.filter((card) => card.side === Side.FACE).length
      ),
    )

    for (const pile of sourcePiles) {
      const topCardIndex = pile.cards.findIndex((card) => card.side === Side.FACE)
      moves.push([
        {
          move: MoveType.TABLEAU_TO_TABLEAU,
          sourcePileIndex: getPileIndex(tableau, pile.cards[topCardIndex]),
          targetPileIndex: emptyPileIndex,
          topMovedCardIndex: topCardIndex,
        },
        pile.cards[topCardIndex],
        MoveConfidence.MINISCULE,
      ])
    }
  }

  // Tableau to a non-empty foundation pile (Ace to empty foundation is already covered with absolute confidence)
  for (const pile of tableau.piles) {
    if (!pile.cards.length) {
      continue
    }

    const lastCard = lastItem(pile.cards)
    const foundationCard = topFoundationCards[lastCard.color]
    if (foundationCard && isValidFoundationSequence(foundationCard, lastCard)) {
      moves.push([
        {
          move: MoveType.TABLEAU_TO_FOUNDATION,
          pileIndex: getPileIndex(tableau, lastCard),
        },
        lastCard,
        MoveConfidence.MINISCULE,
      ])
    }
  }

  return moves
}

function getStockPlayableCards(deskState: IDesk, rules: IGameRules, mode: HintGeneratorMode): ICard[] {
  switch (mode) {
    case HintGeneratorMode.CURRENT_STATE:
      return deskState.waste.cards.length ? [lastItem(deskState.waste.cards)] : []
    case HintGeneratorMode.WITH_FULL_STOCK: {
        if (!deskState.waste.cards.length && !deskState.stock.cards.length) {
          return []
        }

        const stock = deskState.stock.cards.slice()
        const waste = deskState.waste.cards.slice()
        const cards = new Set<ICard>()
        if (waste.length) {
          cards.add(lastItem(waste))
          // Iterate through the remaining stock
          for (let cardIndex = stock.length - 1; cardIndex >= 0; cardIndex -= rules.drawnCards) {
            cards.add(turnOver(stock[cardIndex]))
          }
        }
        stock.push(...waste.reverse().map(turnOver)) // redeal
        // Iterate through the stock
        for (let cardIndex = stock.length - rules.drawnCards; cardIndex >= 0; cardIndex -= rules.drawnCards) {
          cards.add(turnOver(stock[cardIndex]))
        }
        return [...cards]
      }
    default:
      throw new TypeError(`Unknown hint generator mode: ${mode}`)
  }
}

function getPileIndex(tableau: ITableau, card: ICard): number {
  return tableau.piles.findIndex((pile) => pile.cards.includes(card))
}
