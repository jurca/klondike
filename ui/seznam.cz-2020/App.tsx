import * as React from 'react'
import {ICard} from '../../game/Card'
import {IGame} from '../../game/Game'
import {Move} from '../../game/Move'
import style from './app.css'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import {IDeskSkin} from './deskSkins'
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
  onShowHint: () => void
}

export default function App({game, cardBackFace, deskSkin, hint, ...callbacks}: IProps) {
  const {onMove, onNewGame, onRedo, onReset, onShowHint, onUndo} = callbacks
  const settingsContextValue = React.useMemo(() => ({...deskSkin, cardBackFace}), [deskSkin, cardBackFace])

  return (
    <div className={style.app}>
      <div className={style.toolbar}>
        <button onClick={onStartNewGame}>nová hra</button>
        <button onClick={onUndo}>&lt;-</button>
        <button onClick={onRedo}>-&gt;</button>
        <button onClick={onReset}>reset</button>
        &nbsp;|&nbsp;
        <GameStats game={game}/>
        &nbsp;|&nbsp;
        <button onClick={onShowHint}>poradit tah</button>
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
}
