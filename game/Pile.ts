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

export function replaceCard(pile: IPile, cardToReplace: ICard, newCard: ICard): IPile {
  const index = pile.cards.indexOf(cardToReplace)
  if (index > -1) {
    const patchedCards = pile.cards.slice()
    patchedCards.splice(index, 1, newCard)
    return new Pile(patchedCards)
  }
  return pile
}

export function shuffle(pile: IPile): IPile {
  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  const cards = pile.cards.slice()
  for (let currentCardIndex = 0; currentCardIndex < cards.length - 1; currentCardIndex++) {
    const randomCardIndex = Math.floor(Math.random() * (cards.length - currentCardIndex)) + currentCardIndex
    const currentCard = cards[currentCardIndex]
    cards[currentCardIndex] = cards[randomCardIndex]
    cards[randomCardIndex] = currentCard
  }
  return new Pile(cards)
}
