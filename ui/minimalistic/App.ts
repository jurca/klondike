import {Side} from '../../game/Card.js'
import {IGame, isVictory, isVictoryGuaranteed} from '../../game/Game.js'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Game.js'

interface IProps {
  game: IGame
  onstartnewgame: (drawnCards: number, tableauPiles: number, winnability: GameWinnability) => void
  onmove: () => void
  onreset: () => void
  onundo: () => void
  onredo: () => void
  onsave: () => void
  onload: () => void
  onbotmove: () => void
  onbotplay: () => void
  onfinishgame: () => void
}

interface IPrivateProps {
  allcardsvisible: boolean
  newgametableaupilescount: number
  showhints: boolean
}

interface IRefs {
  drawCards3: HTMLInputElement
  winnabilityOption: HTMLElement
}

export enum GameWinnability {
  WINNABLE = 'GameWinnability.WINNABLE',
  UNWINNABLE = 'GameWinnability.UNWINNABLE',
  UNKNOWN = 'GameWinnability.UNKNOWN',
}

define(
  class App extends Component<IProps & IPrivateProps, {}, IRefs> {
    public static is = 'klondike-app'
    public static useShadowDom = true
    public static props = [
      'game',
      'onstartnewgame',
      'onmove',
      'onreset',
      'onundo',
      'onredo',
      'onsave',
      'onload',
      'onbotmove',
      'onbotplay',
      'onfinishgame',
      'allcardsvisible',
      'newgametableaupilescount',
      'showhints',
    ] as Array<keyof (IProps & IPrivateProps)>

    private allcardsvisible: boolean = false
    private newgametableaupilescount: number = 7
    private showhints: boolean = false

    public render(): any {
      const {allcardsvisible, currentGameView: game, newgametableaupilescount, showhints} = this
      const hints = showhints && getMoveHints(
        this.props.game.state,
        this.props.game.rules,
        HintGeneratorMode.WITH_FULL_STOCK,
      )

      return tpl`
        <style>
          :host {
            display: block;
          }

          .horizontal-card-list {
            display: flex;
          }
        </style>

        <button .onclick="${this.onNewGame}">New game</button>
        <label>
          <input type="checkbox" .checked="${allcardsvisible}" .onchange="${this.onToggleAllCardsVisible}">
          Show all cards
        </label>
        <label>
          <input type="checkbox" .checked="${showhints}" .onchange="${this.onToggleHints}">
          Show hints
        </label>
        <button .onclick="${this.props.onreset}">Reset game</button>
        <button .onclick="${this.props.onundo}" .disabled="${!game.history.length}">Undo</button>
        <button .onclick="${this.props.onredo}" .disabled="${!game.future.length}">Redo</button>
        <button .onclick="${this.props.onsave}">Save</button>
        <button .onclick="${this.props.onload}">Load</button>
        <button .onclick="${this.props.onbotmove}">Automatic move</button>
        <button .onclick="${this.props.onbotplay}">Automatic gameplay</button>
        <button .onclick="${this.props.onfinishgame}" .disabled="${isVictory(this.props.game) || !isVictoryGuaranteed(this.props.game)}">
          Finish game
        </button>

        <p>
          New game options:
        </p>
        <p>
          Draw:
          <label>
            <input type="radio" name="drawnCards" value="3" checked ref="drawCards3">
            3 cards
          </label>
          <label>
            <input type="radio" name="drawnCards" value="1">
            1 card
          </label>
        </p>
        <p>
          Tableau piles count:
          <input
            type="range"
            min="4"
            max="52"
            step="1"
            .value="${newgametableaupilescount}"
            .onchange="${this.onNewGameTableauPilesCountChange}"
          >
          ${newgametableaupilescount}
        </p>
        <p ref="winnabilityOption">
          Winnability:
          <label>
            <input type="radio" name="winnability" value="${GameWinnability.WINNABLE}">
            Only winnable games
          </label>
          <label>
            <input type="radio" name="winnability" value="${GameWinnability.UNWINNABLE}">
            Only unwinnable games
          </label>
          <label>
            <input type="radio" name="winnability" value="${GameWinnability.UNKNOWN}" checked>
            Any game
          </label>
        </p>

        <klondike-game .game="${game}" .onmove="${this.props.onmove}"></klondike-game>

        ${allcardsvisible ?
          tpl`
            <div>
              Stock:
              <div class="horizontal-card-list">
                ${game.state.stock.cards.map((card) => keyed(card)`
                  <klondike-card .card="${{...card, side: Side.FACE}}" .isselected="${false}"></klondike-card>
                `)}
              </div>
            </p>
            <div>
              Waste:
              <div class="horizontal-card-list">
                ${game.state.waste.cards.map((card) => keyed(card)`
                  <klondike-card .card="${card}" .isselected="${false}"></klondike-card>
                `)}
              </div>
            </div>
          `
        :
          null
        }

        ${hints ?
          tpl`
            <div>
              Hints:
              <ul>
                ${hints.map((hint) => keyed(hint)`
                  <li><code>${JSON.stringify(hint)}</code></li>
                `)}
              </ul>
            </div>
          `
        :
          null
        }
      `
    }

    private onNewGame = () => {
      const {drawCards3: drawCards3Option, winnabilityOption} = this.refs
      const chosenWinnabilityElement = winnabilityOption?.querySelector(':checked')
      const chosenWinnability = chosenWinnabilityElement && (chosenWinnabilityElement as HTMLInputElement).value
      this.props.onstartnewgame(
        drawCards3Option?.checked ? 3 : 1,
        this.newgametableaupilescount,
        chosenWinnability ? chosenWinnability as GameWinnability : GameWinnability.UNKNOWN,
      )
    }

    private onToggleAllCardsVisible = () => {
      this.allcardsvisible = !this.allcardsvisible
    }

    private onToggleHints = () => {
      this.showhints = !this.showhints
    }

    private onNewGameTableauPilesCountChange = (event: Event) => {
      const input = event.target
      if (input && 'value' in input) {
        this.newgametableaupilescount = parseInt((input as any).value, 10) || this.newgametableaupilescount
      }
    }

    private get currentGameView(): IGame {
      const {allcardsvisible, game} = this.props
      if (allcardsvisible) {
        return {
          ...game,
          state: {
            ...game.state,
            tableau: {
              ...game.state.tableau,
              piles: game.state.tableau.piles.map((pile) => ({
                ...pile,
                cards: pile.cards.map((card) => ({
                  ...card,
                  side: Side.FACE,
                })),
              })),
            },
          },
        }
      }
      return game
    }
  },
)
