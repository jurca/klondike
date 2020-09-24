import {
  Color,
  ICard,
  isValidFoundationSequence,
  isValidTableauSequence,
  Rank,
  RANK_SEQUENCE,
  Side,
  turnOver,
} from './Card'
import {IGameRules} from './Game'
import {Move, MoveType} from './Move'
import {draw, IPile, Pile, placeCardOnTop, placePileOnTop} from './Pile'
import {addCardToPile, ITableau, movePilePart, removeTopCardFromPile, revealTopCard} from './Tableau'
import {lastItem} from './util'

export interface IDesk {
  readonly stock: IPile
  readonly waste: IPile
  readonly foundation: IFoundation
  readonly tableau: ITableau
}

interface IFoundation {
  readonly [Color.DIAMONDS]: IPile
  readonly [Color.HEARTHS]: IPile
  readonly [Color.CLUBS]: IPile
  readonly [Color.SPADES]: IPile
}

export class Desk implements IDesk {
  constructor(
    public readonly stock: IPile,
    public readonly waste: IPile,
    public readonly foundation: IFoundation,
    public readonly tableau: ITableau,
  ) {
  }
}

export function executeMove(desk: IDesk, rules: IGameRules, move: Move): IDesk {
  switch (move.move) {
    case MoveType.DRAW_CARDS:
      return drawCards(desk, rules, move.drawnCards)
    case MoveType.REDEAL:
      return redeal(desk)
    case MoveType.WASTE_TO_FOUNDATION:
      return moveTopWasteCardToFoundation(desk)
    case MoveType.WASTE_TO_TABLEAU:
      return moveTopWasteCardToTableau(desk, rules, desk.tableau.piles[move.pileIndex])
    case MoveType.TABLEAU_TO_FOUNDATION:
      return moveTopTableauPileCardToFoundation(desk, desk.tableau.piles[move.pileIndex])
    case MoveType.REVEAL_TABLEAU_CARD:
      return revealTopTableauPileCard(desk, desk.tableau.piles[move.pileIndex])
    case MoveType.FOUNDATION_TO_TABLEAU:
      return moveFoundationCardToTableauPile(desk, rules, move.color, desk.tableau.piles[move.pileIndex])
    case MoveType.TABLEAU_TO_TABLEAU:
      return moveTableauPilePart(
        desk,
        rules,
        desk.tableau.piles[move.sourcePileIndex],
        desk.tableau.piles[move.sourcePileIndex].cards[move.topMovedCardIndex],
        desk.tableau.piles[move.targetPileIndex],
      )
    case MoveType.PAUSE:
    case MoveType.RESUME:
      return desk
    default:
      throw new Error(`Unknown move type: ${move && (move as any).move}`)
  }
}

export function isVictory({stock, tableau, waste}: IDesk): boolean {
  return !stock.cards.length && !waste.cards.length && tableau.piles.every((pile) => !pile.cards.length)
}

export function isVictoryGuaranteed({stock, waste, tableau: {piles: tableauPiles}}: IDesk): boolean {
  return (
    !stock.cards.length &&
    !waste.cards.length &&
    tableauPiles.every((pile) => pile.cards.every((card) => card.side === Side.FACE))
  )
}

function drawCards(desk: IDesk, rules: IGameRules, numberOfCards: number) {
  if (numberOfCards !== rules.drawnCards) {
    throw new Error(
      `The number of cards to draw (${numberOfCards}) does not match the number in game rules (${rules.drawnCards})`,
    )
  }
  const [stockRemainder, drawnCards] = draw(desk.stock, numberOfCards)
  const newWaste = placePileOnTop(desk.waste, new Pile(drawnCards.map((card) => turnOver(card))))
  return new Desk(stockRemainder, newWaste, desk.foundation, desk.tableau)
}

function redeal(desk: IDesk) {
  if (desk.stock.cards.length) {
    throw new Error('Cannot redeal if there are cards in the stock')
  }

  return new Desk(
    new Pile(desk.waste.cards.map((card) => turnOver(card)).reverse()),
    new Pile([]),
    desk.foundation,
    desk.tableau,
  )
}

function moveTopWasteCardToFoundation(desk: IDesk): IDesk {
  if (!desk.waste.cards.length) {
    throw new Error('There is no card on the waste pile')
  }

  const [newWaste, [cardToPlace]] = draw(desk.waste, 1)
  const newFoundation = addCardToFoundation(desk.foundation, cardToPlace)

  return new Desk(
    desk.stock,
    newWaste,
    newFoundation,
    desk.tableau,
  )
}

function moveTopWasteCardToTableau(desk: IDesk, rules: IGameRules, tableauPile: IPile): IDesk {
  if (!desk.waste.cards.length) {
    throw new Error('There is no card on the waste pile')
  }

  const [newWaste, [cardToPlace]] = draw(desk.waste, 1)
  if (
    !tableauPile.cards.length &&
    !rules.allowNonKingToEmptyPileTransfer &&
    cardToPlace.rank !== Rank.KING
  ) {
    throw new Error(`The current game rules forbid placing any card other than a King on an empty tableau pile`)
  }
  if (
    tableauPile.cards.length &&
    !isValidTableauSequence(lastItem(tableauPile.cards), cardToPlace)
  ) {
    throw new Error(
      'The top waste card cannot be placed on top of the target tableau pile because it is not in rank sequence with ' +
      'the current top card of the target pile or it is of the same french deck color (red/black) as the current top ' +
      'card of the target pile',
    )
  }
  const newTableau = addCardToPile(desk.tableau, tableauPile, cardToPlace)

  return new Desk(
    desk.stock,
    newWaste,
    desk.foundation,
    newTableau,
  )
}

function moveTopTableauPileCardToFoundation(desk: IDesk, tableauPile: IPile): IDesk {
  const [newTableau, cardToPlace] = removeTopCardFromPile(desk.tableau, tableauPile)
  const newFoundation = addCardToFoundation(desk.foundation, cardToPlace)
  return new Desk(
    desk.stock,
    desk.waste,
    newFoundation,
    newTableau,
  )
}

function revealTopTableauPileCard(desk: IDesk, tableauPile: IPile): IDesk {
  const newTableau = revealTopCard(desk.tableau, tableauPile)
  return new Desk(
    desk.stock,
    desk.waste,
    desk.foundation,
    newTableau,
  )
}

function moveFoundationCardToTableauPile(desk: IDesk, rules: IGameRules, color: Color, tableauPile: IPile): IDesk {
  if (!desk.foundation[color].cards.length) {
    throw new Error(`The specified foundation (${color}) contains no cards`)
  }

  const [newFoundationPile, [cardToPlace]] = draw(desk.foundation[color], 1)
  if (
    !tableauPile.cards.length &&
    !rules.allowNonKingToEmptyPileTransfer &&
    cardToPlace.rank !== Rank.KING
  ) {
    throw new Error(`The current game rules forbid placing any card other than a King on an empty tableau pile`)
  }
  if (
    tableauPile.cards.length &&
    !isValidTableauSequence(lastItem(tableauPile.cards), cardToPlace)
  ) {
    throw new Error(
      'The top foundation card cannot be placed on top of the target tableau pile because it is not in rank sequence ' +
      'with the current top card of the target pile or it is of the same french deck color (red/black) as the top ' +
      'card of the target pile',
    )
  }
  const newTableau = addCardToPile(desk.tableau, tableauPile, cardToPlace)
  return new Desk(
    desk.stock,
    desk.waste,
    {
      ...desk.foundation,
      [cardToPlace.color]: newFoundationPile,
    },
    newTableau,
  )
}

function moveTableauPilePart(
  desk: IDesk,
  rules: IGameRules,
  sourcePile: IPile,
  topCardToMove: ICard,
  targetPile: IPile,
): IDesk {
  if (
    !targetPile.cards.length &&
    !rules.allowNonKingToEmptyPileTransfer &&
    topCardToMove.rank !== Rank.KING
  ) {
    throw new Error(`The current game rules forbid placing any card other than a King on an empty tableau pile`)
  }
  if (
    targetPile.cards.length &&
    !isValidTableauSequence(lastItem(targetPile.cards), topCardToMove)
  ) {
    throw new Error(
      'The top moved card cannot be placed on top of the target tableau pile because it is not in rank sequence with ' +
      'the current top card of the target pile or it is of the same french deck color (red/black) as the current top ' +
      'card of the target pile',
    )
  }
  const newTableau = movePilePart(desk.tableau, sourcePile, topCardToMove, targetPile)
  return new Desk(
    desk.stock,
    desk.waste,
    desk.foundation,
    newTableau,
  )
}

function addCardToFoundation(foundation: IFoundation, cardToPlace: ICard): IFoundation {
  const targetFoundationPile = foundation[cardToPlace.color]
  if (!targetFoundationPile.cards.length && cardToPlace.rank !== Rank.ACE) {
    throw new Error('Only the Ace can be placed at the bottom of a foundation')
  }
  if (
    targetFoundationPile.cards.length &&
    !isValidFoundationSequence(lastItem(targetFoundationPile.cards), cardToPlace)
  ) {
    const foundationTopCard = lastItem(targetFoundationPile.cards)
    throw new Error(
      `The provided card ${cardToPlace.rank} cannot be placed on top of ${foundationTopCard.rank}, expected a ` +
      `${RANK_SEQUENCE[RANK_SEQUENCE.indexOf(foundationTopCard.rank) + 1]} card.`,
    )
  }

  const newFoundationPile = placeCardOnTop(targetFoundationPile, cardToPlace)
  return {
    ...foundation,
    [cardToPlace.color]: newFoundationPile,
  }
}
