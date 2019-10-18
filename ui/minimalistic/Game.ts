import {ICard} from '../../game/Card.js'
import {IGame, Move, MoveType} from '../../game/Game.js'
import {IPile} from '../../game/Pile.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Desk.js'

interface IProps {
  game: IGame
  onmove: (move: Move) => void
}

interface IPrivateProps {
  selectedcard: null | [ICard, IPile]
}

define(
  class Game extends Component<IProps & IPrivateProps> {
    public static is = 'klondike-game'
    public static useShadowDom = true
    public static props = ['game', 'onmove', 'selectedcard'] as Array<keyof (IProps & IPrivateProps)>

    private selectedcard: null | [ICard, IPile] = null

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
          .oncardselected="${this.onCardSelected}"
        >
        </klondike-desk>
      `
    }

    private onDraw = () => {
      this.selectedcard = null
      this.props.onmove({
        drawnCards: this.props.game.rules.drawnCards,
        move: MoveType.DRAW_CARDS,
      })
    }

    private onRedeal = () => {
      this.selectedcard = null
      this.props.onmove({
        move: MoveType.REDEAL,
      })
    }

    private onCardSelected = (card: ICard, pile: IPile): void => {
      if (this.selectedcard) {
        if (card !== this.selectedcard[0]) {
          this.executeMove(this.selectedcard[0], this.selectedcard[1], pile)
        }

        this.selectedcard = null
      } else {
        this.selectedcard = [card, pile]
      }
    }

    private executeMove(sourceCard: ICard, sourcePile: IPile, targetPile: IPile): void {
      const {tableau} = this.props.game.state
      switch (true) {
        case tableau.piles.includes(sourcePile) && tableau.piles.includes(targetPile):
          this.props.onmove({
            move: MoveType.TABLEAU_TO_TABLEAU,
            sourcePileIndex: tableau.piles.indexOf(sourcePile),
            targetPileIndex: tableau.piles.indexOf(targetPile),
            topMovedCardIndex: sourcePile.cards.indexOf(sourceCard),
          })
          break
        default:
          // nothing to do
      }
    }
  },
)
