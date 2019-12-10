import {
  Color,
  ICard,
  isValidFoundationSequence,
  isValidTableauSequence,
  Rank,
  RANK_SEQUENCE,
  turnOver,
} from './Card.js'
import {draw, IPile, Pile, placeCardOnTop, placePileOnTop} from './Pile.js'
import {addCardToPile, ITableau, movePilePart, removeTopCardFromPile, revealTopCard} from './Tableau.js'

export interface IDesk {
  readonly stock: IPile
  readonly waste: IPile
  readonly foundation: IFoundation
  readonly tableau: ITableau
}

interface IFoundation {
  [Color.DIAMONDS]: IPile
  [Color.HEARTHS]: IPile
  [Color.CLUBS]: IPile
  [Color.SPADES]: IPile
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

export function drawCards(desk: IDesk, numberOfCards: number) {
  const [stockRemainder, drawnCards] = draw(desk.stock, numberOfCards)
  const newWaste = placePileOnTop(desk.waste, new Pile(drawnCards.map((card) => turnOver(card))))
  return new Desk(stockRemainder, newWaste, desk.foundation, desk.tableau)
}

export function redeal(desk: IDesk) {
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

export function moveTopWasteCardToFoundation(desk: IDesk): IDesk {
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

export function moveTopWasteCardToTableau(desk: IDesk, tableauPile: IPile): IDesk {
  if (!desk.waste.cards.length) {
    throw new Error('There is no card on the waste pile')
  }

  const [newWaste, [cardToPlace]] = draw(desk.waste, 1)
  if (
    tableauPile.cards.length &&
    !isValidTableauSequence(tableauPile.cards[tableauPile.cards.length - 1], cardToPlace)
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

export function moveTopTableauPileCardToFoundation(desk: IDesk, tableauPile: IPile): IDesk {
  const [newTableau, cardToPlace] = removeTopCardFromPile(desk.tableau, tableauPile)
  const newFoundation = addCardToFoundation(desk.foundation, cardToPlace)
  return new Desk(
    desk.stock,
    desk.waste,
    newFoundation,
    newTableau,
  )
}

export function revealTopTableauPileCard(desk: IDesk, tableauPile: IPile): IDesk {
  const newTableau = revealTopCard(desk.tableau, tableauPile)
  return new Desk(
    desk.stock,
    desk.waste,
    desk.foundation,
    newTableau,
  )
}

export function moveFoundationCardToTableauPile(desk: IDesk, color: Color, tableauPile: IPile): IDesk {
  if (!desk.foundation[color].cards.length) {
    throw new Error(`The specified foundation (${color}) contains no cards`)
  }

  const [newFoundationPile, [cardToPlace]] = draw(desk.foundation[color], 1)
  if (
    tableauPile.cards.length &&
    !isValidTableauSequence(tableauPile.cards[tableauPile.cards.length - 1], cardToPlace)
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

export function moveTableauPilePart(desk: IDesk, sourcePile: IPile, topCardToMove: ICard, targetPile: IPile): IDesk {
  if (
    targetPile.cards.length &&
    !isValidTableauSequence(targetPile.cards[targetPile.cards.length - 1], topCardToMove)
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
  const foundationTopCard = targetFoundationPile.cards[targetFoundationPile.cards.length - 1]
  if (!targetFoundationPile.cards.length && cardToPlace.rank !== Rank.ACE) {
    throw new Error('Only the Ace can be placed at the bottom of a foundation')
  }
  if (targetFoundationPile.cards.length && !isValidFoundationSequence(foundationTopCard, cardToPlace)) {
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
