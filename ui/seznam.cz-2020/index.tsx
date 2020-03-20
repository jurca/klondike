import * as React from 'react'
import {render} from 'react-dom'
import {createNewGame, executeMove} from '../../game/Game'
import {Move} from '../../game/Move'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import DeskStyle from './DeskStyle'
import SettingsContext from './settingsContext'

const uiRoot = document.getElementById('app')!

let game = createNewGame({
  drawnCards: 1,
  tableauPiles: 7,
})

rerenderUI()

function rerenderUI() {
  render(
    <div style={{width: '100%', height: '100%'}}>
      <SettingsContext.Provider
        value={{
          cardBackFace: CardBackfaceStyle.SeznamLogo,
          deskColor: {
            background: 'linear-gradient(0deg, #287d3b 0%, #298d41 17%, #29a249 45%, #2aaf4d 73%, #2ab34f 100%)',
            topBar: '#009245',
          },
          deskStyle: DeskStyle.GREEN_S,
          foundationBackgroundColor: {
            darK: '#00ab51',
            light: '#75cc81',
          },
        }}
      >
        <Desk deskState={game.state} gameRules={game.rules} onMove={onMove}/>
      </SettingsContext.Provider>
    </div>,
    uiRoot,
  )
}

function onMove(move: Move): void {
  try {
    game = executeMove(game, move)
  } catch (moveError) {
    // tslint:disable-next-line:no-console
    console.error(moveError)
    return
  }

  rerenderUI()
}
