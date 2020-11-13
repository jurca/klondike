import {Color, DECK, ICard} from './Card'
import {
  compact,
  CompactCard,
  compactDeckFromDesk,
  CompactHistoryRecord,
  CompactMoveType,
  expand,
  expandDeck,
  ICompactGame,
} from './Compactor'
import {IDesk} from './Desk'
import {IGame} from './Game'
import {Move, MoveType} from './Move'

const SERIALIZER_VERSION = 3
const EPOCH_START = Date.UTC(2021, 0)
const DESERIALIZED_CARDS: readonly CompactCard[] = DECK.map(({side, ...card}) => card)
const DESERIALIZED_CARD_KEYS = Object.keys(DESERIALIZED_CARDS[0]) as ReadonlyArray<keyof CompactCard>
const SERIALIZED_CARDS: readonly string[] =
  (new Array(26).fill(0).map((_, i) => String.fromCodePoint(i + 97))) // a-z
  .concat(new Array(26).fill(0).map((_, i) => String.fromCodePoint(i + 65))) // A-Z
const START_TIME_PRECISION = 1_000
const MOVE_TIME_DELTA_PRECISION = 20
const DIGITS: readonly string[] =
  new Array(10).fill(0).map((_, i) => `${i}`) // 0-9
  .concat(new Array(26).fill(0).map((_, i) => String.fromCodePoint(i + 97))) // a-z
  .concat(new Array(26).fill(0).map((_, i) => String.fromCodePoint(i + 65))) // A-Z
const FRAGMENT_TERMINATOR = '&'
const INT_OR_CARD_SEPARATOR = '#'
const COLORS = Object.values(Color).sort()

if (SERIALIZED_CARDS.length !== DESERIALIZED_CARDS.length) {
  throw new Error(
    `Serializer v3 is out of date - there are ${DESERIALIZED_CARDS.length} cards in the deck, but the serializer ` +
    `has representation for ${SERIALIZED_CARDS.length} cards. The two must match for safe serialization and ` +
    'deserialization.',
  )
}

const DESERIALIZED_MOVE_TYPES = [
  MoveType.DRAW_CARDS,
  MoveType.REDEAL,
  MoveType.WASTE_TO_FOUNDATION,
  MoveType.WASTE_TO_TABLEAU,
  MoveType.TABLEAU_TO_FOUNDATION,
  MoveType.REVEAL_TABLEAU_CARD,
  MoveType.FOUNDATION_TO_TABLEAU,
  MoveType.UNDO,
  MoveType.PAUSE,
  MoveType.RESUME,
  CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS,
  CompactMoveType.MULTIPLE_UNDO,
  CompactMoveType.BREAK,
  CompactMoveType.TABLEAU_TO_TABLEAU,
  CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION,
  CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU,
]
const SERIALIZED_MOVE_TYPES = '.,?!:;+=~_/|<>()'.split('')

if (SERIALIZED_MOVE_TYPES.length !== DESERIALIZED_MOVE_TYPES.length) {
  throw new Error(
    `Serializer v3 is out of date - there are ${DESERIALIZED_MOVE_TYPES.length} supported move types, but the ` +
    `serializer has representation for ${SERIALIZED_MOVE_TYPES.length} move types. The two must match for safe ` +
    'serialization and deserialization.',
  )
}
if (SERIALIZED_MOVE_TYPES.some((moveTypeSymbol) => DIGITS.concat('-').includes(moveTypeSymbol))) {
  throw new Error(
    'Serializer v3 is out of date - there is a move type that uses a symbol that is also used to encode integers. ' +
    'These must not overlap for the game history deserialization to work.',
  )
}
if (SERIALIZED_CARDS.includes(FRAGMENT_TERMINATOR)) {
  throw new Error(
    'Serializer v3 is out of date - the serialized card symbols include the currently configured symbol for ' +
    `terminating dynamically sized fragments (${FRAGMENT_TERMINATOR}). The two must not overlap for the ` +
    'deserialization to work.',
  )
}
if (DIGITS.includes(FRAGMENT_TERMINATOR)) {
  throw new Error(
    'Serializer v3 is out of date - the integer encoding symbols include the currently configured symbol for ' +
    `terminating dynamically sized fragments (${FRAGMENT_TERMINATOR}). The two must not overlap for the ` +
    'deserialization to work.',
  )
}
if (SERIALIZED_MOVE_TYPES.includes(FRAGMENT_TERMINATOR)) {
  throw new Error(
    'Serializer v3 is out of date - the move type encoding symbols include the currently configured symbol for ' +
    `terminating dynamically sized fragments (${FRAGMENT_TERMINATOR}). The two must not overlap for the ` +
    'deserialization to work.',
  )
}

if (SERIALIZED_CARDS.includes(INT_OR_CARD_SEPARATOR)) {
  throw new Error(
    'Serializer v3 is out of date - the serialized card symbols include the currently configured symbol for ' +
    `separating items in sequence of cards or integers (${INT_OR_CARD_SEPARATOR}). The two must not overlap for the ` +
    'deserialization to work.',
  )
}
if (DIGITS.includes(INT_OR_CARD_SEPARATOR)) {
  throw new Error(
    'Serializer v3 is out of date - the integer encoding symbols include the currently configured symbol for ' +
    `separating items in sequence of cards or integers (${INT_OR_CARD_SEPARATOR}). The two must not overlap for the ` +
    'deserialization to work.',
  )
}
if (SERIALIZED_MOVE_TYPES.includes(INT_OR_CARD_SEPARATOR)) {
  throw new Error(
    'Serializer v3 is out of date - the move type encoding symbols include the currently configured symbol for ' +
    `separating items in sequence of cards or integers (${INT_OR_CARD_SEPARATOR}). The two must not overlap for the ` +
    'deserialization to work.',
  )
}

export function serialize(game: IGame): string {
  const unsupportedDrawMoveIndex = game.history.concat(game.future).findIndex(([, record]) =>
    record.move === MoveType.DRAW_CARDS && record.drawnCards !== game.rules.drawnCards,
  )
  if (unsupportedDrawMoveIndex > -1) {
    const isHistory = unsupportedDrawMoveIndex < game.history.length
    const unsupportedMoveIndex = isHistory ? unsupportedDrawMoveIndex : unsupportedDrawMoveIndex - game.history.length
    const unsupportedMove =
      (isHistory ? game.history[unsupportedMoveIndex] : game.future[unsupportedMoveIndex])[1] as
      Move & {move: MoveType.DRAW_CARDS, drawnCards: number}
    throw new Error(
      'Games that draw a different number of cards per move than is specified in game rules are not supported. Found ' +
      `the unsupported move at index ${isHistory} of the provided game's ${isHistory ? 'history' : 'future'}: ` +
      `${unsupportedMove.drawnCards} cards were drawn`,
    )
  }
  const compactGame = compact(game)
  if (compactGame.rules.drawnCards > compactGame.deck.length + 1) {
    throw new Error(
      'Games that draw more cards from stock per move than the total number of used cards are not supported',
    )
  }
  if (compactGame.rules.tableauPiles > compactGame.deck.length + 1) {
    throw new Error(
      'Games that have more tableau piles than the total number of used cards are not supported',
    )
  }
  const usedDecks = (compactGame.deck.length + 1) / DECK.length
  if (usedDecks >= DIGITS.length) {
    throw new Error(
      `Games that use ${DIGITS.length} or more card decks are not supported, the provided game uses ${usedDecks} ` +
      'card decks',
    )
  }

  const {timeDeltaRemainder, serializedHistory} = serializeHistory(compactGame.history, usedDecks === 1)
  return [
    SERIALIZER_VERSION,
    serializeInt(usedDecks),
    compactGame.rules.allowNonKingToEmptyPileTransfer ? '*' : 'K',
    serializeInt(compactGame.rules.drawnCards - 1),
    FRAGMENT_TERMINATOR,
    serializeInt(compactGame.rules.tableauPiles - 1),
    FRAGMENT_TERMINATOR,
    serializeDeck(compactGame.deck),
    serializeInt(Math.floor((compactGame.startTime - EPOCH_START) / START_TIME_PRECISION)),
    FRAGMENT_TERMINATOR,
    serializeInt(compactGame.future),
    FRAGMENT_TERMINATOR,
    serializeInt(timeDeltaRemainder),
    FRAGMENT_TERMINATOR,
    serializedHistory,
  ].join('')
}

export function serializeDeckFromDesk(desk: IDesk): string {
  const deck = compactDeckFromDesk(desk)
  return serializeDeck(deck)
}

export function deserialize(serializedState: string): IGame {
  if (serializedState.charAt(0) !== `${SERIALIZER_VERSION}`) {
    throw new Error(`Invalid state or unsupported version: ${serializedState.charAt(0)}`)
  }

  const usedDecks = deserializeInt(serializedState.charAt(1))
  const allowNonKingToEmptyPileTransfer = serializedState.charAt(2) === '*'
  const drawnCardsTerminatorIndex = serializedState.indexOf(FRAGMENT_TERMINATOR, 3)
  const drawnCards = deserializeInt(serializedState.slice(3, drawnCardsTerminatorIndex)) + 1
  const tableauPilesTerminatorIndex = serializedState.indexOf(FRAGMENT_TERMINATOR, drawnCardsTerminatorIndex + 1)
  const tableauPiles = (
    deserializeInt(serializedState.slice(drawnCardsTerminatorIndex + 1, tableauPilesTerminatorIndex)) + 1
  )

  const deckEnd = tableauPilesTerminatorIndex + DECK.length * usedDecks
  const deck = deserializeCompactDeck(serializedState.slice(tableauPilesTerminatorIndex + 1, deckEnd))

  const startTimeTerminatorIndex = serializedState.indexOf(FRAGMENT_TERMINATOR, deckEnd)
  const startTime = deserializeInt(serializedState.slice(deckEnd, startTimeTerminatorIndex)) * START_TIME_PRECISION

  const futureMovesTerminatorIndex = serializedState.indexOf(FRAGMENT_TERMINATOR, startTimeTerminatorIndex + 1)
  const future = deserializeInt(serializedState.slice(startTimeTerminatorIndex + 1, futureMovesTerminatorIndex))
  const timeDeltaRemainderTerminatorIndex = serializedState.indexOf(FRAGMENT_TERMINATOR, futureMovesTerminatorIndex + 1)
  const timeDeltaRemainder = deserializeInt(
    serializedState.slice(futureMovesTerminatorIndex + 1, timeDeltaRemainderTerminatorIndex),
  )
  const history = deserializeHistory(
    serializedState.slice(timeDeltaRemainderTerminatorIndex + 1),
    drawnCards,
    timeDeltaRemainder,
    usedDecks === 1,
  )

  const compactGame: ICompactGame = {
    deck,
    future,
    history,
    rules: {
      allowNonKingToEmptyPileTransfer,
      drawnCards,
      tableauPiles,
    },
    startTime: startTime + EPOCH_START,
  }
  console.log(compactGame)
  return expand(compactGame)
}

export function deserializeDeck(serializedDeck: string): ICard[] {
  const compactDeck = deserializeCompactDeck(serializedDeck)
  return expandDeck(compactDeck)
}

function serializeDeck(deck: readonly CompactCard[]): string {
  return deck.map(serializeCard).join('')
}

function serializeHistory(
  records: readonly CompactHistoryRecord[],
  isSingleDeckGame: boolean,
): {serializedHistory: string, timeDeltaRemainder: number} {
  let timeDeltaRemainder = 0
  const serializedHistory: string[] = []

  for (const record of records) {
    const {timeDeltaRemainder: newTimeDeltaRemainder, serializedRecord} = serializeHistoryRecord(
      record,
      timeDeltaRemainder,
      isSingleDeckGame,
    )
    serializedHistory.push(serializedRecord)
    timeDeltaRemainder = newTimeDeltaRemainder
  }

  return {
    serializedHistory: serializedHistory.join(''),
    timeDeltaRemainder: Math.floor(timeDeltaRemainder),
  }
}

function serializeHistoryRecord(
  record: CompactHistoryRecord,
  timeDeltaRemainder: number,
  isSingleDeckGame: boolean,
): {serializedRecord: string, timeDeltaRemainder: number} {
  const parts: string[] = []

  const timeDeltas: number[] = []
  switch (record.move) {
    case CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS:
    case CompactMoveType.MULTIPLE_UNDO:
      timeDeltas.push(...record.timeDeltas)
      break
    case CompactMoveType.BREAK:
      timeDeltas.push(record.timeDelta, record.duration)
      break
    case CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION:
    case CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU:
      timeDeltas.push(record.timeDelta, record.cardRevealingTimeDelta)
      break
    default:
      timeDeltas.push(record.timeDelta)
      break
  }
  let newTimeDeltaRemainder = timeDeltaRemainder
  const flooredTimeDeltas: number[] = []
  for (const timeDelta of timeDeltas) {
    const adjustedTimeDelta = timeDelta + newTimeDeltaRemainder
    flooredTimeDeltas.push(Math.floor(adjustedTimeDelta / MOVE_TIME_DELTA_PRECISION))
    newTimeDeltaRemainder = adjustedTimeDelta % MOVE_TIME_DELTA_PRECISION
  }
  parts.push(flooredTimeDeltas.map(serializeInt).join(INT_OR_CARD_SEPARATOR))

  const moveTypeIndex = DESERIALIZED_MOVE_TYPES.indexOf(record.move)
  if (moveTypeIndex === -1) {
    throw new Error(`The move of ${record.move} type cannot be serialized`)
  }
  parts.push(SERIALIZED_MOVE_TYPES[moveTypeIndex])

  switch (record.move) {
    case MoveType.WASTE_TO_TABLEAU:
    case MoveType.TABLEAU_TO_FOUNDATION:
    case MoveType.REVEAL_TABLEAU_CARD:
    case CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION:
      parts.push(serializeInt(record.pileIndex) || '0')
      if (!isSingleDeckGame) {
        parts.push(FRAGMENT_TERMINATOR)
      }
      break
    case MoveType.FOUNDATION_TO_TABLEAU:
      parts.push(serializeInt(COLORS.indexOf(record.color)) || '0')
      parts.push(serializeInt(record.pileIndex) || '0')
      if (!isSingleDeckGame) {
        parts.push(FRAGMENT_TERMINATOR)
      }
      break
    case CompactMoveType.TABLEAU_TO_TABLEAU:
    case CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU:
      parts.push(serializeCard(record.topMovedCard))
      parts.push(serializeInt(record.targetPileIndex) || '0')
      if (!isSingleDeckGame) {
        parts.push(FRAGMENT_TERMINATOR)
      }
      break
    default:
      // DRAW_CARDS, REDEAL, WASTE_TO_FOUNDATION, UNDO, PAUSE, RESUME, MULTIPLE_STOCK_MANIPULATIONS, MULTIPLE_UNDO
      break // nothing to do
  }

  return {
    serializedRecord: parts.join(''),
    timeDeltaRemainder: newTimeDeltaRemainder,
  }
}

function serializeCard(card: CompactCard): string {
  const cardIndex = DESERIALIZED_CARDS.findIndex(
    (otherCard) => DESERIALIZED_CARD_KEYS.every((key) => card[key] === otherCard[key]),
  )
  if (cardIndex === -1) {
    throw new Error(`Unknown card: ${JSON.stringify(card)}`)
  }

  return SERIALIZED_CARDS[cardIndex]
}

function deserializeHistory(
  serializedHistory: string,
  drawnCards: number,
  timeDeltaRemainder: number,
  isSingleDeckGame: boolean,
): CompactHistoryRecord[] {
  const records: CompactHistoryRecord[] = []

  let index = 0
  while (index < serializedHistory.length) {
    let timeDeltasEnd = index
    while (!SERIALIZED_MOVE_TYPES.includes(serializedHistory.charAt(timeDeltasEnd))) {
      timeDeltasEnd++
    }
    const timeDeltas = serializedHistory
      .slice(index, timeDeltasEnd)
      .split(INT_OR_CARD_SEPARATOR)
      .map((timeDelta) => deserializeInt(timeDelta) * MOVE_TIME_DELTA_PRECISION)
    const moveTypeIndex = SERIALIZED_MOVE_TYPES.indexOf(serializedHistory.charAt(timeDeltasEnd))
    if (moveTypeIndex === -1) {
      throw new Error(`Unknown serialized move type: ${serializedHistory.charAt(timeDeltasEnd)}`)
    }
    const moveType = DESERIALIZED_MOVE_TYPES[moveTypeIndex]

    index = timeDeltasEnd + 1

    switch (moveType) {
      case MoveType.WASTE_TO_TABLEAU:
      case MoveType.TABLEAU_TO_FOUNDATION:
      case MoveType.REVEAL_TABLEAU_CARD:
        {
          const {pileIndex, processedChars} = deserializePileIndex(serializedHistory.slice(index), isSingleDeckGame)
          index += processedChars
          records.push({
            move: moveType as MoveType.WASTE_TO_TABLEAU,
            pileIndex,
            timeDelta: timeDeltas[0],
          })
        }
        break
      case CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION:
        {
          const {pileIndex, processedChars} = deserializePileIndex(serializedHistory.slice(index), isSingleDeckGame)
          index += processedChars
          records.push({
            cardRevealingTimeDelta: timeDeltas[1],
            move: moveType,
            pileIndex,
            timeDelta: timeDeltas[0],
          })
        }
        break
      case MoveType.FOUNDATION_TO_TABLEAU:
        {
          const color = COLORS[deserializeInt(serializedHistory.charAt(index))]
          const {pileIndex, processedChars} = deserializePileIndex(serializedHistory.slice(index + 1), isSingleDeckGame)
          index += 1 + processedChars
          records.push({
            color,
            move: moveType,
            pileIndex,
            timeDelta: timeDeltas[0],
          })
        }
        break
      case CompactMoveType.TABLEAU_TO_TABLEAU:
        {
          const topMovedCard = deserializeCard(serializedHistory.charAt(index))
          const {pileIndex, processedChars} = deserializePileIndex(serializedHistory.slice(index + 1), isSingleDeckGame)
          index += 1 + processedChars
          records.push({
            move: moveType,
            targetPileIndex: pileIndex,
            timeDelta: timeDeltas[0],
            topMovedCard,
          })
        }
        break
      case CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU:
        {
          const topMovedCard = deserializeCard(serializedHistory.charAt(index))
          const {pileIndex, processedChars} = deserializePileIndex(serializedHistory.slice(index + 1), isSingleDeckGame)
          index += 1 + processedChars
          records.push({
            cardRevealingTimeDelta: timeDeltas[1],
            move: moveType,
            targetPileIndex: pileIndex,
            timeDelta: timeDeltas[0],
            topMovedCard,
          })
        }
        break
      case CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS:
        records.push({
          drawnCards,
          move: moveType,
          timeDeltas,
        })
        break
      case MoveType.DRAW_CARDS:
        records.push({
          drawnCards,
          move: moveType,
          timeDelta: timeDeltas[0],
        })
        break
      case CompactMoveType.MULTIPLE_UNDO:
        records.push({
          move: moveType,
          timeDeltas,
        })
        break
      case CompactMoveType.BREAK:
        records.push({
          duration: timeDeltas[1],
          move: moveType,
          timeDelta: timeDeltas[0],
        })
        break
      default:
        records.push({
          move: moveType as MoveType.REDEAL,
          timeDelta: timeDeltas[0],
        })
        break
    }
  }

  if (records.length) {
    const lastRecord = records.pop()!
    switch (lastRecord.move) {
      case CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS:
      case CompactMoveType.MULTIPLE_UNDO:
        const timeDeltas = lastRecord.timeDeltas
        records.push({
          ...lastRecord,
          timeDeltas: timeDeltas.slice(0, -1).concat(timeDeltas.slice(-1)[0] + timeDeltaRemainder),
        })
        break
      default:
        records.push({
          ...lastRecord,
          timeDelta: lastRecord.timeDelta + timeDeltaRemainder,
        })
        break
    }
  }

  return records
}

function deserializePileIndex(
  serializedHistoryFragment: string,
  isSingleDeckGame: boolean,
): {pileIndex: number, processedChars: number} {
  if (isSingleDeckGame) {
    return {
      pileIndex: deserializeInt(serializedHistoryFragment.charAt(0)),
      processedChars: 1,
    }
  }

  let pileChars = 0
  while (serializedHistoryFragment.charAt(pileChars) !== FRAGMENT_TERMINATOR) {
    pileChars++
  }
  return {
    pileIndex: deserializeInt(serializedHistoryFragment.slice(0, pileChars + 1)),
    processedChars: pileChars + 1,
  }
}

function deserializeCompactDeck(serializedDeck: string): CompactCard[] {
  return serializedDeck.split('').map(deserializeCard)
}

function deserializeCard(card: string): CompactCard {
  const cardIndex = SERIALIZED_CARDS.indexOf(card)
  if (cardIndex === -1) {
    throw new Error(`Unknown card: ${card}`)
  }

  return DESERIALIZED_CARDS[cardIndex]
}

function serializeInt(int: number): string {
  if (!Number.isSafeInteger(int)) {
    throw new TypeError(`The number to serialize must be a safe integer, ${int} was provided`)
  }

  if (int < 0) {
    return `-${serializeInt(-int)}`
  }

  const digits: string[] = []
  let remainingValue = int
  while (remainingValue) {
    const lastDigitValue = remainingValue % DIGITS.length
    digits.unshift(DIGITS[lastDigitValue])
    remainingValue = (remainingValue - lastDigitValue) / DIGITS.length
  }

  return digits.join('')
}

function deserializeInt(int: string): number {
  return int.charAt(0) === '-' ? -deserializeValue(int.substring(1), 1) : deserializeValue(int, 0)

  function deserializeValue(serialized: string, absoluteOffset: number): number {
    let value = 0
    for (let i = 0; i < serialized.length; i++) {
      const digitValue = DIGITS.indexOf(serialized.charAt(i))
      if (digitValue < 0) {
        throw new Error(`Encountered an invalid digit at index ${i + absoluteOffset}: ${serialized.charAt(i)}`)
      }
      value = value * DIGITS.length + digitValue
    }
    return value
  }
}
