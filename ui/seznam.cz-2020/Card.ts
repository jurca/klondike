import {augmentor, useContext} from 'dom-augmentor'
import {html} from 'lighterhtml'
import {ICard, Side} from '../../game/Card'
import style from './card.css'
import CardBackface from './CardBackface'
import CardFrontFace from './CardFrontFace'
import settingsContext from './settingsContext'

export default augmentor(function Card(card: ICard, overrideRotation?: number) {
  const settings = useContext(settingsContext)
  const rotation = typeof overrideRotation === 'number' ? overrideRotation : (card.side === Side.FACE ? 0 : 180)

  return html`
    <klondike-card class=${style.card} style="--rotation: ${rotation};">
      <div class=${style.body}>
        <div class=${style.back}>${CardBackface(settings.cardBackFace)}</div>
        <div class=${style.front}>${CardFrontFace(card.color, card.rank)}</div>
      </div>
    </klondike-card>
  `
})
