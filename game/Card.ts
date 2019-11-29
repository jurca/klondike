// see https://en.wikipedia.org/wiki/Standard_52-card_deck

export enum Color {
  SPADES = 'Color.SPADES', // or "pikes"
  HEARTHS = 'Color.HEARTHS',
  DIAMONDS = 'Color.DIAMONDS', // or "tiles"
  CLUBS = 'Color.CLUBS', // or "clovers"
}

export const RED_COLORS: ReadonlyArray<Color> = [
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

export const RANK_SEQUENCE: ReadonlyArray<Rank> = [
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

export enum Side {
  FACE = 'Side.FACE',
  BACK = 'Side.BACK',
}

export interface ICard {
  readonly color: Color
  readonly rank: Rank
  readonly side: Side
}

export class Card implements ICard {
  constructor(
    public readonly color: Color,
    public readonly rank: Rank,
    public readonly side: Side,
  ) {
  }
}

export const DECK: ReadonlyArray<ICard> = ([] as ICard[]).concat(...Object.values(Color).map(
  (color: Color) => RANK_SEQUENCE.map((rank: Rank) => new Card(color, rank, Side.BACK)),
))

// https://en.wikipedia.org/wiki/French_playing_cards
export function isSameColorInFrenchDeck(card1: ICard, card2: ICard): boolean {
  const isCard1Red = RED_COLORS.includes(card1.color)
  const isCard2Red = RED_COLORS.includes(card2.color)
  return isCard1Red === isCard2Red
}

export function compareRank(card1: ICard, card2: ICard): number {
  const card1NumericRank = RANK_SEQUENCE.indexOf(card1.rank)
  const card2NumericRank = RANK_SEQUENCE.indexOf(card2.rank)
  return card1NumericRank - card2NumericRank
}

export function turnOver(card: Card): ICard {
  return new Card(card.color, card.rank, card.side === Side.FACE ? Side.BACK : Side.FACE)
}
