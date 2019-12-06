import {defaultStateRankingHeuristic, makeMove} from '../../game/Bot.js'
import {createNewGame, executeMove, isVictory, Move, redoNextMove, resetGame, undoLastMove} from '../../game/Game.js'
import {MoveConfidence} from '../../game/MoveHintGenerator.js'
import {deserialize, serialize} from '../../game/Serializer.js'
import {render, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './App.js'

const DEFAULT_RULES = {
  drawnCards: 3,
  tableauPiles: 7,
}

const BOT_OPTIONS = {
  lookAheadMoves: 3,
  maxConsideredConfidenceLevels: 4,
  minAutoAcceptConfidence: MoveConfidence.VERY_HIGH,
  stateRankingHeuristic: defaultStateRankingHeuristic,
}

const FINISHING_MOVES_INTERVAL = 200 // milliseconds
const BOT_GAMEPLAY_INTERVAL = 50 // milliseconds

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
    console.log(serialize(currentGame)) // tslint:disable-line:no-console
  }

  function onLoad() {
    currentGame = deserialize(prompt()!)
    renderUI()
  }

  function onBotMove() {
    currentGame = makeMove(currentGame, BOT_OPTIONS)
    renderUI()
  }

  function onBotPlay() {
    const playIntervalId = setInterval(() => {
      const nextGameState = makeMove(currentGame, BOT_OPTIONS)
      if (nextGameState === currentGame) {
        clearInterval(playIntervalId)
        return
      }

      currentGame = nextGameState
      renderUI()
    }, BOT_GAMEPLAY_INTERVAL)
  }

  function onFinishGame() {
    const playIntervalId = setInterval(() => {
      currentGame = makeMove(currentGame, BOT_OPTIONS)
      renderUI()

      if (isVictory(currentGame)) {
        clearInterval(playIntervalId)
      }
    }, FINISHING_MOVES_INTERVAL)
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
          .onbotmove="${onBotMove}"
          .onbotplay="${onBotPlay}"
          .onfinishgame="${onFinishGame}"
        >
        </klondike-app>
      `,
    )
  }
})
