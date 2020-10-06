import {DECK, ICard} from './Card'
import {IDesk} from './Desk'
import {createNewGame, executeMove, IGame, INewGameRules, undoLastMove} from './Game'
import {Move, MoveType} from './Move'
import {ITableau} from './Tableau'
import {lastItem, lastItemOrNull} from './util'

export type CompactCard = Omit<ICard, 'side'>

export enum CompactMoveType {
  MULTIPLE_STOCK_MANIPULATIONS = 'CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS',
  MULTIPLE_UNDO = 'CompactMoveType.MULTIPLE_UNDO',
  BREAK = 'CompactMoveType.BREAK',
  TABLEAU_TO_TABLEAU = 'CompactMoveType.TABLEAU_TO_TABLEAU',
  CARD_REVEALING_TABLEAU_TO_FOUNDATION = 'CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION',
  CARD_REVEALING_TABLEAU_TO_TABLEAU = 'CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU',
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

interface ITableauToTableauMove {
  readonly move: CompactMoveType.TABLEAU_TO_TABLEAU
  readonly topMovedCard: CompactCard
  readonly targetPileIndex: number
  readonly timeDelta: number
}

interface ICardRevealingTableauToFoundationMove {
  readonly move: CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION
  readonly pileIndex: number
  readonly timeDelta: number
  readonly cardRevealTimeDelta: number
}

interface ICardRevealingTableauToTableauMove {
  readonly move: CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU
  readonly topMovedCard: CompactCard
  readonly targetPileIndex: number
  readonly timeDelta: number
  readonly cardRevealingTimeDelta: number
}

export type CompactMoveHistoryRecord =
  IMultipleStockManipulationsMove |
  IMultipleUndoMove |
  IBreakMove |
  ITableauToTableauMove |
  ICardRevealingTableauToFoundationMove |
  ICardRevealingTableauToTableauMove

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
  const compactTimestampRecords = game.history.concat(game.future).map(
    ([deskState, moveHistoryRecord], i, records) => [
      deskState,
      compactHistoryRecordTimestamp(
        moveHistoryRecord,
        records[i - 1]?.[1].logicalTimestamp ?? game.startTime.logicalTimestamp,
      ),
    ] as [IDesk, CompactTimeHistoryRecord],
  )
  const compactedHistoryRecords = compactHistoryRecords(compactTimestampRecords)

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

function compactHistoryRecords(
  records: ReadonlyArray<readonly [IDesk, CompactTimeHistoryRecord]>,
): CompactHistoryRecord[] {
  const compactedRecords: CompactHistoryRecord[] = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i][1]
    switch (true) {
      case [MoveType.REDEAL, MoveType.DRAW_CARDS].includes(record.move):
        let stockMovesCount = 0
        let drawnCards: null | number = null
        for (
          let j = i;
          j < records.length && [MoveType.REDEAL, MoveType.DRAW_CARDS].includes(records[j][1].move);
          j++
        ) {
          const stockMove = records[j][1]
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
            timeDeltas: records.slice(i, i + stockMovesCount).map((recordToCompact) => recordToCompact[1].timeDelta),
          })
          i += stockMovesCount - 1
        } else {
          compactedRecords.push(record)
        }
        break
      case record.move === MoveType.UNDO:
        let undoCount = 1
        for (let j = i + 1; j < records.length && records[j][1].move === MoveType.UNDO; j++) {
          undoCount++
        }
        if (undoCount > 2) {
          compactedRecords.push({
            move: CompactMoveType.MULTIPLE_UNDO,
            timeDeltas: records.slice(i, i + undoCount).map((recordToCompact) => recordToCompact[1].timeDelta),
          })
          i += undoCount - 1
        } else {
          compactedRecords.push(record)
        }
        break
      case record.move === MoveType.PAUSE && i < records.length - 1 && records[i + 1][1].move === MoveType.RESUME:
        compactedRecords.push({
          duration: records[i + 1][1].timeDelta,
          move: CompactMoveType.BREAK,
          timeDelta: record.timeDelta,
        })
        i++
        break
      case record.move === MoveType.TABLEAU_TO_FOUNDATION || record.move === MoveType.TABLEAU_TO_TABLEAU:
        const sourcePileIndex = record.move === MoveType.TABLEAU_TO_FOUNDATION ?
          record.pileIndex
        :
          (record.move === MoveType.TABLEAU_TO_TABLEAU ? record.sourcePileIndex : null)
        const nextRecord = records[i + 1]?.[1]
        if (nextRecord?.move === MoveType.REVEAL_TABLEAU_CARD && nextRecord.pileIndex === sourcePileIndex) {
          if (record.move === MoveType.TABLEAU_TO_FOUNDATION) {
            compactedRecords.push({
              cardRevealTimeDelta: nextRecord.timeDelta,
              move: CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION,
              pileIndex: record.pileIndex,
              timeDelta: record.timeDelta,
            })
          } else if (record.move === MoveType.TABLEAU_TO_TABLEAU) { // typecast
            const pile = records[i][0].tableau.piles[record.sourcePileIndex]
            const {side, ...topMovedCard} = pile.cards[record.topMovedCardIndex]
            compactedRecords.push({
              cardRevealingTimeDelta: nextRecord.timeDelta,
              move: CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU,
              targetPileIndex: record.targetPileIndex,
              timeDelta: record.timeDelta,
              topMovedCard,
            })
          }
          i++
        } else if (record.move === MoveType.TABLEAU_TO_TABLEAU) {
          const pile = records[i][0].tableau.piles[record.sourcePileIndex]
          const {side, ...topMovedCard} = pile.cards[record.topMovedCardIndex]
          compactedRecords.push({
            move: CompactMoveType.TABLEAU_TO_TABLEAU,
            targetPileIndex: record.targetPileIndex,
            timeDelta: record.timeDelta,
            topMovedCard,
          })
        } else {
          compactedRecords.push(record)
        }
        break
      default:
        compactedRecords.push(record)
        break
    }
  }
  return compactedRecords
}

function compactHistoryRecordTimestamp(
  record: IGame['history'][0][1],
  previousLogicalTimestamp: number,
): CompactTimeHistoryRecord {
  const {logicalTimestamp, ...move} = record
  return {
    ...move,
    timeDelta: logicalTimestamp - previousLogicalTimestamp,
  }
}

function expandHistoryRecords(
  initialState: IGame,
  records: readonly CompactHistoryRecord[],
): IGame {
  const historyRecords: Array<IGame['history'][0][1]> = []
  let game = initialState

  for (const record of records) {
    const pendingHistoryRecords: CompactTimeHistoryRecord[] = []

    switch (record.move) {
      case CompactMoveType.MULTIPLE_STOCK_MANIPULATIONS:
        pendingHistoryRecords.push(...record.timeDeltas.map<CompactTimeHistoryRecord>((timeDelta) => ({
          drawnCards: record.drawnCards,
          move: MoveType.DRAW_CARDS, // Will be changed to REDEAL where needed when replaying history of the game
          timeDelta,
        })))
        break
      case CompactMoveType.MULTIPLE_UNDO:
        pendingHistoryRecords.push(...record.timeDeltas.map<CompactTimeHistoryRecord>((timeDelta) => ({
          move: MoveType.UNDO,
          timeDelta,
        })))
        break
      case CompactMoveType.BREAK:
        pendingHistoryRecords.push(
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
      case CompactMoveType.CARD_REVEALING_TABLEAU_TO_FOUNDATION:
        pendingHistoryRecords.push(
          {
            move: MoveType.TABLEAU_TO_FOUNDATION,
            pileIndex: record.pileIndex,
            timeDelta: record.timeDelta,
          },
          {
            move: MoveType.REVEAL_TABLEAU_CARD,
            pileIndex: record.pileIndex,
            timeDelta: record.cardRevealTimeDelta,
          },
        )
        break
      case CompactMoveType.CARD_REVEALING_TABLEAU_TO_TABLEAU:
        {
          const {cardIndex: topMovedCardIndex, pileIndex: sourcePileIndex} = findCardInTableau(
            record.topMovedCard,
            game.state.tableau,
          )
          pendingHistoryRecords.push(
            {
              move: MoveType.TABLEAU_TO_TABLEAU,
              sourcePileIndex,
              targetPileIndex: record.targetPileIndex,
              timeDelta: record.timeDelta,
              topMovedCardIndex,
            },
            {
              move: MoveType.REVEAL_TABLEAU_CARD,
              pileIndex: sourcePileIndex,
              timeDelta: record.cardRevealingTimeDelta,
            },
          )
        }
        break
      case CompactMoveType.TABLEAU_TO_TABLEAU:
        {
          const {cardIndex: topMovedCardIndex, pileIndex: sourcePileIndex} = findCardInTableau(
            record.topMovedCard,
            game.state.tableau,
          )
          pendingHistoryRecords.push({
            move: MoveType.TABLEAU_TO_TABLEAU,
            sourcePileIndex,
            targetPileIndex: record.targetPileIndex,
            timeDelta: record.timeDelta,
            topMovedCardIndex,
          })
        }
        break
      default:
        pendingHistoryRecords.push(record)
        break
    }

    for (const pendingRecord of pendingHistoryRecords) {
      const expandedRecord = expandHistoryRecordTimestamp(
        pendingRecord,
        lastItemOrNull(historyRecords)?.logicalTimestamp ?? 0,
      )
      historyRecords.push(expandedRecord)

      if (record.move === MoveType.DRAW_CARDS && !game.state.stock.cards.length) {
        game = executeMove(game, {
          move: MoveType.REDEAL,
        })
      } else {
        game = executeMove(game, expandedRecord)
      }
      lastItem(game.history)[1].logicalTimestamp = expandedRecord.logicalTimestamp
    }
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

function findCardInTableau(card: CompactCard, tableau: ITableau): {pileIndex: number, cardIndex: number} {
  for (let pileIndex = 0; pileIndex < tableau.piles.length; pileIndex++) {
    const pile = tableau.piles[pileIndex]
    for (let cardIndex = 0; cardIndex < pile.cards.length; cardIndex++) {
      const otherCard = pile.cards[cardIndex]
      if (card.rank === otherCard.rank && card.color === otherCard.color) {
        return {
          cardIndex,
          pileIndex,
        }
      }
    }
  }

  throw new Error(`The provided card (${JSON.stringify(card)}) is not present in the provided tableau`)
}
