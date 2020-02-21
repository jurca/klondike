import {Color, DECK, ICard} from './Card'
import {IDesk} from './Desk'
import {
  createNewGame,
  executeMove,
  IGame,
  INewGameRules,
  IRecordTimestamp,
  Move,
  MoveType,
  redoNextMove,
} from './Game'

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
    ...initialState.stock.cards,
    ...initialState.tableau.piles.map((pile) => pile.cards.slice().reverse()).reverse().flat(),
  ]
  const serializedData = [
    SERIALIZER_VERSION,
    game.rules.drawnCards.toString(NUM_RADIX),
    game.state.tableau.piles.length.toString(NUM_RADIX).padStart(2, '0'),
    serializeDeck(cardsDeck),
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

export function deserialize(serializedState: string): IGame {
  if (!serializedState.startsWith(SERIALIZER_VERSION.toString())) {
    throw new Error(`Invalid state or unsupported version: ${serializedState}`)
  }

  const gameRules: INewGameRules = {
    drawnCards: parseInt(serializedState.charAt(1), NUM_RADIX),
    tableauPiles: parseInt(serializedState.substring(2, 4), NUM_RADIX),
  }
  const cardDeck = deserializeDeck(serializedState.substring(4, 55))
  const serializedStartTime = serializedState.substring(55, serializedState.indexOf(';', 55))
  const startTime = deserializeStartTime(serializedStartTime)
  const historyLength = serializedState.substring(55 + serializedStartTime.length + 1, serializedState.indexOf(':', 55))
  const deserializedHistoryLength = parseInt(historyLength, NUM_RADIX)
  const serializedHistory = serializedState.substring(55 + serializedStartTime.length + 1 + historyLength.length + 1)
  const baseGame = createNewGame(gameRules, cardDeck)
  const history = deserializeHistory(baseGame, startTime.logicalTimestamp, serializedHistory)

  let deserializedGame: IGame = {
    ...baseGame,
    future: history,
    startTime,
  }
  for (let i = 0; i < deserializedHistoryLength; i++) {
    deserializedGame = redoNextMove(deserializedGame)
  }
  return deserializedGame
}

export function serializeDeck(cardsDeck: ICard[]): string {
  return cardsDeck.slice(0, -1).map(serializeCard).join('')
}

export function deserializeDeck(serializedDeck: string): ICard[] {
  const remainingCards = new Set(UNSERIALIZED_CARDS)
  return serializedDeck.split('').map((serializedCard) => {
    const cardIndex = SERIALIZED_CARDS.indexOf(serializedCard)
    const card = UNSERIALIZED_CARDS[cardIndex]
    remainingCards.delete(card)
    return card
  }).concat([...remainingCards])
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

function deserializeHistory(
  startingState: IGame,
  startingLogicalTimestamp: number,
  serializedHistory: string,
): Array<[IDesk, Move & IRecordTimestamp]> {
  const history = [] as Array<[IDesk, Move & IRecordTimestamp]>
  let lastState = startingState
  let lastLogicalTimestamp = startingLogicalTimestamp
  let currentMoveStartIndex = 0
  while (currentMoveStartIndex < serializedHistory.length) {
    let remainingSerializedHistory = serializedHistory.substring(currentMoveStartIndex)
    const logicalTimestampDiff = parseInt(remainingSerializedHistory, NUM_RADIX)
    const moveType = MOVE_TYPES[
      ',;:-=+*!'.indexOf(remainingSerializedHistory.charAt(logicalTimestampDiff.toString(NUM_RADIX).length))
    ]

    lastLogicalTimestamp += logicalTimestampDiff
    currentMoveStartIndex += logicalTimestampDiff.toString(NUM_RADIX).length + 1

    remainingSerializedHistory = serializedHistory.substring(currentMoveStartIndex)
    let move: Move & IRecordTimestamp
    switch (moveType) {
      case MoveType.DRAW_CARDS:
        const drawnCards = remainingSerializedHistory.substring(0, remainingSerializedHistory.indexOf('.'))
        currentMoveStartIndex += drawnCards.length + 1
        move = {
          drawnCards: parseInt(drawnCards, NUM_RADIX),
          logicalTimestamp: lastLogicalTimestamp,
          move: moveType,
        }
        break
      case MoveType.WASTE_TO_TABLEAU:
      case MoveType.TABLEAU_TO_FOUNDATION:
      case MoveType.REVEAL_TABLEAU_CARD:
        {
          const pileIndex = parseInt(remainingSerializedHistory.substring(0, 2), NUM_RADIX)
          currentMoveStartIndex += 2
          move = {
            logicalTimestamp: lastLogicalTimestamp,
            move: moveType as any, // Unfortunately the type check fails in this case, even though everything checks up.
            pileIndex,
          }
        }
        break

      case MoveType.FOUNDATION_TO_TABLEAU:
        {
          const pileIndex = parseInt(remainingSerializedHistory, NUM_RADIX)
          const color = COLORS[
            ',;:-'.indexOf(remainingSerializedHistory.charAt(pileIndex.toString(NUM_RADIX).length))
          ]
          currentMoveStartIndex += pileIndex.toString(NUM_RADIX).length + 1
          move = {
            color,
            logicalTimestamp: lastLogicalTimestamp,
            move: moveType,
            pileIndex,
          }
        }
        break

      case MoveType.TABLEAU_TO_TABLEAU:
        const [sourcePileIndex, topMovedCardIndex, targetPileIndex] = remainingSerializedHistory
          .substring(0, 6)
          .match(/../g)!
          .map((serializedIndex) => parseInt(serializedIndex, NUM_RADIX))
        currentMoveStartIndex += 6
        move = {
          logicalTimestamp: lastLogicalTimestamp,
          move: moveType,
          sourcePileIndex,
          targetPileIndex,
          topMovedCardIndex,
        }
        break

      case MoveType.REDEAL:
      case MoveType.WASTE_TO_FOUNDATION:
        move = {
          logicalTimestamp: lastLogicalTimestamp,
          move: moveType as any, // Unfortunately the type check fails in this case, even though everything checks up.
        }
        break
      default:
        throw new Error(
          `Failed to deserialize a history item at the index ${currentMoveStartIndex} of history records due to ` +
          `unknown move type: ${remainingSerializedHistory.substr(logicalTimestampDiff.toString(NUM_RADIX).length, 1)}`,
        )
    }

    history.push([lastState.state, move])
    lastState = executeMove(lastState, move)
  }
  return history
}

function deserializeStartTime(timestamp: string): {absoluteTimestamp: number, logicalTimestamp: number} {
  const [absoluteTimestamp, logicalTimestamp] = timestamp.split(',').map((part) => parseInt(part, NUM_RADIX))
  return {
    absoluteTimestamp: absoluteTimestamp * 1000 + EPOCH_START,
    logicalTimestamp,
  }
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
