import * as React from 'react'
import {Color} from '../../game/Card'
import style from './foundationPile.css'
import settingsContext from './settingsContext'

export default React.forwardRef(function FoundationPile({color}: {color: Color}, ref: React.Ref<Element>) {
  const settings = React.useContext(settingsContext)
  const {dark: darkColor, light: lightColor} = settings.foundationBackgroundColor

  // Kudos for (most of the) minification of the original SVG files goes to: https://jakearchibald.github.io/svgomg/
  return (
    <div className={style.pile} ref={ref as React.Ref<HTMLDivElement>}>
      <div className={style.card}>
        {color === Color.CLUBS &&
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 120'><path d='M8 0h64c4.432 0 8 3.568 8 8v104c0 4.432-3.568 8-8 8H8c-4.432 0-8-3.568-8-8V8c0-4.432 3.568-8 8-8z' fill={lightColor}/><path d='M10 6h60c2.216 0 4 1.784 4 4v100c0 2.216-1.784 4-4 4H10c-2.216 0-4-1.784-4-4V10c0-2.216 1.784-4 4-4z' fill={darkColor}/><path d='M46 88a6 6 0 11-6-6 6 6 0 016 6zm6.62-36a14 14 0 10-25.24 0A14 14 0 1040 73.18 14 14 0 1052.62 52z' fill={lightColor}/></svg>
        }
        {color === Color.DIAMONDS &&
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 120'><rect rx='8' height='120' width='80' fill={lightColor}/><rect rx='4' height='108' width='68' y='6' x='6' fill={darkColor}/><path d='M61.46 64.73l-19 28.5a2.84 2.84 0 01-4.74 0l-19-28.5a4 4 0 010-4.44l19-28.51a2.84 2.84 0 014.74 0l19 28.51a4 4 0 010 4.44z' fill={lightColor}/></svg>
        }
        {color === Color.HEARTHS &&
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 120'><path d='M8 0h64c4.432 0 8 3.568 8 8v104c0 4.432-3.568 8-8 8H8c-4.432 0-8-3.568-8-8V8c0-4.432 3.568-8 8-8z' fill={lightColor}/><path d='M10 6h60c2.216 0 4 1.784 4 4v100c0 2.216-1.784 4-4 4H10c-2.216 0-4-1.784-4-4V10c0-2.216 1.784-4 4-4z' fill={darkColor}/><path d='M52 38a15.93 15.93 0 00-12 5.44A16 16 0 0012 54c0 16 16 22 28 34 12-12 28-18 28-34a16 16 0 00-16-16z' fill={lightColor}/></svg>
        }
        {color === Color.SPADES &&
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 120'><path d='M8 0h64c4.432 0 8 3.568 8 8v104c0 4.432-3.568 8-8 8H8c-4.432 0-8-3.568-8-8V8c0-4.432 3.568-8 8-8z' fill={lightColor}/><path d='M10 6h60c2.216 0 4 1.784 4 4v100c0 2.216-1.784 4-4 4H10c-2.216 0-4-1.784-4-4V10c0-2.216 1.784-4 4-4z' fill={darkColor}/><path d='M66 66a13.68 13.68 0 01-14 14 15.93 15.93 0 01-12-5.44A15.93 15.93 0 0128 80a13.68 13.68 0 01-14-14c0-12 14-20 26-34 12 14 26 22 26 34zM40 82a6 6 0 106 6 6 6 0 00-6-6z' fill={lightColor}/></svg>
        }
      </div>
    </div>
  )
})
