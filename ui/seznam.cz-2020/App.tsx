import * as React from 'react'
import {ICard} from '../../game/Card'
import {compact} from '../../game/Compactor'
import {IGame} from '../../game/Game'
import {Move} from '../../game/Move'
import {serialize as serialize2} from '../../game/Serializer'
import {serialize as serialize3} from '../../game/Serializer_v3'
import style from './app.css'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import {IDeskSkin} from './deskSkins'
import MobilePhoneHeader from './MobilePhoneHeader'
import {IModalContentComponentStaticProps} from './modalContent/ModalContentComponent'
import ModalContentHost, {State, Type} from './ModalContentHost'
import SettingsContext from './settingsContext'
import {StockPosition} from './storage/SettingsStorage'

interface IProps {
  defaultTableauPiles: number
  game: null | IGame
  hint: null | ICard
  isPaused: boolean
  cardBackFace: CardBackfaceStyle
  deskSkin: IDeskSkin
  stockPosition: StockPosition
  modalContent: null | React.ComponentType & IModalContentComponentStaticProps
  isModalContentNested: boolean
  onMove: (move: Move) => void
  onReset: () => void
  onNewGame: () => void
  onShowHint: () => void
  onBotMove: () => void
  onPauseGame: () => void
  onLeaveCurrentModalContent: () => void
  onCloseModalContent: () => void
  onShowSettings: () => void
  onImport: () => void
  onExitApp: () => void
}

export default function App(
  {
    defaultTableauPiles,
    game,
    cardBackFace,
    deskSkin,
    hint,
    isPaused,
    stockPosition,
    modalContent,
    isModalContentNested,
    ...callbacks
  }: IProps,
) {
  const {onMove, onNewGame, onReset, onShowHint, onPauseGame, onShowSettings, onImport, onExitApp} = callbacks
  const settingsContextValue = React.useMemo(() => ({...deskSkin, cardBackFace}), [deskSkin, cardBackFace])
  const previousModalContent = usePrevious(modalContent)
  const [isFullscreenActive, setFullscreen] = React.useState(false)

  return (
    <div className={style.app}>
      {process.env.NODE_ENV === 'development' &&
        <div className={style.toolbar}>
          <button onClick={onReset}>reset</button>
          <button onClick={callbacks.onBotMove}>bot</button>
          <button onClick={onImport}>import</button>
          <button onClick={onExport}>export v2</button>
          <button onClick={onExport3}>export v3</button>
          <button onClick={onCompact}>compact</button>
        </div>
      }
      {!isFullscreenActive &&
        <MobilePhoneHeader onLeave={onExitApp} onShowSettings={onShowSettings}/>
      }
      <div className={style.primaryContent}>
        <SettingsContext.Provider value={settingsContextValue}>
          <Desk
            defaultTableauPiles={defaultTableauPiles}
            game={game}
            hint={hint}
            stockPosition={stockPosition}
            previewMode={isPaused}
            isFullscreenActive={isFullscreenActive}
            onMove={onMove}
            onNewGame={onNewGame}
            onPauseGame={onPauseGame}
            onShowHint={onShowHint}
            onShowSettings={onShowSettings}
            onSetFullscreen={setFullscreen}
          />
          <ModalContentHost
            state={modalContent ? State.OPEN : State.CLOSED}
            type={modalContent?.type ?? previousModalContent?.type ?? Type.FLOATING}
            isNested={isModalContentNested}
            header={modalContent?.title ?? null}
            onClose={callbacks.onCloseModalContent}
            onReturn={callbacks.onLeaveCurrentModalContent}
          >
            {React.createElement(modalContent || previousModalContent || 'div')}
          </ModalContentHost>
        </SettingsContext.Provider>
      </div>
    </div>
  )

  function onExport(): void {
    console.log(game && serialize2(game)) // tslint:disable-line:no-console
  }

  function onCompact(): void {
    const compactGameRepresentation = game && compact(game)
    console.log(compactGameRepresentation) // tslint:disable-line:no-console
    console.log(JSON.stringify(compactGameRepresentation)) // tslint:disable-line:no-console
  }

  function onExport3() {
    console.log(game && serialize3(game)) // tslint:disable-line:no-console
  }
}

function usePrevious<T>(value: T): undefined | T {
  const ref = React.useRef<T>()
  React.useEffect(() => {
    ref.current = value
  })
  return ref.current
}
