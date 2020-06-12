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

interface IProps {
  game: IGame
  hint: null | ICard
  cardBackFace: CardBackfaceStyle
  deskSkin: IDeskSkin
  onMove: (move: Move) => void
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onNewGame: (drawnCards: 1 | 3) => void
  onNewWinnableGame: (drawnCards: 1 | 3) => void
  onShowHint: () => void
  onDeskStyleChange: (newDeskStyleName: string) => void
  onCardStyleChange: (newCardStyle: CardBackfaceStyle) => void
  onBotMove: () => void
  onImport: () => void
  onGenerateWinnableGames: (drawnCards: 1 | 3) => void
}

export default function App({game, cardBackFace, deskSkin, hint, ...callbacks}: IProps) {
  const {onMove, onNewGame, onNewWinnableGame, onRedo, onReset, onShowHint, onUndo, onImport} = callbacks
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

  return (
    <div className={style.app}>
      <div className={style.toolbar}>
        <button onClick={onStartNewGame}>nová hra s náhodnými kartami</button>
        <button onClick={onStartNewWinnableGame}>nová vyhratelná hra</button>
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
        &nbsp;|&nbsp;
        <button onClick={callbacks.onBotMove}>automatický tah</button>
        <button onClick={onExport}>exportovat hru</button>
        <button onClick={onImport}>importovat hru</button>
        <button onClick={onGenerateWinnableGames}>generovat vyhratelné hry</button>
      </div>
      <SettingsContext.Provider value={settingsContextValue}>
        <Desk deskState={game.state} gameRules={game.rules} hint={hint} onMove={onMove}/>
      </SettingsContext.Provider>
    </div>
  )

  function onStartNewGame(): void {
    const drawnCards = parseInt(prompt('Počet karet lízaných z balíčku (1 nebo 3):', '1') || '', 10)
    if (drawnCards === 1 || drawnCards === 3) {
      onNewGame(drawnCards)
    }
  }

  function onStartNewWinnableGame(): void {
    const drawnCards = parseInt(prompt('Počet karet lízaných z balíčku (1 nebo 3):', '1') || '', 10)
    if (drawnCards === 1 || drawnCards === 3) {
      onNewWinnableGame(drawnCards)
    }
  }

  function onExport(): void {
    console.log(serialize(game))
  }

  function onGenerateWinnableGames() {
    const drawnCards = parseInt(prompt('Počet karet lízaných z balíčku (1 nebo 3):', '1') || '', 10)
    if (drawnCards === 1 || drawnCards === 3) {
      callbacks.onGenerateWinnableGames(drawnCards)
    }
  }
}
