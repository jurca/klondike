import * as React from 'react'
import style from './bottomBar.css'
import Back from './icon/back.svg'
import Pause from './icon/pause.svg'
import SquirclePlus from './icon/squircle-plus.svg'
import SquircleQuestion from './icon/squircle-question.svg'

export default function BottomBar(): React.ReactElement {
  return (
    <div className={style.bottomBar}>
      <div className={style.contentWrapper}>
        <div className={style.content}>
          <div className={style.buttonWrapper}>
            <button className={style.button}>
              <span className={style.icon}>
                <SquirclePlus/>
              </span>
              Nová hra
            </button>
          </div>
          <div className={style.buttonWrapper}>
            <button className={style.button}>
              <span className={style.icon}>
                <Pause/>
              </span>
              Pozastavit
            </button>
          </div>
          <div className={style.buttonWrapper}>
            <button className={style.button}>
              <span className={style.icon}>
                <Back/>
              </span>
              Zpět o krok
            </button>
          </div>
          <div className={style.buttonWrapper}>
            <button className={style.button}>
              <span className={style.icon}>
                <SquircleQuestion/>
              </span>
              Nápověda
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
