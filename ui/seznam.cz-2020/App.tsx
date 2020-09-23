import * as React from 'react'
import {ICard} from '../../game/Card'
import {IGame} from '../../game/Game'
import {Move} from '../../game/Move'
import {serialize} from '../../game/Serializer'
import style from './app.css'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import {GREEN_S, GREEN_S_TILES, IDeskSkin, RED_S_TILES, TEAL_COLORS} from './deskSkins'
import MobilePhoneHeader from './MobilePhoneHeader'
import {IModalContentComponentStaticProps} from './modalContent/ModalContentComponent'
import ModalContentHost, {State, Type} from './ModalContentHost'
import SettingsContext from './settingsContext'
import {StockPosition} from './storage/SettingsStorage'

interface IProps {
  defaultTableauPiles: number
  game: null | IGame
  hint: null | ICard
  cardBackFace: CardBackfaceStyle
  deskSkin: IDeskSkin
  automaticHintDelay: number,
  stockPosition: StockPosition,
  modalContent: null | React.ComponentType & IModalContentComponentStaticProps,
  isModalContentNested: boolean,
  onMove: (move: Move) => void
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onNewGame: () => void
  onShowHint: () => void
  onDeskStyleChange: (newDeskStyleName: string) => void
  onCardStyleChange: (newCardStyle: CardBackfaceStyle) => void
  onBotMove: () => void
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
    automaticHintDelay,
    stockPosition,
    modalContent,
    isModalContentNested,
    ...callbacks
  }: IProps,
) {
  const {onMove, onNewGame, onRedo, onReset, onShowHint, onUndo, onImport, onShowSettings} = callbacks
  const settingsContextValue = React.useMemo(() => ({...deskSkin, cardBackFace}), [deskSkin, cardBackFace])
  const deskStyleName = React.useMemo(() => {
    switch (deskSkin) {
      case GREEN_S:
        return 'GREEN_S'
      case GREEN_S_TILES:
        return 'GREEN_S_TILES'
      case RED_S_TILES:
        return 'RED_S_TILES'
      case TEAL_COLORS:
        return 'TEAL_COLORS'
      default:
        return ''
    }
  }, [deskSkin])
  const deskStyleChangeListener = React.useMemo(
    () => (event: React.ChangeEvent<HTMLSelectElement>) => callbacks.onDeskStyleChange(event.target.value),
    [callbacks.onDeskStyleChange],
  )
  const cardStyleChangeListener = React.useMemo(
    () => (event: React.ChangeEvent<HTMLSelectElement>) => callbacks.onCardStyleChange(
      event.target.value as CardBackfaceStyle,
    ),
    [callbacks.onCardStyleChange],
  )
  const previousModalContent = usePrevious(modalContent)

  return (
    <div className={style.app}>
      <div className={style.toolbar}>
        <button onClick={onRedo}>-&gt;</button>
        <button onClick={onReset}>reset</button>
        &nbsp;|&nbsp;
        Pozadí stolu: <select value={deskStyleName} onChange={deskStyleChangeListener}>
          <option value='GREEN_S'>zelené S</option>
          <option value='TEAL_COLORS'>tyrkysové symboly</option>
          <option value='GREEN_S_TILES'>zelená mříž</option>
          <option value='RED_S_TILES'>rudá mříž</option>
        </select>
        Pozadí karet: <select value={cardBackFace} onChange={cardStyleChangeListener}>
          <option value={CardBackfaceStyle.SeznamLogo}>Seznam logo</option>
          <option value={CardBackfaceStyle.SWithColors}>"S" s symboly</option>
          <option value={CardBackfaceStyle.Dog}>Krasty</option>
          <option value={CardBackfaceStyle.Colors}>Symboly</option>
        </select>
        &nbsp;|&nbsp;
        <button onClick={callbacks.onBotMove}>bot</button>
        <button onClick={onExport}>export</button>
        <button onClick={onImport}>import</button>
      </div>
      <MobilePhoneHeader onLeave={() => alert('Zatím není implementováno')} onShowSettings={onShowSettings}/>
      <div className={style.primaryContent}>
        <SettingsContext.Provider value={settingsContextValue}>
          <Desk
            defaultTableauPiles={defaultTableauPiles}
            game={game}
            hint={hint}
            stockPosition={stockPosition}
            previewMode={false}
            onMove={onMove}
            onNewGame={onNewGame}
            onPauseGame={() => alert('Zatím není implementováno')}
            onShowHint={onShowHint}
            onShowSettings={onShowSettings}
            onUndo={onUndo}
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
