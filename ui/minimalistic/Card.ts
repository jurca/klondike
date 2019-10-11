import {Color, ICard, RANK_SEQUENCE, RED_COLORS, Side} from '../../game/Card.js'
import {Component, define, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'

interface IProps {
  card: ICard
}

define(
  class Card extends Component<IProps> {
    public static is = 'klondike-card'
    public static useShadowDom = true
    public static props = ['card'] as Array<keyof IProps>

    public render(): any {
      const {card} = this.props

      return tpl`
        <style>
          :host {
            display: block;
          }

          button {
            font-size: 40px;
            color: black;
          }

          .red {
            color: red;
          }
        </style>

        <button class="${card.side === Side.FACE && RED_COLORS.includes(card.color) ? 'red' : ''}">
          ${asString(card)}
        </button>
      `
    }
  },
)

function asString(card: ICard): string {
  const CHAR_CODE_PREFIX = 55356
  const CHAR_CODE_BASE = 56480
  const COLORS_ORDER = [Color.SPADES, Color.HEARTHS, Color.DIAMONDS, Color.CLUBS]

  if (card.side === Side.BACK) {
    return String.fromCharCode(CHAR_CODE_PREFIX, CHAR_CODE_BASE)
  }

  return String.fromCharCode(
    CHAR_CODE_PREFIX,
    CHAR_CODE_BASE + (16 * COLORS_ORDER.indexOf(card.color)) + RANK_SEQUENCE.indexOf(card.rank) + 1,
  )
}
