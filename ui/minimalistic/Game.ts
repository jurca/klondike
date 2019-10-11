import {IGame} from '../../game/Game.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Desk.js'

interface IProps {
  game: IGame
}

define(
  class Game extends Component<IProps> {
    public static is = 'klondike-game'
    public static useShadowDom = true
    public static props = ['game'] as Array<keyof IProps>

    public render(): any {
      const {state} = this.props.game

      return tpl`
        <style>
          :host {
            display: block;
          }
        </style>

        <klondike-desk .desk="${state}"></klondike-desk>
      `
    }
  },
)
