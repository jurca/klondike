import * as React from 'react'
import CardBackfaceStyle from '../CardBackfaceStyle'
import DeskStyle from '../DeskStyle'
import {Type} from '../ModalContentHost'
import {StockPosition} from '../storage/SettingsStorage'

type ModalContentComponent = React.ComponentType<IModalContentComponentProps> & {
  readonly title: null | string,
  readonly type: Type,
}
export default ModalContentComponent

export interface IGameplayStats {
  wonGamesCount: number
  shortestWonGameDuration: number
  longestWonGameDuration: number
  leastMovesToVictory: number
  mostMovesToVictory: number
  gamesWonWithoutUndoCount: number
}

export interface IModalContentComponentProps {
  gameplayStats: {
    [drawnCards in 1 | 3]: IGameplayStats
  }
  deskStyle: DeskStyle
  cardBackFaceStyle: CardBackfaceStyle
  stockPosition: StockPosition
  automaticHintEnabled: boolean
  onNewGame(drawnCards: 1 | 3): void
  onShowContent(newContent: ModalContentComponent, stack: boolean): void
  onCloseModalContent(): void
  onResumePreviousGame(): void
  onSetDeskStyle(newStyle: DeskStyle): void
  setCardBackFaceStyle(newBackFaceStyle: CardBackfaceStyle): void
  setStockPosition(newPosition: StockPosition): void
  setAutomaticHintEnabled(enabled: boolean): void
}