// see https://en.wikipedia.org/wiki/Standard_52-card_deck

export enum Color {
  SPADES = 'Color.SPADES', // or "pikes"
  HEARTHS = 'Color.HEARTHS',
  DIAMONDS = 'Color.DIAMONDS', // or "tiles"
  CLUBS = 'Color.CLUBS', // or "clovers"
}

export const RED_COLORS = [
  Color.HEARTHS,
  Color.DIAMONDS,
]

export enum Rank {
  ACE = 'Rank.ACE',
  TWO = 'Rank.TWO',
  THREE = 'Rank.THREE',
  FOUR = 'Rank.FOUR',
  FIVE = 'Rank.FIVE',
  SIX = 'Rank.SIX',
  SEVEN = 'Rank.SEVEN',
  EIGHT = 'Rank.EIGHT',
  NINE = 'Rank.NINE',
  TEN = 'Rank.TEN',
  JACK = 'Rank.JACK',
  QUEEN = 'Rank.QUEEN',
  KING = 'Rank.KING',
}

export const RANK_SEQUENCE = [
  Rank.ACE,
  Rank.TWO,
  Rank.THREE,
  Rank.FOUR,
  Rank.FIVE,
  Rank.SIX,
  Rank.SEVEN,
  Rank.EIGHT,
  Rank.NINE,
  Rank.TEN,
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
]

export class Card {
  constructor(public readonly color: Color, public readonly rank: Rank) {}

  // https://en.wikipedia.org/wiki/French_playing_cards
  public isSameColorInFrenchDeck(card: Card): boolean {
    const isThisCardRed = RED_COLORS.includes(this.color)
    const isOtherCardRed = RED_COLORS.includes(card.color)
    return isThisCardRed === isOtherCardRed
  }

  public compareRankTo(card: Card): number {
    const thisCardRank = RANK_SEQUENCE.indexOf(this.rank)
    const otherCardRank = RANK_SEQUENCE.indexOf(card.rank)
    return thisCardRank - otherCardRank
  }
}
