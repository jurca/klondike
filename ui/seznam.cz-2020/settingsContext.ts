import {createContext} from 'react'
import CardBackfaceStyle from './CardBackfaceStyle'
import {GREEN_S, IDeskSkin} from './deskSkins'

export interface ISettingsContext extends IDeskSkin {
  cardBackFace: CardBackfaceStyle
}

export default createContext<ISettingsContext>({
  ...GREEN_S,
  cardBackFace: CardBackfaceStyle.SeznamLogo,
})
