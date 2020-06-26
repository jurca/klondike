import {DRAW_1_PILES_7_ONLY_KING, DRAW_3_PILES_7_ONLY_KING} from '../preGeneratedCardDecks'
import * as logger from './logger'

const currentGeneratedDecks: {1: null | string, 3: null | string} = {
  1: null,
  3: null,
}

const generators = {
  1: createWinnableGamesGenerator(1),
  3: createWinnableGamesGenerator(3),
}

self.onmessage = (event: MessageEvent): void => {
  if (!event.data || typeof event.data.drawnCards !== 'number' || ![1, 3].includes(event.data.drawnCards)) {
    return
  }

  logger.info(`Received a request for a winnable game with ${event.data.drawnCards} drawn cards`)
  const drawnCards = event.data.drawnCards as 1 | 3
  let deck
  if (currentGeneratedDecks[drawnCards]) {
    logger.debug('Using a freshly generated game')
    deck = currentGeneratedDecks[drawnCards]
    currentGeneratedDecks[drawnCards] = null
    generators[drawnCards].postMessage({generateNewGame: true})
  } else {
    logger.debug('Using a pre-generated game')
    const preGeneratedDecks = drawnCards === 1 ? DRAW_1_PILES_7_ONLY_KING : DRAW_3_PILES_7_ONLY_KING
    deck = preGeneratedDecks[Math.floor(Math.random() * preGeneratedDecks.length)]
  }
  self.postMessage({deck, drawnCards})
}

function createWinnableGamesGenerator(drawnCards: 1 | 3): Worker {
  logger.info(`Creating a winnable game generator for ${drawnCards} drawn cards`)
  const generator = new Worker('./winnableGamesGenerator.js', {
    name: `Winnable games generator - ${drawnCards} drawn cards`,
  })
  generator.onmessage = (event) => {
    if (typeof event.data === 'string') {
      logger.info(`Received a winnable game for ${drawnCards} drawn cards from a generator worker`, event.data)
      currentGeneratedDecks[drawnCards] = event.data
    }
  }
  generator.postMessage(drawnCards)
  generator.postMessage({generateNewGame: true})
  return generator
}
