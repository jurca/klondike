import IStorage, {Serializable} from './IStorage'

// The Volatile Storage is meant to behave like DOM storage (apart from persistency)
const GLOBAL_STORAGE: {[key: string]: undefined | Serializable} = {}

export default class VolatileStorage implements IStorage {
  private readonly storage: {[key: string]: undefined | Serializable} = GLOBAL_STORAGE

  constructor(
    private readonly keyPrefix: string,
  ) {
  }

  public get(key: string): Promise<Serializable> {
    const value = this.storage[this.keyPrefix + key]
    return Promise.resolve(this.clone(value === undefined ? null : value))
  }

  public set(key: string, value: Serializable): Promise<void> {
    this.storage[this.keyPrefix + key] = this.clone(value)
    return Promise.resolve()
  }

  public delete(key: string): Promise<void> {
    delete this.storage[this.keyPrefix + key]
    return Promise.resolve()
  }

  private clone(value: Serializable): Serializable {
    return JSON.parse(JSON.stringify(value))
  }
}
