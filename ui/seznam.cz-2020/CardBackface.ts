import COLORS_BACKFACE from './cardBackFace/colors.svg'
import DOG_BACKFACE from './cardBackFace/dog.svg'
import SEZNAM_LOGO_BACKFACE from './cardBackFace/seznamLogo.svg'
import S_WITH_COLORS_BACKFACE from './cardBackFace/sWithColors.svg'
import CardBackfaceStyle from './CardBackfaceStyle'
import InlineSvg from './InlineSvg'

export default function CardBackface(style: CardBackfaceStyle) {
  // Kudos for (most of the) minification of the original SVG files goes to: https://jakearchibald.github.io/svgomg/
  const backfaceImageMarkup = ((): string => {
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

  return InlineSvg(backfaceImageMarkup)
}
