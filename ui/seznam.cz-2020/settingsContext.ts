import {createContext} from 'react'
import CardBackfaceStyle from './CardBackfaceStyle'
import DeskStyle from './DeskStyle'

interface ISettingsContext {
  cardBackFace: CardBackfaceStyle
  deskColor: {
    background: string,
    topBar: string,
  },
  deskStyle: DeskStyle,
  foundationBackgroundColor: {
    dark: string,
    light: string,
  }
}

export default createContext<ISettingsContext>({
  cardBackFace: CardBackfaceStyle.SeznamLogo,
  deskColor: {
    background: 'linear-gradient(0deg, #287d3b 0%, #298d41 17%, #29a249 45%, #2aaf4d 73%, #2ab34f 100%)',
    topBar: '#009245',
  },
  deskStyle: DeskStyle.GREEN_S,
  foundationBackgroundColor: {
    dark: '#00ab51',
    light: '#75cc81',
  },
})
