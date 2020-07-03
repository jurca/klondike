import GENERATOR_WORKER_CODE from '!!raw-loader!../../dist/winnableGamesGenerator'
import {ICard} from '../../game/Card'
import {deserializeDeck} from '../../game/Serializer'
import {DRAW_1_PILES_7_ONLY_KING, DRAW_3_PILES_7_ONLY_KING} from './preGeneratedCardDecks'

export default class WinnableGamesProvider {
  private readonly currentGeneratedDecks: {1: null | string, 3: null | string} = {
    1: null,
    3: null,
  }
  private readonly generators = {
    1: this.createWinnableGamesGenerator(1),
    3: this.createWinnableGamesGenerator(3),
  }

  public getWinnableCardDeck(drawnCards: 1 | 3): ICard[] {
    const generatedDeck = this.currentGeneratedDecks[drawnCards]
    let deck: string
    if (generatedDeck) {
      deck = generatedDeck
      this.currentGeneratedDecks[drawnCards] = null
      this.generators[drawnCards].postMessage({generateNewGame: true})
    } else {
      const preGeneratedDecks = drawnCards === 1 ? DRAW_1_PILES_7_ONLY_KING : DRAW_3_PILES_7_ONLY_KING
      deck = preGeneratedDecks[Math.floor(Math.random() * preGeneratedDecks.length)]
    }
    return deserializeDeck(deck)
  }

  private createWinnableGamesGenerator(drawnCards: 1 | 3): Worker {
    const workerCodeBlob = new Blob([GENERATOR_WORKER_CODE], {type: 'application/javascript'})
    const generator = new Worker(URL.createObjectURL(workerCodeBlob), {
      name: `Winnable games generator - ${drawnCards} drawn cards`,
    })
    generator.onmessage = (event) => {
      if (typeof event.data === 'string') {
        this.currentGeneratedDecks[drawnCards] = event.data
      }
    }
    generator.postMessage(drawnCards)
    generator.postMessage({generateNewGame: true})
    return generator
  }
}
