import {Color, ICard, Side} from '../../game/Card.js'
import {IGame} from '../../game/Game.js'
import {Move, MoveType} from '../../game/Move.js'
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
          .selectedcard="${this.selectedcard?.[0]}"
          .ondraw="${this.onDraw}"
          .onredeal="${this.onRedeal}"
          .oncardselected="${this.onCardSelected}"
          .onfoundationselected="${this.onFoundationSelected}"
          .onemptypileselected="${this.onEmptyPileSelected}"
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

    private onCardSelected = (card: ICard, pile: IPile): void => {
      if (this.selectedcard) {
        if (card !== this.selectedcard[0]) {
          this.executeTableauMove(this.selectedcard[0], this.selectedcard[1], pile)
        }

        this.selectedcard = null
      } else if (card.side === Side.BACK) {
        this.props.onmove({
          move: MoveType.REVEAL_TABLEAU_CARD,
          pileIndex: this.props.game.state.tableau.piles.indexOf(pile),
        })
      } else {
        this.selectedcard = [card, pile]
      }
    }

    private onEmptyPileSelected = (pile: IPile): void => {
      if (!this.selectedcard) {
        return
      }

      const {foundation, tableau, waste} = this.props.game.state
      const foundationPiles = Object.values(foundation)
      switch (true) {
        case this.selectedcard[1] === waste:
          this.props.onmove({
            move: MoveType.WASTE_TO_TABLEAU,
            pileIndex: tableau.piles.indexOf(pile),
          })
          break
        case tableau.piles.includes(this.selectedcard[1]):
          this.props.onmove({
            move: MoveType.TABLEAU_TO_TABLEAU,
            sourcePileIndex: tableau.piles.indexOf(this.selectedcard[1]),
            targetPileIndex: tableau.piles.indexOf(pile),
            topMovedCardIndex: this.selectedcard[1].cards.indexOf(this.selectedcard[0]),
          })
          break
        case foundationPiles.includes(this.selectedcard[1]):
          this.props.onmove({
            color: this.selectedcard[0].color,
            move: MoveType.FOUNDATION_TO_TABLEAU,
            pileIndex: tableau.piles.indexOf(pile),
          })
          break
        default:
          break // nothing to do
      }

      this.selectedcard = null
    }

    private onFoundationSelected = (color: Color): void => {
      if (!this.selectedcard) {
        const {foundation} = this.props.game.state
        const foundationPile = foundation[color]
        if (foundationPile.cards.length) {
          this.selectedcard = [foundationPile.cards[foundationPile.cards.length - 1], foundationPile]
        }

        return
      }

      const [selectedCard, selectedPile] = this.selectedcard
      if (color !== selectedCard.color) {
        this.selectedcard = null
        return
      }

      const {tableau, waste} = this.props.game.state
      switch (true) {
        case selectedPile === waste:
          this.props.onmove({
            move: MoveType.WASTE_TO_FOUNDATION,
          })
          break
        case tableau.piles.includes(selectedPile) && selectedCard === selectedPile.cards[selectedPile.cards.length - 1]:
          this.props.onmove({
            move: MoveType.TABLEAU_TO_FOUNDATION,
            pileIndex: tableau.piles.indexOf(selectedPile),
          })
          break
        default:
          break // nothing to do
      }

      this.selectedcard = null
    }

    private executeTableauMove(sourceCard: ICard, sourcePile: IPile, targetPile: IPile): void {
      const {foundation, tableau, waste} = this.props.game.state
      const foundationPiles = Object.values(foundation)
      switch (true) {
        case tableau.piles.includes(sourcePile) && tableau.piles.includes(targetPile):
          this.props.onmove({
            move: MoveType.TABLEAU_TO_TABLEAU,
            sourcePileIndex: tableau.piles.indexOf(sourcePile),
            targetPileIndex: tableau.piles.indexOf(targetPile),
            topMovedCardIndex: sourcePile.cards.indexOf(sourceCard),
          })
          break
        case sourcePile === waste && tableau.piles.includes(targetPile):
          this.props.onmove({
            move: MoveType.WASTE_TO_TABLEAU,
            pileIndex: tableau.piles.indexOf(targetPile),
          })
          break
        case foundationPiles.includes(sourcePile):
          this.props.onmove({
            color: sourceCard.color,
            move: MoveType.FOUNDATION_TO_TABLEAU,
            pileIndex: tableau.piles.indexOf(targetPile),
          })
          break
        default:
          break // nothing to do
      }
    }
  },
)
