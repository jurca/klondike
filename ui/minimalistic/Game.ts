import {IGame, Move, MoveType} from '../../game/Game.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Desk.js'

interface IProps {
  game: IGame
  onmove: (move: Move) => void
}

define(
  class Game extends Component<IProps> {
    public static is = 'klondike-game'
    public static useShadowDom = true
    public static props = ['game', 'onmove'] as Array<keyof IProps>

    public render(): any {
      const {state} = this.props.game

      return tpl`
        <style>
          :host {
            display: block;
          }
        </style>

        <klondike-desk
          .desk="${state}"
          .ondraw="${this.onDraw}"
          .onredeal="${this.onRedeal}"
        >
        </klondike-desk>
      `
    }

    private onDraw = () => {
      this.props.onmove({
        drawnCards: this.props.game.rules.drawnCards,
        move: MoveType.DRAW_CARDS,
      })
    }

    private onRedeal = () => {
      this.props.onmove({
        move: MoveType.REDEAL,
      })
    }
  },
)
