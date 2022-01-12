import * as sbrowserApis from '@seznam/seznam.cz-browser-game-module-api'
import IStorage, {Serializable} from './IStorage'

export default class SBrowserStorage implements IStorage {
  private storage: sbrowserApis.Storage

  constructor() {
    const storage = sbrowserApis.getStorage()
    if (!storage) {
      throw new Error('The storage is not available')
    }
    this.storage = storage
  }

  get(key: string): Promise<Serializable> {
    return this.storage.get(key) as Promise<Serializable>
  }

  set(key: string, value: Serializable): Promise<void> {
    return this.storage.set(key, value)
  }

  delete(key: string): Promise<void> {
    return this.storage.delete(key)
  }
}
