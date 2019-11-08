import {createNewGame, executeMove, Move, redoNextMove, resetGame, undoLastMove} from '../../game/Game.js'
import {deserialize, serialize} from '../../game/Serializer.js'
import {render, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './App.js'

const DEFAULT_RULES = {
  drawnCards: 3,
  tableauPiles: 7,
}

addEventListener('DOMContentLoaded', () => {
  let currentGame = createNewGame(DEFAULT_RULES)
  renderUI()

  function onStartNewGame(drawnCards: number, tableauPiles: number) {
    currentGame = createNewGame({
      drawnCards,
      tableauPiles,
    })
    renderUI()
  }

  function onMove(move: Move) {
    currentGame = executeMove(currentGame, move)
    renderUI()
  }

  function onReset() {
    currentGame = resetGame(currentGame)
    renderUI()
  }

  function onUndo() {
    currentGame = undoLastMove(currentGame)
    renderUI()
  }

  function onRedo() {
    currentGame = redoNextMove(currentGame)
    renderUI()
  }

  function onSave() {
    console.log(serialize(currentGame))
  }

  function onLoad() {
    currentGame = deserialize(prompt()!)
    renderUI()
  }

  function renderUI() {
    render(
      document.getElementById('app')!,
      tpl`
        <klondike-app
          .game="${currentGame}"
          .onstartnewgame="${onStartNewGame}"
          .onmove="${onMove}"
          .onreset="${onReset}"
          .onundo="${onUndo}"
          .onredo="${onRedo}"
          .onsave="${onSave}"
          .onload="${onLoad}"
        >
        </klondike-app>
      `,
    )
  }
})
