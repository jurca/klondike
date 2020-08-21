import CardBackfaceStyle from '../CardBackfaceStyle'
import {DESK_SKINS, IDeskSkin} from '../deskSkins'
import IStorage from './IStorage'

export enum StockPosition {
  LEFT = 'StockPosition.LEFT',
  RIGHT = 'StockPosition.RIGHT',
}

enum StorageKey {
  AUTOMATIC_HINT_DELAY = 'SettingsStorage.AUTOMATIC_HINT_DELAY',
  CARD_BACK_FACE_STYLE = 'SettingsStorage.CARD_BACK_FACE_STYLE',
  DESK_SKIN = 'SettingsStorage.DESK_SKIN',
  STOCK_POSITION = 'SettingsStorage.STOCK_POSITION',
}

export default class SettingsStorage {
  constructor(
    private readonly storage: IStorage,
  ) {
  }

  public getCardBackFaceStyle(): Promise<CardBackfaceStyle> {
    return this.storage.get(StorageKey.CARD_BACK_FACE_STYLE).then(
      (cardStyle) => cardStyle ? cardStyle as CardBackfaceStyle : CardBackfaceStyle.SeznamLogo,
    )
  }

  public getDeskSkin(): Promise<IDeskSkin> {
    return this.storage.get(StorageKey.DESK_SKIN).then(
      (deskSkinName) => deskSkinName && deskSkinName in DESK_SKINS ?
        DESK_SKINS[deskSkinName as keyof typeof DESK_SKINS] as IDeskSkin
      :
        DESK_SKINS.GREEN_S_TILES,
    )
  }

  public setCardBackFaceStyle(backFaceStyle: CardBackfaceStyle): Promise<void> {
    return this.storage.set(StorageKey.CARD_BACK_FACE_STYLE, backFaceStyle)
  }

  public setDeskSkin(deskSkin: IDeskSkin): Promise<void> {
    const deskSkinName = (Object.keys(DESK_SKINS) as Array<keyof typeof DESK_SKINS>).find(
      (potentialSkinName) => deskSkin === DESK_SKINS[potentialSkinName],
    )
    if (!deskSkinName) {
      throw new Error(`Unknown desk skin, use one of the skins exported by the deskSkins module`)
    }
    return this.storage.set(StorageKey.DESK_SKIN, deskSkinName)
  }

  public getAutomaticHintDelay(): Promise<number> {
    return this.storage.get(StorageKey.AUTOMATIC_HINT_DELAY).then(
      (hintDelay) => parseInt(typeof hintDelay === 'string' ? hintDelay : '', 10) || 0,
    )
  }

  public setAutomaticHintDelay(hintDelay: number): Promise<void> {
    return this.storage.set(StorageKey.AUTOMATIC_HINT_DELAY, hintDelay)
  }

  public getStockPosition(): Promise<StockPosition> {
    const positions = Object.values(StockPosition)
    return this.storage.get(StorageKey.STOCK_POSITION).then(
      (position) => positions.includes(position as any) ? position as StockPosition : StockPosition.LEFT,
    )
  }

  public setStockPosition(stockPosition: StockPosition): Promise<void> {
    return this.storage.set(StorageKey.STOCK_POSITION, stockPosition)
  }
}
