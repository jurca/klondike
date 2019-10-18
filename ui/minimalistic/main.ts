import {createNewGame, executeMove, Move} from '../../game/Game.js'
import {render, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './App.js'

const RULES = {
  drawnCards: 3,
  tableauPiles: 7,
}

addEventListener('DOMContentLoaded', () => {
  let currentGame = createNewGame(RULES)
  renderUI()

  function onStartNewGame() {
    currentGame = createNewGame(RULES)
    renderUI()
  }

  function onMove(move: Move) {
    currentGame = executeMove(currentGame, move)
    renderUI()
  }

  function renderUI() {
    render(
      document.getElementById('app')!,
      tpl`<klondike-app .game="${currentGame}" .onstartnewgame="${onStartNewGame}" .onmove="${onMove}"></klondike-app>`,
    )
  }
})
