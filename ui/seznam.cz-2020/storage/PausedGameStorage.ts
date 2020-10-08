import {IGame} from '../../../game/Game'
import {deserialize, serialize} from '../../../game/Serializer_v3'
import IStorage from './IStorage'

enum StorageKey {
  GAME = 'PausedGameStorage.GAME',
}

export default class PausedGameStorage {
  constructor(
    private readonly storage: IStorage,
  ) {
  }

  public getPausedGame(): Promise<null | IGame> {
    return this.storage.get(StorageKey.GAME).then(
      (serializedGame) => typeof serializedGame === 'string' ? deserialize(serializedGame) : null,
    )
  }

  public setPausedGame(game: IGame): Promise<void> {
    return this.storage.set(StorageKey.GAME, serialize(game))
  }

  public deletePausedGame(): Promise<void> {
    return this.storage.delete(StorageKey.GAME)
  }
}
