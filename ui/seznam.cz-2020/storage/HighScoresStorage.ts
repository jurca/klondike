import {getGameplayDuration, IGame, isVictory, resetGame} from '../../../game/Game'
import {serializeDeckFromDesk} from '../../../game/Serializer_v3'
import IStorage, {Serializable} from './IStorage'

export interface IHighScoreEntry {
  drawnCards: number,
  serializedDeck: string,
  startTimestamp: number,
  gameplayDuration: number,
  movesCount: number,
}

const STORAGE_KEY = 'HighScoresTable'

export default class HighScoresStorage {
  constructor(
    private readonly storage: IStorage,
    private readonly maxEntries: number,
  ) {
    if (!Number.isSafeInteger(maxEntries) || maxEntries <= 0) {
      throw new TypeError(`The maxEntries must be a positive safe integer, ${maxEntries} was provided`)
    }
  }

  public async getHighScores(): Promise<IHighScoreEntry[]> {
    const storedValue = await this.storage.get(STORAGE_KEY)
    return ((storedValue || []) as unknown as IHighScoreEntry[]).slice(0, this.maxEntries)
  }

  public async addGame(game: IGame): Promise<void> {
    const highScoreTable = await this.getHighScores()
    highScoreTable.push(this.createEntry(game))
    const tableToStore = highScoreTable.sort(this.entryComparator).slice(0, this.maxEntries)
    return this.storage.set(STORAGE_KEY, tableToStore as unknown as Serializable) // index signature issue
  }

  private createEntry(game: IGame): IHighScoreEntry {
    if (!isVictory(game)) {
      throw new Error('The provided game is not won')
    }

    return {
      drawnCards: game.rules.drawnCards,
      gameplayDuration: getGameplayDuration(game),
      movesCount: game.history.length,
      serializedDeck: serializeDeckFromDesk(resetGame(game).state),
      startTimestamp: game.startTime.absoluteTimestamp,
    }
  }

  private entryComparator = (entry1: IHighScoreEntry, entry2: IHighScoreEntry): number => {
    return entry1.movesCount - entry2.movesCount || entry1.gameplayDuration - entry2.gameplayDuration
  }
}
