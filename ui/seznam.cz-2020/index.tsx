import * as React from 'react'
import {render} from 'react-dom'
import {Side} from '../../game/Card'
import {createNewGame, executeMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {lastItemOrNull} from '../../game/util'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import DeskStyle from './DeskStyle'
import SettingsContext from './settingsContext'

const uiRoot = document.getElementById('app')!

let game = createNewGame({
  allowNonKingToEmptyPileTransfer: false,
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
            dark: '#00ab51',
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
    const unrevealedCardPileIndex = game.state.tableau.piles.findIndex(
      (pile) => lastItemOrNull(pile.cards)?.side === Side.BACK,
    )
    if (unrevealedCardPileIndex > -1) {
      game = executeMove(game, {
        move: MoveType.REVEAL_TABLEAU_CARD,
        pileIndex: unrevealedCardPileIndex,
      })
    }
  } catch (moveError) {
    // tslint:disable-next-line:no-console
    console.error(moveError)
    return
  }

  rerenderUI()
}
