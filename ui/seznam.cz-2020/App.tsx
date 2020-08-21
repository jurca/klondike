import * as React from 'react'
import {ICard} from '../../game/Card'
import {IGame} from '../../game/Game'
import {Move} from '../../game/Move'
import {serialize} from '../../game/Serializer'
import style from './app.css'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import {GREEN_S, GREEN_S_TILES, IDeskSkin, RED_S_TILES, TEAL_COLORS} from './deskSkins'
import GameStats from './GameStats'
import SettingsContext from './settingsContext'
import {StockPosition} from './storage/SettingsStorage'

interface IProps {
  game: IGame
  hint: null | ICard
  cardBackFace: CardBackfaceStyle
  deskSkin: IDeskSkin
  automaticHintDelay: number,
  stockPosition: StockPosition,
  onMove: (move: Move) => void
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onNewWinnableGame: (drawnCards: 1 | 3) => void
  onShowHint: () => void
  onDeskStyleChange: (newDeskStyleName: string) => void
  onCardStyleChange: (newCardStyle: CardBackfaceStyle) => void
  onAutomaticHintDelayChange: (newAutomaticHintDelay: number) => void
  onStockPositionChange: (newStockPosition: StockPosition) => void
  onBotMove: () => void
  onImport: () => void
}

export default function App(
  {game, cardBackFace, deskSkin, hint, automaticHintDelay, stockPosition, ...callbacks}: IProps,
) {
  const {onMove, onNewWinnableGame, onRedo, onReset, onShowHint, onUndo, onImport} = callbacks
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
  const automaticHintDelayChangeListener = React.useMemo(
    () => (event: React.ChangeEvent<HTMLInputElement>) => callbacks.onAutomaticHintDelayChange(
      parseInt(event.target.value, 10) * 1_000,
    ),
    [callbacks.onAutomaticHintDelayChange],
  )
  const stockPositionChangeListener = React.useMemo(
    () => (event: React.ChangeEvent<HTMLInputElement>) => callbacks.onStockPositionChange(
      event.target.checked ? StockPosition.RIGHT : StockPosition.LEFT,
    ),
    [callbacks.onStockPositionChange],
  )

  return (
    <div className={style.app}>
      <div className={style.toolbar}>
        <button onClick={onStartNewWinnableGame}>nová hra</button>
        <button onClick={onUndo}>&lt;-</button>
        <button onClick={onRedo}>-&gt;</button>
        <button onClick={onReset}>reset</button>
        &nbsp;|&nbsp;
        <GameStats game={game}/>
        &nbsp;|&nbsp;
        <button onClick={onShowHint}>poradit tah</button>
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
        Automatická nápověda:
        <input
          type='range'
          min='0'
          max='180'
          step='1'
          value={automaticHintDelay / 1_000}
          onChange={automaticHintDelayChangeListener}
        />
        {automaticHintDelay ? `${automaticHintDelay / 1_000} s` : 'vypnuto'}
        <label>
          <input
            type='checkbox'
            value='1'
            checked={stockPosition === StockPosition.RIGHT}
            onChange={stockPositionChangeListener}
          />
          Balíček vpravo
        </label>
        &nbsp;|&nbsp;
        <button onClick={callbacks.onBotMove}>bot</button>
        <button onClick={onExport}>export</button>
        <button onClick={onImport}>import</button>
      </div>
      <SettingsContext.Provider value={settingsContextValue}>
        <Desk game={game} hint={hint} stockPosition={stockPosition} onMove={onMove}/>
      </SettingsContext.Provider>
    </div>
  )

  function onStartNewWinnableGame(): void {
    const drawnCards = parseInt(prompt('Počet karet lízaných z balíčku (1 nebo 3):', '1') || '', 10)
    if (drawnCards === 1 || drawnCards === 3) {
      onNewWinnableGame(drawnCards)
    }
  }

  function onExport(): void {
    console.log(serialize(game)) // tslint:disable-line:no-console
  }
}
