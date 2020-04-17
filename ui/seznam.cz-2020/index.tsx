import * as React from 'react'
import {render} from 'react-dom'
import {Side} from '../../game/Card'
import {createNewGame, executeMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {lastItemOrNull} from '../../game/util'
import CardBackfaceStyle from './CardBackfaceStyle'
import Desk from './Desk'
import {GREEN_S} from './deskSkins'
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
          ...GREEN_S,
          cardBackFace: CardBackfaceStyle.SeznamLogo,
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
