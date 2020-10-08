import {IBotOptions} from './Bot'
import {createGameWithBotPredicate, IBotSimulationOptions, INewGameRules} from './Game'
import {serializeDeckFromDesk} from './Serializer_v3'

interface ICancellableScheduledTask {
  cancel(): void
}

interface ITask<R> extends ICancellableScheduledTask {
  task: Promise<R>
}

export default class WinnableGamesGenerator {
  public onProgress: null | ((lastWinnableDeck: null | string) => void) = null
  private nextScheduledGeneratorTask: null | ICancellableScheduledTask = null
  private knownWinnableDecks = new Set<string>()

  constructor(
    private readonly gameRules: INewGameRules,
    private readonly botOptions: IBotOptions,
    private readonly gameSimulationOptions: IBotSimulationOptions,
    private readonly taskRunner: (task: () => void) => ICancellableScheduledTask,
  ) {
  }

  public runGenerator(): void {
    if (!this.nextScheduledGeneratorTask) {
      const daemon = (): void => {
        this.nextScheduledGeneratorTask = this.taskRunner(daemon)
        this.testNextRandomDeck()
      }
      this.nextScheduledGeneratorTask = this.taskRunner(daemon)
    }
  }

  public stopGenerator(): void {
    if (this.nextScheduledGeneratorTask) {
      this.nextScheduledGeneratorTask.cancel()
      this.nextScheduledGeneratorTask = null
    }
  }

  public generateWinnableGame(): ITask<string> {
    const subGenerator = new WinnableGamesGenerator(
      this.gameRules,
      this.botOptions,
      this.gameSimulationOptions,
      this.taskRunner,
    )
    return {
      task: new Promise((resolve) => {
        subGenerator.onProgress = (lastWinnableDeck) => {
          if (lastWinnableDeck) {
            this.knownWinnableDecks.add(lastWinnableDeck)
            subGenerator.stopGenerator()
            resolve(lastWinnableDeck)
          }
        }
        subGenerator.runGenerator()
      }),
      cancel() {
        subGenerator.stopGenerator()
      },
    }
  }

  public get generatedDecks(): ReadonlySet<string> {
    return this.knownWinnableDecks
  }

  private testNextRandomDeck(): void {
    const [generatedGame, isWinnable] = createGameWithBotPredicate(
      this.gameRules,
      this.botOptions,
      this.gameSimulationOptions,
    )

    const lastWinnableDeck = isWinnable ? serializeDeckFromDesk(generatedGame.state) : null
    if (lastWinnableDeck) {
      this.knownWinnableDecks.add(lastWinnableDeck)
    }
    if (this.onProgress) {
      this.onProgress(lastWinnableDeck)
    }
  }
}
