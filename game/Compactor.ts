import {DECK, ICard} from './Card'
import {IDesk} from './Desk'
import {createNewGame, executeMove, IGame, INewGameRules, undoLastMove} from './Game'
import {Move} from './Move'
import {lastItem, lastItemOrNull} from './util'

export type CompactCard = Omit<ICard, 'side'>

export type CompactHistoryRecord = Move & {
  readonly timeDelta: number,
}

export interface ICompactGame {
  readonly deck: readonly CompactCard[]
  readonly rules: INewGameRules,
  readonly startTime: number,
  readonly history: readonly CompactHistoryRecord[]
  readonly future: readonly CompactHistoryRecord[]
}

export function compact(game: IGame): ICompactGame {
  const initialState = game.history.length ? game.history[0][0] : game.state
  const cardsDeck = compactDeckFromDesk(initialState)
  const compactedHistoryRecords = game.history.concat(game.future).map(
    (record, index, records) => compactHistoryRecord(
      record,
      records[index - 1]?.[1].logicalTimestamp ?? game.startTime.logicalTimestamp,
    ),
  )

  return {
    deck: cardsDeck,
    future: compactedHistoryRecords.slice(game.history.length),
    history: compactedHistoryRecords.slice(0, game.history.length),
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
  const expandedHistoryRecords: Array<IGame['history'][0][1]> = []
  for (const record of game.history.concat(game.future)) {
    expandedHistoryRecords.push(expandHistoryRecord(
      record,
      lastItemOrNull(expandedHistoryRecords)?.logicalTimestamp ?? 0,
    ))
  }

  const finalState = expandedHistoryRecords.reduce(
    (gameState: IGame, historyRecord) => {
      const updatedGame = executeMove(gameState, historyRecord)
      lastItem(updatedGame.history)[1].logicalTimestamp = historyRecord.logicalTimestamp
      return updatedGame
    },
    initialState,
  )
  const expandedGame = game.future.reduce((gameState) => undoLastMove(gameState), finalState)

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
  }
  reconstructedDeck.push(...remainingDeckCards)
  return reconstructedDeck
}

function compactHistoryRecord(record: IGame['history'][0], previousLogicalTimestamp: number): CompactHistoryRecord {
  const {logicalTimestamp, ...move} = record[1]
  return {
    ...move,
    timeDelta: logicalTimestamp - previousLogicalTimestamp,
  }
}

function expandHistoryRecord(record: CompactHistoryRecord, previousLogicalTimestamp: number): IGame['history'][0][1] {
  const {timeDelta, ...move} = record
  return {
    ...move,
    logicalTimestamp: previousLogicalTimestamp + timeDelta,
  }
}
