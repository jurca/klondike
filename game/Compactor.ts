import {DECK, ICard} from './Card'
import {IDesk} from './Desk'
import {createNewGame, executeMove, IGame, INewGameRules, undoLastMove} from './Game'
import {Move, MoveType} from './Move'
import {lastItem, lastItemOrNull} from './util'

export type CompactCard = Omit<ICard, 'side'>

export enum CompactMoveType {
  MULTIPLE_STOCK_MANIPULATIONS = 'CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS',
  MULTIPLE_UNDO = 'CompactMoveType.MULTIPLE_UNDO',
  BREAK = 'CompactMoveType.BREAK',
}

interface IMultipleStockManipulationsMove {
  readonly move: CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS
  readonly drawnCards: number
  readonly timeDeltas: readonly number[]
}

interface IMultipleUndoMove {
  readonly move: CompactMoveType.MULTIPLE_UNDO
  readonly timeDeltas: readonly number[]
}

interface IBreakMove {
  readonly move: CompactMoveType.BREAK
  readonly timeDelta: number
  readonly duration: number
}

export type CompactMoveHistoryRecord =
  IMultipleStockManipulationsMove |
  IMultipleUndoMove |
  IBreakMove

export type CompactTimeHistoryRecord = Move & {
  readonly timeDelta: number,
}

export type CompactHistoryRecord = CompactTimeHistoryRecord | CompactMoveHistoryRecord

export interface ICompactGame {
  readonly deck: readonly CompactCard[]
  readonly rules: INewGameRules,
  readonly startTime: number,
  readonly history: readonly CompactHistoryRecord[]
  readonly future: number
}

export function compact(game: IGame): ICompactGame {
  const initialState = game.history.length ? game.history[0][0] : game.state
  const cardsDeck = compactDeckFromDesk(initialState)
  const compactedHistoryRecords = compactHistoryRecords(game.history.concat(game.future).map(
    (record, index, records) => compactHistoryRecordTimestamp(
      record,
      records[index - 1]?.[1].logicalTimestamp ?? game.startTime.logicalTimestamp,
    ),
  ))

  return {
    deck: cardsDeck,
    future: game.future.length,
    history: compactedHistoryRecords,
    rules: {
      ...game.rules,
      tableauPiles: initialState.tableau.piles.length,
    },
    startTime: game.startTime.absoluteTimestamp,
  }
}

export function compactDeckFromDesk(desk: IDesk): CompactCard[] {
  const cardsDeck = [
    ...desk.stock.cards,
    ...desk.tableau.piles.map((pile) => pile.cards.slice().reverse()).reverse().flat(),
  ].map(({side, ...cardType}) => cardType)
  return cardsDeck.slice(0, -1)
}

export function expand(game: ICompactGame): IGame {
  const reconstructedDeck = expandDeck(game.deck)
  const initialState = createNewGame(game.rules, reconstructedDeck)
  const finalState = expandHistoryRecords(initialState, game.history)
  let expandedGame = finalState
  for (let i = 0; i < game.future; i++) {
    expandedGame = undoLastMove(expandedGame)
  }

  return {
    ...expandedGame,
    startTime: {
      absoluteTimestamp: game.startTime,
      logicalTimestamp: 0,
    },
  }
}

export function expandDeck(deck: readonly CompactCard[]): ICard[] {
  const remainingDeckCards = DECK.slice()
  const reconstructedDeck = []
  for (const compactedCard of deck) {
    const cardIndex = remainingDeckCards.findIndex(
      (card) => card.color === compactedCard.color && card.rank === compactedCard.rank,
    )
    const [reconstructedCard] = remainingDeckCards.splice(cardIndex, 1)
    reconstructedDeck.push(reconstructedCard)

    if (!remainingDeckCards.length) { // The game uses multiple card decks
      remainingDeckCards.splice(0, 0, ...DECK)
    }
  }
  reconstructedDeck.push(...remainingDeckCards)
  return reconstructedDeck
}

function compactHistoryRecords(records: readonly CompactTimeHistoryRecord[]): CompactHistoryRecord[] {
  const compactedRecords: CompactHistoryRecord[] = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    switch (true) {
      case [MoveType.REDEAL, MoveType.DRAW_CARDS].includes(record.move):
        let stockMovesCount = 0
        let drawnCards: null | number = null
        for (let j = i; j < records.length && [MoveType.REDEAL, MoveType.DRAW_CARDS].includes(records[j].move); j++) {
          const stockMove = records[j]
          if (stockMove.move === MoveType.DRAW_CARDS) {
            if (drawnCards === null) {
              drawnCards = stockMove.drawnCards
            } else if (stockMove.drawnCards !== drawnCards) {
              break
            }
          }
          stockMovesCount++
        }
        if (drawnCards && stockMovesCount > 2) {
          compactedRecords.push({
            drawnCards,
            move: CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS,
            timeDeltas: records.slice(i, i + stockMovesCount).map((recordToCompact) => recordToCompact.timeDelta),
          })
          i += stockMovesCount - 1
        } else {
          compactedRecords.push(record)
        }
        break
      case record.move === MoveType.UNDO:
        let undoCount = 1
        for (let j = i + 1; j < records.length && records[j].move === MoveType.UNDO; j++) {
          undoCount++
        }
        if (undoCount > 2) {
          compactedRecords.push({
            move: CompactMoveType.MULTIPLE_UNDO,
            timeDeltas: records.slice(i, i + undoCount).map((recordToCompact) => recordToCompact.timeDelta),
          })
          i += undoCount - 1
        } else {
          compactedRecords.push(record)
        }
        break
      case record.move === MoveType.PAUSE && i < records.length - 1 && records[i + 1].move === MoveType.RESUME:
        compactedRecords.push({
          duration: records[i + 1].timeDelta,
          move: CompactMoveType.BREAK,
          timeDelta: record.timeDelta,
        })
        i++
        break
      default:
        compactedRecords.push(record)
        break
    }
  }
  return compactedRecords
}

function compactHistoryRecordTimestamp(
  record: IGame['history'][0],
  previousLogicalTimestamp: number,
): CompactTimeHistoryRecord {
  const {logicalTimestamp, ...move} = record[1]
  return {
    ...move,
    timeDelta: logicalTimestamp - previousLogicalTimestamp,
  }
}

function expandHistoryRecords(
  initialState: IGame,
  records: readonly CompactHistoryRecord[],
): IGame {
  const expandedRecords: CompactTimeHistoryRecord[] = []
  for (const record of records) {
    switch (record.move) {
      case CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS:
        expandedRecords.push(...record.timeDeltas.map<CompactTimeHistoryRecord>((timeDelta) => ({
          drawnCards: record.drawnCards,
          move: MoveType.DRAW_CARDS, // Will be changed to REDEAL where needed when replaying history of the game
          timeDelta,
        })))
        break
      case CompactMoveType.MULTIPLE_UNDO:
        expandedRecords.push(...record.timeDeltas.map<CompactTimeHistoryRecord>((timeDelta) => ({
          move: MoveType.UNDO,
          timeDelta,
        })))
        break
      case CompactMoveType.BREAK:
        expandedRecords.push(
          {
            move: MoveType.PAUSE,
            timeDelta: record.timeDelta,
          },
          {
            move: MoveType.RESUME,
            timeDelta: record.duration,
          },
        )
        break
      default:
        expandedRecords.push(record)
        break
    }
  }

  const historyRecords: Array<IGame['history'][0][1]> = []
  for (const record of expandedRecords) {
    historyRecords.push(expandHistoryRecordTimestamp(
      record,
      lastItemOrNull(historyRecords)?.logicalTimestamp ?? 0,
    ))
  }

  let game = initialState
  for (const record of historyRecords) {
    if (record.move === MoveType.DRAW_CARDS && !game.state.stock.cards.length) {
      game = executeMove(game, {
        move: MoveType.REDEAL,
      })
    } else {
      game = executeMove(game, record)
    }
    lastItem(game.history)[1].logicalTimestamp = record.logicalTimestamp
  }
  return game
}

function expandHistoryRecordTimestamp(
  record: CompactTimeHistoryRecord,
  previousLogicalTimestamp: number,
): IGame['history'][0][1] {
  const {timeDelta, ...move} = record
  return {
    ...move,
    logicalTimestamp: previousLogicalTimestamp + timeDelta,
  }
}
