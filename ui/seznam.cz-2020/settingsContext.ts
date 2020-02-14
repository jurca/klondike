import {createContext} from 'dom-augmentor'
import CardBackfaceStyle from './CardBackfaceStyle'

interface ISettingsContext {
  cardBackFace: CardBackfaceStyle
  foundationBackgroundColor: {
    darK: string,
    light: string,
  }
}

export default createContext<ISettingsContext>({
  cardBackFace: CardBackfaceStyle.SeznamLogo,
  foundationBackgroundColor: {
    darK: '#00ab51',
    light: '#75cc81',
  },
})
