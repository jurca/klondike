import {getGameplayDuration, getMoveCount, IGame, isVictory} from '../../../game/Game'
import {MoveType} from '../../../game/Move'
import IStorage, {Serializable} from './IStorage'

export interface IGameplayStatistics {
  readonly wonGamesCount: number
  readonly shortestWonGameDuration: number
  readonly longestWonGameDuration: number
  readonly leastMovesToVictory: number
  readonly mostMovesToVictory: number
  readonly gamesWonWithoutUndoCount: number
}

export type Statistics = {
  readonly [drawnCards in 1 | 3]: IGameplayStatistics
}

const EMPTY_GAMEPLAY_STATISTICS: IGameplayStatistics = {
  gamesWonWithoutUndoCount: 0,
  leastMovesToVictory: 0,
  longestWonGameDuration: 0,
  mostMovesToVictory: 0,
  shortestWonGameDuration: 0,
  wonGamesCount: 0,
}

enum StorageKey {
  STATISTICS = 'StatisticsStorage.STATISTICS',
}

export default class StatisticsStorage {
  constructor(
    private readonly storage: IStorage,
  ) {
  }

  public getStatistics(): Promise<Statistics> {
    return this.storage.get(StorageKey.STATISTICS).then((storedData) => {
      if (
        !storedData ||
        typeof storedData !== 'object' ||
        storedData instanceof Array ||
        !('1' in storedData) ||
        !('3' in storedData)
      ) {
        return {
          1: EMPTY_GAMEPLAY_STATISTICS,
          3: EMPTY_GAMEPLAY_STATISTICS,
        }
      }

      return storedData as unknown as Statistics
    })
  }

  public addGame(game: IGame): Promise<Statistics> {
    if (!isVictory(game)) {
      throw new Error('The provided game is not won yet, only won games can be added to the statistics')
    }
    if (![1, 3].includes(game.rules.drawnCards)) {
      throw new Error(
        `Only games with 1 or 3 drawn cards per draw can be added, the provided game draws ${game.rules.drawnCards} ` +
        'cards per draw',
      )
    }

    return this.getStatistics().then((statistics) => {
      const drawnCards = game.rules.drawnCards as 1 | 3
      const gameplayStatistics = statistics[drawnCards]
      const undoMoveUsed = game.history.some(
        ([, move]) => move.move === MoveType.UNDO,
      )
      const gameplayDuration = getGameplayDuration(game)
      const movesCount = getMoveCount(game)

      const updatedStatistics = {
        ...statistics,
        [drawnCards]: {
          gamesWonWithoutUndoCount: gameplayStatistics.gamesWonWithoutUndoCount + (undoMoveUsed ? 0 : 1),
          leastMovesToVictory:
            (gameplayStatistics.leastMovesToVictory ?
              Math.min(gameplayStatistics.leastMovesToVictory, movesCount)
            :
              movesCount
            ),
          longestWonGameDuration: Math.max(gameplayStatistics.longestWonGameDuration, gameplayDuration),
          mostMovesToVictory: Math.max(gameplayStatistics.mostMovesToVictory, movesCount),
          shortestWonGameDuration:
            (gameplayStatistics.shortestWonGameDuration ?
              Math.min(gameplayStatistics.shortestWonGameDuration, gameplayDuration)
            :
              gameplayDuration
            ),
          wonGamesCount: gameplayStatistics.wonGamesCount + 1,
        },
      }

      return this.storage.set(StorageKey.STATISTICS, updatedStatistics as unknown as Serializable).then(
        () => updatedStatistics,
      )
    })
  }
}
