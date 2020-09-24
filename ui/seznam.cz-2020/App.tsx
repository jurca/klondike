import * as React from 'react'
import {ICard} from '../../game/Card'
import {IGame} from '../../game/Game'
import {Move} from '../../game/Move'
import {serialize} from '../../game/Serializer'
import style from './app.css'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import {IDeskSkin} from './deskSkins'
import GameIconsBackground from './GameIconsBackground'
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
  onUndo: () => void
  onReset: () => void
  onNewGame: () => void
  onShowHint: () => void
  onBotMove: () => void
  onPauseGame: () => void
  onImport: () => void
  onLeaveCurrentModalContent: () => void
  onCloseModalContent: () => void
  onShowSettings: () => void
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
  const {onMove, onNewGame, onReset, onShowHint, onUndo, onImport, onPauseGame, onShowSettings} = callbacks
  const settingsContextValue = React.useMemo(() => ({...deskSkin, cardBackFace}), [deskSkin, cardBackFace])
  const previousModalContent = usePrevious(modalContent)

  return (
    <div className={style.app}>
      {process.env.NODE_ENV === 'development' &&
        <div className={style.toolbar}>
          <button onClick={onReset}>reset</button>
          <button onClick={callbacks.onBotMove}>bot</button>
          <button onClick={onExport}>export</button>
          <button onClick={onImport}>import</button>
        </div>
      }
      <MobilePhoneHeader onLeave={() => alert('Zatím není implementováno')} onShowSettings={onShowSettings}/>
      <div className={style.primaryContent}>
        <SettingsContext.Provider value={settingsContextValue}>
          {isPaused ?
            <GameIconsBackground/>
          :
            <Desk
              defaultTableauPiles={defaultTableauPiles}
              game={game}
              hint={hint}
              stockPosition={stockPosition}
              previewMode={false}
              onMove={onMove}
              onNewGame={onNewGame}
              onPauseGame={onPauseGame}
              onShowHint={onShowHint}
              onShowSettings={onShowSettings}
              onUndo={onUndo}
            />
          }
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
    console.log(game && serialize(game)) // tslint:disable-line:no-console
  }
}

function usePrevious<T>(value: T): undefined | T {
  const ref = React.useRef<T>()
  React.useEffect(() => {
    ref.current = value
  })
  return ref.current
}
