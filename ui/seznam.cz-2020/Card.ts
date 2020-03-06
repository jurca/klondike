import {html, neverland, useContext, useMemo} from 'neverland'
import {ICard, Side} from '../../game/Card'
import style from './card.css'
import CardBackface from './CardBackface'
import CardFrontFace from './CardFrontFace'
import settingsContext from './settingsContext'

export default neverland<any>(function Card(
  card: ICard,
  onClick?: null | ((card: ICard) => void),
  withShadow?: boolean,
  overrideRotation?: number,
) {
  const {cardBackFace} = useContext(settingsContext)
  const rotation = typeof overrideRotation === 'number' ? overrideRotation : (card.side === Side.FACE ? 0 : 180)
  const onClickHandler = useMemo(() => onClick?.bind(null, card), [card, onClick])

  return html`
    <klondike-card class="${style.card} ${withShadow ? style.shadow : ''}" onclick=${onClickHandler}>
      <div class=${style.body} style="transform: rotateY(${rotation}deg)">
        <div class=${style.back}>${CardBackface(cardBackFace)}</div>
        <div class=${style.front}>${CardFrontFace(card.color, card.rank)}</div>
      </div>
    </klondike-card>
  `
})
