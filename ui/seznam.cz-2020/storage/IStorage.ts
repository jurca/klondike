export type Serializable = null | boolean | number | string | Serializable[] | {[key: string]: Serializable}

export default interface IStorage {
  get(key: string): Promise<Serializable>
  set(key: string, value: Serializable): Promise<void>
  delete(key: string): Promise<void>
}
