import {Side} from '../../game/Card.js'
import {IGame} from '../../game/Game.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Game.js'

interface IProps {
  game: IGame
  onstartnewgame: () => void
  onmove: () => void
  onreset: () => void
  onundo: () => void
  onredo: () => void
}

interface IPrivateProps {
  allcardsvisible: boolean
}

define(
  class App extends Component<IProps & IPrivateProps> {
    public static is = 'klondike-app'
    public static useShadowDom = true
    public static props = [
      'game',
      'allcardsvisible',
      'onstartnewgame',
      'onmove',
      'onreset',
      'onundo',
      'onredo',
    ] as Array<keyof (IProps & IPrivateProps)>

    private allcardsvisible: boolean = false

    public render(): any {
      const {allcardsvisible, currentGameView: game} = this

      return tpl`
        <style>
          :host {
            display: block;
          }

          .horizontal-card-list {
            display: flex;
          }
        </style>

        <button .onclick="${this.props.onstartnewgame}">New game</button>
        <label>
          <input type="checkbox" .checked="${allcardsvisible}" .onchange="${this.onToggleAllCardsVisible}">
          Show all cards
        </label>
        <button .onclick="${this.props.onreset}">Reset game</button>
        <button .onclick="${this.props.onundo}" .disabled="${!game.history.length}">Undo</button>
        <button .onclick="${this.props.onredo}" .disabled="${!game.future.length}">Redo</button>

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

    private onToggleAllCardsVisible = () => {
      this.allcardsvisible = !this.allcardsvisible
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
