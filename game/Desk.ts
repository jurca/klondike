import {Color, compareRank, ICard, Rank, RANK_SEQUENCE, turnOver} from './Card.js'
import {draw, IPile, Pile, placeCardOnTop, placePileOnTop} from './Pile.js'
import {ITableau} from './Tableau.js'

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
    new Pile(desk.waste.cards.map((card) => turnOver(card))),
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
  const targetFoundationPile = desk.foundation[cardToPlace.color]
  const foundationTopCard = targetFoundationPile.cards[targetFoundationPile.cards.length - 1]
  if (!targetFoundationPile.cards.length && cardToPlace.rank !== Rank.ACE) {
    throw new Error('Only the Ace can be placed at the bottom of a foundation')
  }
  if (targetFoundationPile.cards.length && compareRank(foundationTopCard, cardToPlace) !== -1) {
    throw new Error(
      `The provided card ${cardToPlace.rank} cannot be placed on top of ${foundationTopCard.rank}, expected a ` +
      `${RANK_SEQUENCE[RANK_SEQUENCE.indexOf(foundationTopCard.rank) + 1]} card.`,
    )
  }

  const newFoundationPile = placeCardOnTop(targetFoundationPile, cardToPlace)
  const [newWaste] = draw(desk.waste, 1)

  return new Desk(
    desk.stock,
    newWaste,
    {
      ...desk.foundation,
      [cardToPlace.color]: newFoundationPile,
    },
    desk.tableau,
  )
}

export function moveTopWasteCardToTableau(desk: IDesk, tableauPile: IPile): IDesk {}

export function moveTopTableauPileCardToFoundation(desk: IDesk, tableauPile: IPile): IDesk {}

export function revealTopTableauPileCard(desk: IDesk, tableauPile: IPile): IDesk {}

export function moveFoundationCardToTableauPile(desk: IDesk, color: Color, tableauPile: IPile): IDesk {}

export function moveTableauPilePart(desk: IDesk, sourcePile: IPile, topCardToMove: ICard, targetPile: IPile): IDesk {}
