import {IGame} from '../../game/Game.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Game.js'

interface IProps {
  game: IGame
  onstartnewgame: () => void
  onmove: () => void
}

define(
  class App extends Component<IProps> {
    public static is = 'klondike-app'
    public static useShadowDom = true
    public static props = ['game', 'onstartnewgame', 'onmove'] as Array<keyof IProps>

    public render(): any {
      return tpl`
        <style>
          :host {
            display: block;
          }
        </style>

        <button .onclick="${this.props.onstartnewgame}">New game</button>
        <klondike-game .game="${this.props.game}" .onmove="${this.props.onmove}"></klondike-game>
      `
    }
  },
)
