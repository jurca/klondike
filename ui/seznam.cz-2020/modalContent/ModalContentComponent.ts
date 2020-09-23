import * as React from 'react'
import CardBackfaceStyle from '../CardBackfaceStyle'
import DeskStyle from '../DeskStyle'
import {Type} from '../ModalContentHost'
import {StockPosition} from '../storage/SettingsStorage'
import WinnableGamesProvider from '../WinnableGamesProvider'

export interface IModalContentComponentStaticProps {
  readonly title: null | string,
  readonly type: Type,
}

type ModalContentComponent = React.ComponentType<IModalContentComponentProps> & IModalContentComponentStaticProps
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
  defaultTableauPiles: number,
  winnableGamesProvider: WinnableGamesProvider,
  onNewGame(drawnCards: 1 | 3): void
  onShowContent(newContent: ModalContentComponent, stack: boolean): void
  onLeaveCurrentModalContent(): void
  onCloseModalContent(): void
  onResumePreviousGame(): void
  onSetDeskStyle(newStyle: DeskStyle): void
  onSetCardBackFaceStyle(newBackFaceStyle: CardBackfaceStyle): void
  onSetStockPosition(newPosition: StockPosition): void
  onSetAutomaticHintEnabled(enabled: boolean): void
}
