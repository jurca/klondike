import {Color, ICard, RED_COLORS} from '../../game/Card.js'
import {IDesk} from '../../game/Desk.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Card.js'

interface IProps {
  desk: IDesk
  selectedcard: null | ICard
  onfoundationselected: (color: Color) => void
}

const COLOR_ORDER = [
  Color.CLUBS,
  Color.DIAMONDS,
  Color.HEARTHS,
  Color.SPADES,
]

const EMPTY_PILE_SYMBOL = {
  [Color.CLUBS]: '♧',
  [Color.DIAMONDS]: '♢',
  [Color.HEARTHS]: '♡',
  [Color.SPADES]: '♤',
}

define(
  class Foundation extends Component<IProps> {
    public static is = 'klondike-foundation'
    public static useShadowDom = true
    public static props = ['desk', 'selectedcard', 'onfoundationselected'] as Array<keyof IProps>

    public render(): any {
      const topCards = COLOR_ORDER.map(
        (color) => this.props.desk.foundation[color].cards,
      ).map(
        (pileCards) => pileCards[pileCards.length - 1],
      )

      return tpl`
        <style>
          :host {
            display: flex;
          }

          button {
            font-size: 40px;
            color: black;
          }

          .red {
            color: red;
          }
        </style>

        ${COLOR_ORDER.map((color, colorIndex) => keyed(color)`
          ${topCards[colorIndex] ?
            tpl`
              <klondike-card
                .card="${topCards[colorIndex]}"
                .isselected="${topCards[colorIndex] === this.props.selectedcard}"
                .onclick="${() => this.props.onfoundationselected(color)}"
              >
              </klondike-card>
            `
          :
            tpl`
              <button
                class="${RED_COLORS.includes(color) ? 'red' : ''}"
                .onclick="${() => this.props.onfoundationselected(color)}"
              >
                ${EMPTY_PILE_SYMBOL[color]}
              </button>
            `
          }
        `)}
      `
    }
  },
)
