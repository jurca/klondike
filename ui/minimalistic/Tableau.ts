import {ICard} from '../../game/Card.js'
import {IPile} from '../../game/Pile.js'
import {ITableau} from '../../game/Tableau.js'
import {Component, define, keyed, tpl} from '../../node_modules/@jurca/-x-ignore/ignore-with-renderer.js'
import './Pile.js'

interface IProps {
  tableau: ITableau
  oncardselected: (card: ICard, pile: IPile) => void
}

define(
  class Tableau extends Component<IProps> {
    public static is = 'klondike-tableau'
    public static useShadowDom = true
    public static props = ['tableau', 'oncardselected'] as Array<keyof IProps>

    public render(): any {
      const piles = this.props.tableau.piles

      return tpl`
        <style>
          :host {
            display: flex;
          }
        </style>

        ${piles.map((pile, index) => keyed(index)`
          <klondike-pile
            .pile="${pile}"
            .oncardselected="${(card: ICard) => this.props.oncardselected(card, pile)}"
          >
          </klondike-pile>
        `)}
      `
    }
  },
)
