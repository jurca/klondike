import {Color, ICard} from '../../game/Card.js'
import {IPile} from '../../game/Pile.js'
import {IDesk} from '../../game/Desk.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Card.js'
import './Foundation.js'
import './Tableau.js'

interface IProps {
  desk: IDesk
  selectedcard: null | ICard
  ondraw: () => void
  onredeal: () => void
  oncardselected: (card: ICard, pile: IPile) => void
  onemptypileselected: (pile: IPile) => void
  onfoundationselected: (color: Color) => void
}

define(
  class Desk extends Component<IProps> {
    public static is = 'klondike-desk'
    public static useShadowDom = true
    public static props = [
      'desk',
      'selectedcard',
      'ondraw',
      'onredeal',
      'oncardselected',
      'onfoundationselected',
      'onemptypileselected',
    ] as Array<keyof IProps>

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
            // stock cards are never selected
            tpl`<klondike-card .card="${topStockCard}" .onclick="${this.props.ondraw}"></klondike-card>`
          :
            tpl`<button .onclick="${this.props.onredeal}"></button>`
          }
          ${topWasteCard ?
            tpl`
              <klondike-card
                .card="${topWasteCard}"
                .isselected="${topWasteCard === this.props.selectedcard}"
                .onclick="${() => this.props.oncardselected(topWasteCard, waste)}"
              >
              </klondike-card>
            `
          :
            tpl`<button></button>`
          }

          <klondike-foundation
            .desk="${this.props.desk}"
            .selectedcard="${this.props.selectedcard}"
            .onfoundationselected="${this.props.onfoundationselected}"
          >
          </klondike-foundation>
        </div>

        <klondike-tableau
          .tableau="${tableau}"
          .selectedcard="${this.props.selectedcard}"
          .oncardselected="${this.props.oncardselected}"
          .onemptypileselected="${this.props.onemptypileselected}"
        >
        </klondike-tableau>
      `
    }
  },
)
