import * as React from 'react'
import style from './bottomBar.css'
import Back from './icon/back.svg'
import Pause from './icon/pause.svg'
import SquirclePlus from './icon/squircle-plus.svg'
import SquircleQuestion from './icon/squircle-question.svg'

interface IProps {
  onNewGame(): void
  onPauseGame(): void
  onUndo(): void
  onShowHint(): void
}

export default function BottomBar({onNewGame, onPauseGame, onShowHint, onUndo}: IProps): React.ReactElement {
  return (
    <div className={style.bottomBar}>
      <div className={style.contentWrapper}>
        <div className={style.content}>
          <div className={style.buttonWrapper}>
            <button className={style.button} onClick={onNewGame}>
              <span className={style.icon}>
                <SquirclePlus/>
              </span>
              Nová hra
            </button>
          </div>
          <div className={style.buttonWrapper}>
            <button className={style.button} onClick={onPauseGame}>
              <span className={style.icon}>
                <Pause/>
              </span>
              Pozastavit
            </button>
          </div>
          <div className={style.buttonWrapper}>
            <button className={style.button} onClick={onUndo}>
              <span className={style.icon}>
                <Back/>
              </span>
              Zpět o krok
            </button>
          </div>
          <div className={style.buttonWrapper}>
            <button className={style.button} onClick={onShowHint}>
              <span className={style.icon}>
                <SquircleQuestion/>
              </span>
              Poradit tah
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
