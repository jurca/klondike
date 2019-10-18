import {ICard, Side} from '../../game/Card.js'
import {IPile} from '../../game/Pile.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Card.js'

interface IProps {
  pile: IPile
  oncardselected: (card: ICard) => void
}

define(
  class Pile extends Component<IProps> {
    public static is = 'klondike-pile'
    public static useShadowDom = true
    public static props = ['pile', 'oncardselected'] as Array<keyof IProps>

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
            .onclick="${() => card.side === Side.FACE ? this.props.oncardselected(card) : null}"
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
