import {Color, DECK, ICard} from './Card.js'
import {IGame, IRecordTimestamp, Move, MoveType} from './Game.js'

const SERIALIZER_VERSION = 1
const NUM_RADIX = 36
const EPOCH_START = 1572617642000

export function serialize(game: IGame): string {
  if (game.rules.drawnCards > NUM_RADIX) {
    throw new RangeError(
      `The drawnCards rule must a safe positive integer no larger than ${NUM_RADIX}, ${game.rules.drawnCards} was ` +
      'provided',
    )
  }
  if (game.state.tableau.piles.length > parseInt('zz', NUM_RADIX)) {
    throw new RangeError(
      `The number of tableau piles must be a safe positive integer no larger than ${parseInt('zz', NUM_RADIX)}, ` +
      `${game.state.tableau.piles.length} was provided`,
    )
  }

  const initialState = game.history.length ? game.history[0][0] : game.state
  const cardsDeck = [
    ...initialState.tableau.piles.map((pile) => pile.cards.slice().reverse()).flat(),
    ...initialState.stock.cards,
  ]
  const serializedData = [
    SERIALIZER_VERSION,
    game.rules.drawnCards.toString(NUM_RADIX),
    game.state.tableau.piles.length.toString(NUM_RADIX).padStart(2, '0'),
    cardsDeck.slice(0, -1).map(serializeCard).join(''),
    Math.floor((game.startTime.absoluteTimestamp - EPOCH_START) / 1000).toString(NUM_RADIX),
    ',',
    Math.floor(game.startTime.logicalTimestamp).toString(NUM_RADIX),
    ';',
    game.history.length.toString(NUM_RADIX),
    ':',
    serializeHistory(game.history.concat(game.future), game.startTime.logicalTimestamp),
  ]

  return serializedData.join('')
}

function serializeHistory(
  history: ReadonlyArray<[unknown, Move & IRecordTimestamp]>,
  startingLogicalTimestamp: number,
): string {
  return history.map(
    ([, move], index) => serializeMove(move, index ? history[index - 1][1].logicalTimestamp : startingLogicalTimestamp),
  ).join('')
}

function serializeMove(move: Move & IRecordTimestamp, previousMoveTimestamp: number) {
  return [
    Math.floor(move.logicalTimestamp - previousMoveTimestamp).toString(NUM_RADIX),
    ',;:-=+*!'.charAt(MOVE_TYPES.indexOf(move.move)),
    serializeMoveData(),
  ].join('')

  function serializeMoveData(): string {
    switch (move.move) {
      case MoveType.DRAW_CARDS:
        return `${move.drawnCards.toString(NUM_RADIX)}.`
      case MoveType.WASTE_TO_TABLEAU:
      case MoveType.TABLEAU_TO_FOUNDATION:
      case MoveType.REVEAL_TABLEAU_CARD:
        return `${move.pileIndex.toString(NUM_RADIX).padStart(2, '0')}`
      case MoveType.FOUNDATION_TO_TABLEAU:
        return `${move.pileIndex.toString(NUM_RADIX)}${',;:-'.charAt(COLORS.indexOf(move.color))}`
      case MoveType.TABLEAU_TO_TABLEAU:
        return [move.sourcePileIndex, move.topMovedCardIndex, move.targetPileIndex].map(
          (num: number) => num.toString(NUM_RADIX).padStart(2, '0'),
        ).join('')
      case MoveType.REDEAL:
      case MoveType.WASTE_TO_FOUNDATION:
        return ''
      default:
        throw new TypeError(`Unknown move type: ${(move as any).move}`)
    }
  }
}

function serializeCard(card: ICard): string {
  const keys = (Object.keys(card) as Array<keyof ICard>).filter((key) => key !== 'side')
  const cardIndex = UNSERIALIZED_CARDS.findIndex(
    (otherCard) => keys.every((key) => card[key] === otherCard[key]),
  )
  if (cardIndex === -1) {
    throw new TypeError(`Received an invalid card: ${JSON.stringify(card)}`)
  }

  return SERIALIZED_CARDS[cardIndex]
}

const MOVE_TYPES = Object.values(MoveType).sort()
const COLORS = Object.values(Color).sort()
const UNSERIALIZED_CARDS = DECK
const SERIALIZED_CARDS = (() => {
  const alphabet = Array.from({length: 26}).map((_, index) => String.fromCharCode(97 + index))
  return [
    ...alphabet,
    ...alphabet.map((character) => character.toUpperCase()),
  ]
})()
