import {Side} from '../../game/Card.js'
import {IGame} from '../../game/Game.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Game.js'

interface IProps {
  game: IGame
  onstartnewgame: (drawnCards: number, tableauPiles: number) => void
  onmove: () => void
  onreset: () => void
  onundo: () => void
  onredo: () => void
  onsave: () => void
  onload: () => void
}

interface IPrivateProps {
  allcardsvisible: boolean
  newgametableaupilescount: number
}

define(
  class App extends Component<IProps & IPrivateProps, {}, {drawCards3: HTMLInputElement}> {
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
      'allcardsvisible',
      'newgametableaupilescount',
    ] as Array<keyof (IProps & IPrivateProps)>

    private allcardsvisible: boolean = false
    private newgametableaupilescount: number = 7

    public render(): any {
      const {allcardsvisible, currentGameView: game, newgametableaupilescount} = this

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
        <button .onclick="${this.props.onreset}">Reset game</button>
        <button .onclick="${this.props.onundo}" .disabled="${!game.history.length}">Undo</button>
        <button .onclick="${this.props.onredo}" .disabled="${!game.future.length}">Redo</button>
        <button .onclick="${this.props.onsave}">Save</button>
        <button .onclick="${this.props.onload}">Load</button>

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
      `
    }

    private onNewGame = () => {
      const {drawCards3: drawCards3Option} = this.refs
      this.props.onstartnewgame(drawCards3Option && drawCards3Option.checked ? 3 : 1, this.newgametableaupilescount)
    }

    private onToggleAllCardsVisible = () => {
      this.allcardsvisible = !this.allcardsvisible
    }

    private onNewGameTableauPilesCountChange = (event: Event) => {
      const input = event.target
      if (input && input) {
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
