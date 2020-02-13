import {createContext} from 'dom-augmentor'
import CardBackfaceStyle from './CardBackfaceStyle'

interface ISettingsContext {
  cardBackFace: CardBackfaceStyle
}

export default createContext<ISettingsContext>({
  cardBackFace: CardBackfaceStyle.SeznamLogo,
})
