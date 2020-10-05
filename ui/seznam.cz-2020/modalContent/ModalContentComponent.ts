import * as React from 'react'
import CardBackfaceStyle from '../CardBackfaceStyle'
import DeskStyle from '../DeskStyle'
import {Type} from '../ModalContentHost'
import {StockPosition} from '../storage/SettingsStorage'
import {Statistics} from '../storage/StatisticsStorage'
import WinnableGamesProvider from '../WinnableGamesProvider'

export interface IModalContentComponentStaticProps {
  readonly title: null | string,
  readonly type: Type,
}

type ModalContentComponent = React.ComponentType<IModalContentComponentProps> & IModalContentComponentStaticProps
export default ModalContentComponent

export interface IModalContentComponentProps {
  gameplayStats: Statistics
  deskStyle: DeskStyle
  cardBackFaceStyle: CardBackfaceStyle
  stockPosition: StockPosition
  automaticHintEnabled: boolean
  automaticCompletionEnabled: boolean
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
  onSetAutomaticCompletionEnabled(enabled: boolean): void
}
