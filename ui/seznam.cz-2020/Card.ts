import {html} from 'lighterhtml'
import style from './card.css'

interface IProps {
  rotation?: number
}

export default function Card({rotation}: IProps) {
  return html`
    <klondike-card class=${style.card} style="--rotation: ${rotation || 0};">
      <div class=${style.body}>
        <div class=${style.back}></div>
        <div class=${style.front}></div>
      </div>
    </klondike-card>
  `
}
