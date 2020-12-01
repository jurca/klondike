import * as React from 'react'
import {createNewGame, IGame} from '../../../game/Game'
import CardBackfaceStyle from '../CardBackfaceStyle'
import Desk from '../Desk'
import {DESK_SKINS, IDeskSkin} from '../deskSkins'
import DeskStyle from '../DeskStyle'
import {Type} from '../ModalContentHost'
import SettingsContext, {ISettingsContext} from '../settingsContext'
import {StockPosition} from '../storage/SettingsStorage'
import WinnableGamesProvider from '../WinnableGamesProvider'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import styles from './themePreview.css'

const DEMO_GAME_DRAWN_CARDS = 1

interface IProps {
  demoGame: IGame
  theme: ISettingsContext
  stockPosition: StockPosition
  confirmButtonLabel: string
  onConfirm: () => void
}

const NOOP = () => undefined

function ThemePreview(props: IProps) {
  return (
    <div className={styles.themePreview}>
      <SettingsContext.Provider value={props.theme}>
        <Desk
          defaultTableauPiles={0}
          game={props.demoGame}
          hint={null}
          stockPosition={props.stockPosition}
          previewMode={true}
          isFullscreenActive={true}
          onMove={NOOP}
          onNewGame={NOOP}
          onPauseGame={NOOP}
          onShowHint={NOOP}
          onShowSettings={NOOP}
          onSetFullscreen={NOOP}
        />
      </SettingsContext.Provider>
      <div className={styles.overlay}/>
      <button className={styles.confirmButton} onClick={props.onConfirm}>
        {props.confirmButtonLabel}
      </button>
    </div>
  )
}

export function createThemePreviewFactory(
  tableauPiles: number,
  gameProvider: WinnableGamesProvider,
  title: string,
  confirmButtonLabel: string,
): (
  deskStyle: DeskStyle,
  cardBackFaceStyle: CardBackfaceStyle,
  onConfirm: () => void,
) => ModalContentComponent {
  return createThemePreview.bind(null, tableauPiles, gameProvider, title, confirmButtonLabel)
}

function createThemePreview(
  tableauPiles: number,
  gameProvider: WinnableGamesProvider,
  title: string,
  confirmButtonLabel: string,
  deskStyle: DeskStyle,
  cardBackFaceStyle: CardBackfaceStyle,
  onConfirm: () => void,
): ModalContentComponent {
  const demoGame = createNewGame(
    {allowNonKingToEmptyPileTransfer: false, drawnCards: DEMO_GAME_DRAWN_CARDS, tableauPiles},
    gameProvider.getWinnableCardDeck(DEMO_GAME_DRAWN_CARDS),
  )
  const deskSkin: IDeskSkin = (() => {
    switch (deskStyle) {
      case DeskStyle.GREEN_S:
        return DESK_SKINS.GREEN_S
      case DeskStyle.TEAL_COLORS:
        return DESK_SKINS.TEAL_COLORS
      case DeskStyle.GREEN_S_TILES:
        return DESK_SKINS.GREEN_S_TILES
      case DeskStyle.RED_S_TILES:
        return DESK_SKINS.RED_S_TILES
      default:
        throw new Error(`Unsupported desk style: ${deskStyle}`)
    }
  })()
  const theme: ISettingsContext = {
    ...deskSkin,
    cardBackFace: cardBackFaceStyle,
  }

  return Object.assign(function ConfiguredThemePreview(props: IModalContentComponentProps): React.ReactElement {
    return (
      <ThemePreview
        demoGame={demoGame}
        theme={theme}
        stockPosition={props.stockPosition}
        confirmButtonLabel={confirmButtonLabel}
        onConfirm={onConfirm}
      />
    )
  }, {
    title,
    type: Type.DRAWER,
  })
}
