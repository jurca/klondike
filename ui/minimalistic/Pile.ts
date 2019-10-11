import {IPile} from '../../game/Pile.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Card.js'

interface IProps {
  pile: IPile
}

define(
  class Pile extends Component<IProps> {
    public static is = 'klondike-pile'
    public static useShadowDom = true
    public static props = ['pile'] as Array<keyof IProps>

    public render(): any {
      return tpl`
        <style>
          :host {
            display: block;
          }
        </style>

        ${this.props.pile.cards.map((card) => keyed(card)`
          <klondike-card .card="${card}"></klondike-card>
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
