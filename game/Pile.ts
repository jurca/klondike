import {ICard} from './Card.js'

export interface IPile {
  /**
   * The last card in the array is considered to be on the top - the cards in this pile are built from the bottom up.
   */
  readonly cards: ReadonlyArray<ICard>
}

export class Pile implements IPile {
  constructor(public readonly cards: ReadonlyArray<ICard>) {
  }
}

export function draw(pile: IPile, numberOfCards: number): [IPile, ReadonlyArray<ICard>] {
  if (!Number.isSafeInteger(numberOfCards) || numberOfCards <= 0) {
    throw new TypeError(`The cardCounts parameter must be a positive safe integer, ${numberOfCards} was provided`)
  }
  const drawnCards = pile.cards.slice(-numberOfCards).reverse()
  const pileRemainder = new Pile(pile.cards.slice(0, Math.max(pile.cards.length - numberOfCards, 0)))
  return [pileRemainder, drawnCards]
}

export function placeCardOnTop(pile: IPile, card: ICard): IPile {
  return new Pile(pile.cards.concat(card))
}

export function placePileOnTop(bottomPile: IPile, topPile: IPile): IPile {
  return new Pile(bottomPile.cards.concat(topPile.cards))
}
