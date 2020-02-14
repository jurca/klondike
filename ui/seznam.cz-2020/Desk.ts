import {augmentor, useContext} from 'dom-augmentor'
import {html} from 'lighterhtml'
import {Color} from '../../game/Card'
import style from './desk.css'
import GREEN_S from './deskBackground/s.svg'
import DeskStyle from './DeskStyle'
import EmptyPilePlaceholder from './EmptyPilePlaceholder'
import FoundationPile from './FoundationPile'
import InlineSvg from './InlineSvg'
import settingsContext from './settingsContext'

export default augmentor(function Desk() {
  const settings = useContext(settingsContext)
  const {deskStyle} = settings

  return html`
    <klondike-desk class=${style.desk} style="background: ${settings.deskColor.background}">
      <div class=${style.topBar} style="background: ${settings.deskColor.topBar}">
        <div class=${style.stock}>
          ${EmptyPilePlaceholder()}
        </div>
        <div>
          ${EmptyPilePlaceholder()}
        </div>
        <div></div>
        <div>
          ${FoundationPile(Color.SPADES, {cards: []})}
        </div>
        <div>
          ${FoundationPile(Color.HEARTHS, {cards: []})}
        </div>
        <div>
          ${FoundationPile(Color.CLUBS, {cards: []})}
        </div>
        <div>
          ${FoundationPile(Color.DIAMONDS, {cards: []})}
        </div>
      </div>
      ${deskStyle === DeskStyle.GREEN_S ?
        html`
          <div class=${style.greenS}>
            <div class=${style.greenSImageWrapper}>
              <div class=${style.greenSInnerImageWrapper}>
                <div class=${style.greenSImage}>
                  ${InlineSvg(GREEN_S)}
                </div>
              </div>
            </div>
          </div>
        `
      :
        null
      }
    </klondike-desk>
  `
})
