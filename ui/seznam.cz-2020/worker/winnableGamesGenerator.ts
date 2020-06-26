import WinnableGamesGenerator from '../../../game/WinnableGamesGenerator'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS, GAME_SIMULATION_OPTIONS} from '../config'
import * as logger from './logger'

let winnableGamesGenerator: null | WinnableGamesGenerator = null

self.onmessage = (event: MessageEvent): void => {
  if (typeof event.data === 'number' && [1, 3].includes(event.data)) {
    logger.info(`Creating a winnable games generator for ${event.data} drawn cards`)
    winnableGamesGenerator = createWinnableGamesGenerator(event.data as 1 | 3)
    return
  }

  if (!winnableGamesGenerator) {
    logger.warning(
      'Received a request to generate a new game, but no generator has been created yet, waiting for a configuration',
    )
    return
  }

  if (!event.data.generateNewGame) {
    logger.warning(
      'Received an invalid message', event.data,
    )
    return
  }

  logger.info('Generating a new winnable game')
  winnableGamesGenerator.generateWinnableGame().task.then((generatedDeck) => {
    logger.info('A new winnable game has been generated')
    self.postMessage(generatedDeck)
  }).catch((generatorError) => {
    logger.error('Generator has failed', generatorError)
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
