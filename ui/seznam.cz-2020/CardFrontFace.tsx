import * as React from 'react'
import {Color, Rank} from '../../game/Card'
import CLUBS_TEN from './cardFace/clubs/10.svg'
import CLUBS_TWO from './cardFace/clubs/2.svg'
import CLUBS_THREE from './cardFace/clubs/3.svg'
import CLUBS_FOUR from './cardFace/clubs/4.svg'
import CLUBS_FIVE from './cardFace/clubs/5.svg'
import CLUBS_SIX from './cardFace/clubs/6.svg'
import CLUBS_SEVEN from './cardFace/clubs/7.svg'
import CLUBS_EIGHT from './cardFace/clubs/8.svg'
import CLUBS_NINE from './cardFace/clubs/9.svg'
import CLUBS_ACE from './cardFace/clubs/ace.svg'
import CLUBS_JACK from './cardFace/clubs/jack.svg'
import CLUBS_KING from './cardFace/clubs/king.svg'
import CLUBS_QUEEN from './cardFace/clubs/queen.svg'
import DIAMONDS_TEN from './cardFace/diamonds/10.svg'
import DIAMONDS_TWO from './cardFace/diamonds/2.svg'
import DIAMONDS_THREE from './cardFace/diamonds/3.svg'
import DIAMONDS_FOUR from './cardFace/diamonds/4.svg'
import DIAMONDS_FIVE from './cardFace/diamonds/5.svg'
import DIAMONDS_SIX from './cardFace/diamonds/6.svg'
import DIAMONDS_SEVEN from './cardFace/diamonds/7.svg'
import DIAMONDS_EIGHT from './cardFace/diamonds/8.svg'
import DIAMONDS_NINE from './cardFace/diamonds/9.svg'
import DIAMONDS_ACE from './cardFace/diamonds/ace.svg'
import DIAMONDS_JACK from './cardFace/diamonds/jack.svg'
import DIAMONDS_KING from './cardFace/diamonds/king.svg'
import DIAMONDS_QUEEN from './cardFace/diamonds/queen.svg'
import HEARTHS_TEN from './cardFace/hearths/10.svg'
import HEARTHS_TWO from './cardFace/hearths/2.svg'
import HEARTHS_THREE from './cardFace/hearths/3.svg'
import HEARTHS_FOUR from './cardFace/hearths/4.svg'
import HEARTHS_FIVE from './cardFace/hearths/5.svg'
import HEARTHS_SIX from './cardFace/hearths/6.svg'
import HEARTHS_SEVEN from './cardFace/hearths/7.svg'
import HEARTHS_EIGHT from './cardFace/hearths/8.svg'
import HEARTHS_NINE from './cardFace/hearths/9.svg'
import HEARTHS_ACE from './cardFace/hearths/ace.svg'
import HEARTHS_JACK from './cardFace/hearths/jack.svg'
import HEARTHS_KING from './cardFace/hearths/king.svg'
import HEARTHS_QUEEN from './cardFace/hearths/queen.svg'
import SPADES_TEN from './cardFace/spades/10.svg'
import SPADES_TWO from './cardFace/spades/2.svg'
import SPADES_THREE from './cardFace/spades/3.svg'
import SPADES_FOUR from './cardFace/spades/4.svg'
import SPADES_FIVE from './cardFace/spades/5.svg'
import SPADES_SIX from './cardFace/spades/6.svg'
import SPADES_SEVEN from './cardFace/spades/7.svg'
import SPADES_EIGHT from './cardFace/spades/8.svg'
import SPADES_NINE from './cardFace/spades/9.svg'
import SPADES_ACE from './cardFace/spades/ace.svg'
import SPADES_JACK from './cardFace/spades/jack.svg'
import SPADES_KING from './cardFace/spades/king.svg'
import SPADES_QUEEN from './cardFace/spades/queen.svg'

export default function CardFrontFace({color, rank}: {color: Color, rank: Rank}) {
  // Kudos for (most of the) minification of the original SVG files goes to: https://jakearchibald.github.io/svgomg/
  const ImageComponent = (() => {
    switch (color) {
      case Color.CLUBS:
        switch (rank) {
          case Rank.ACE:
            return CLUBS_ACE
          case Rank.TWO:
            return CLUBS_TWO
          case Rank.THREE:
            return CLUBS_THREE
          case Rank.FOUR:
            return CLUBS_FOUR
          case Rank.FIVE:
            return CLUBS_FIVE
          case Rank.SIX:
            return CLUBS_SIX
          case Rank.SEVEN:
            return CLUBS_SEVEN
          case Rank.EIGHT:
            return CLUBS_EIGHT
          case Rank.NINE:
            return CLUBS_NINE
          case Rank.TEN:
            return CLUBS_TEN
          case Rank.JACK:
            return CLUBS_JACK
          case Rank.QUEEN:
            return CLUBS_QUEEN
          case Rank.KING:
            return CLUBS_KING
          default:
            throw new Error(`Unknown card rank: ${rank}`)
        }
      case Color.DIAMONDS:
        switch (rank) {
          case Rank.ACE:
            return DIAMONDS_ACE
          case Rank.TWO:
            return DIAMONDS_TWO
          case Rank.THREE:
            return DIAMONDS_THREE
          case Rank.FOUR:
            return DIAMONDS_FOUR
          case Rank.FIVE:
            return DIAMONDS_FIVE
          case Rank.SIX:
            return DIAMONDS_SIX
          case Rank.SEVEN:
            return DIAMONDS_SEVEN
          case Rank.EIGHT:
            return DIAMONDS_EIGHT
          case Rank.NINE:
            return DIAMONDS_NINE
          case Rank.TEN:
            return DIAMONDS_TEN
          case Rank.JACK:
            return DIAMONDS_JACK
          case Rank.QUEEN:
            return DIAMONDS_QUEEN
          case Rank.KING:
            return DIAMONDS_KING
          default:
            throw new Error(`Unknown card rank: ${rank}`)
        }
      case Color.HEARTHS:
        switch (rank) {
          case Rank.ACE:
            return HEARTHS_ACE
          case Rank.TWO:
            return HEARTHS_TWO
          case Rank.THREE:
            return HEARTHS_THREE
          case Rank.FOUR:
            return HEARTHS_FOUR
          case Rank.FIVE:
            return HEARTHS_FIVE
          case Rank.SIX:
            return HEARTHS_SIX
          case Rank.SEVEN:
            return HEARTHS_SEVEN
          case Rank.EIGHT:
            return HEARTHS_EIGHT
          case Rank.NINE:
            return HEARTHS_NINE
          case Rank.TEN:
            return HEARTHS_TEN
          case Rank.JACK:
            return HEARTHS_JACK
          case Rank.QUEEN:
            return HEARTHS_QUEEN
          case Rank.KING:
            return HEARTHS_KING
          default:
            throw new Error(`Unknown card rank: ${rank}`)
        }
      case Color.SPADES:
        switch (rank) {
          case Rank.ACE:
            return SPADES_ACE
          case Rank.TWO:
            return SPADES_TWO
          case Rank.THREE:
            return SPADES_THREE
          case Rank.FOUR:
            return SPADES_FOUR
          case Rank.FIVE:
            return SPADES_FIVE
          case Rank.SIX:
            return SPADES_SIX
          case Rank.SEVEN:
            return SPADES_SEVEN
          case Rank.EIGHT:
            return SPADES_EIGHT
          case Rank.NINE:
            return SPADES_NINE
          case Rank.TEN:
            return SPADES_TEN
          case Rank.JACK:
            return SPADES_JACK
          case Rank.QUEEN:
            return SPADES_QUEEN
          case Rank.KING:
            return SPADES_KING
          default:
            throw new Error(`Unknown card rank: ${rank}`)
        }
      default:
        throw new Error(`Unknown card color: ${color}`)
    }
  })()

  return <ImageComponent/>
}
