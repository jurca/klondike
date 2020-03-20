import * as React from 'react'
import COLORS_BACKFACE from './cardBackFace/colors.svg'
import DOG_BACKFACE from './cardBackFace/dog.svg'
import SEZNAM_LOGO_BACKFACE from './cardBackFace/seznamLogo.svg'
import S_WITH_COLORS_BACKFACE from './cardBackFace/sWithColors.svg'
import CardBackfaceStyle from './CardBackfaceStyle'

export default function CardBackface({style}: {style: CardBackfaceStyle}) {
  const BackImageComponent = (() => {
    switch (style) {
      case CardBackfaceStyle.Colors:
        return COLORS_BACKFACE
      case CardBackfaceStyle.Dog:
        return DOG_BACKFACE
      case CardBackfaceStyle.SeznamLogo:
        return SEZNAM_LOGO_BACKFACE
      case CardBackfaceStyle.SWithColors:
        return S_WITH_COLORS_BACKFACE
      default:
        throw new Error(`Unknown card backface style: ${style}`)
    }
  })()

  return (
    <BackImageComponent/>
  )
}
