import {IDesk} from '../../game/Desk.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Card.js'
import './Foundation.js'
import './Tableau.js'

interface IProps {
  desk: IDesk
  ondraw: () => void
  onredeal: () => void
}

define(
  class Desk extends Component<IProps> {
    public static is = 'klondike-desk'
    public static useShadowDom = true
    public static props = ['desk', 'ondraw', 'onredeal'] as Array<keyof IProps>

    public render(): any {
      const {stock, tableau, waste} = this.props.desk
      const topStockCard = stock.cards[stock.cards.length - 1]
      const topWasteCard = waste.cards[waste.cards.length - 1]

      return tpl`
        <style>
          :host {
            display: block;
          }

          .top {
            display: flex;
          }
        </style>

        <div class="top">
          ${topStockCard ?
            tpl`<klondike-card .card="${topStockCard}" .onclick="${this.props.ondraw}"></klondike-card>`
          :
            tpl`<button .onclick="${this.props.onredeal}"></button>`
          }
          ${topWasteCard ?
            tpl`<klondike-card .card="${topWasteCard}"></klondike-card>`
          :
            tpl`<button></button>`
          }

          <klondike-foundation .desk="${this.props.desk}"></klondike-foundation>
        </div>

        <klondike-tableau .tableau="${tableau}"></klondike-tableau>
      `
    }
  },
)
