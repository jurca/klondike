import {html} from 'lighterhtml'
import style from './card.css'

export default function Card(rotation?: number) {
  return html`
    <klondike-card class=${style.card} style="--rotation: ${rotation || 0};">
      <div class=${style.body}>
        <div class=${style.back}></div>
        <div class=${style.front}></div>
      </div>
    </klondike-card>
  `
}
