import WinnableGamesGenerator from '../../../game/WinnableGamesGenerator'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS, GAME_SIMULATION_OPTIONS} from '../config'

let winnableGamesGenerator: null | WinnableGamesGenerator = null

self.onmessage = (event: MessageEvent): void => {
  if (typeof event.data === 'number' && [1, 3].includes(event.data)) {
    winnableGamesGenerator = createWinnableGamesGenerator(event.data as 1 | 3)
    return
  }

  if (!winnableGamesGenerator) {
    return
  }

  winnableGamesGenerator.generateWinnableGame().task.then((generatedDeck) => {
    self.postMessage(generatedDeck)
  })
}

function createWinnableGamesGenerator(drawnCards: 1 | 3): WinnableGamesGenerator {
  return new WinnableGamesGenerator(
    {
      ...DEFAULT_NEW_GAME_OPTIONS,
      drawnCards,
    },
    BOT_OPTIONS,
    GAME_SIMULATION_OPTIONS,
    taskRunner,
  )
}

function taskRunner(task: () => void) {
  const requestId = setTimeout(task)
  return {
    cancel() {
      clearTimeout(requestId)
    },
  }
}
