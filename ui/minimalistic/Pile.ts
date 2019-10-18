import {ICard, Side} from '../../game/Card.js'
import {IPile} from '../../game/Pile.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Card.js'

interface IProps {
  pile: IPile
  selectedcard: null | ICard
  oncardselected: (card: ICard) => void
}

define(
  class Pile extends Component<IProps> {
    public static is = 'klondike-pile'
    public static useShadowDom = true
    public static props = ['pile', 'selectedcard', 'oncardselected'] as Array<keyof IProps>

    public render(): any {
      return tpl`
        <style>
          :host {
            display: block;
          }
        </style>

        ${this.props.pile.cards.map((card) => keyed(card)`
          <klondike-card
            .card="${card}"
            .isselected="${card === this.props.selectedcard}"
            .onclick="${
              () => card.side === Side.FACE || isTopCard(card, this.props.pile) ?
                  this.props.oncardselected(card)
                :
                  null
            }"
          >
          </klondike-card>
        `)}
        ${!this.props.pile.cards.length ?
          tpl`<button></button>`
        :
          null
        }
      `
    }
  },
)

function isTopCard(card: ICard, pile: IPile): boolean {
  return card === pile.cards[pile.cards.length - 1]
}
