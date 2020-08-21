import classnames from 'classnames'
import * as React from 'react'
import {IGame, isVictory} from '../../game/Game'
import {MoveType} from '../../game/Move'
import {lastItem} from '../../game/util'
import Gear from './icon/gear.svg'
import style from './topBar.css'

interface IProps {
  game: IGame
}

export default function TopBar({game}: IProps): React.ReactElement {
  const [, tick] = React.useState()
  const gameplayDuration = (
    (isVictory(game) ? lastItem(game.history)[1].logicalTimestamp : performance.now()) - game.startTime.logicalTimestamp
  )
  React.useEffect(() => {
    const timeoutId = setTimeout(tick, 1_000 - (gameplayDuration % 1_000), gameplayDuration)
    return () => clearTimeout(timeoutId)
  })

  const gameplayDurationSeconds = Math.floor(gameplayDuration / 1_000)
  const preformattedGameplayDuration = [Math.floor(gameplayDurationSeconds / 60), gameplayDurationSeconds % 60]
  const moveCount = game.history.filter((record) => record[1].move !== MoveType.REVEAL_TABLEAU_CARD).length

  return (
    <div className={style.topBar}>
      <div className={style.content}>
        <div className={classnames(style.sideContent, style.textContent)}>
          Čas <span className={style.dynamicInfo}>
            {preformattedGameplayDuration.map((part) => `${part}`.padStart(2, '0')).join(':')}
          </span>
          <span className={style.divider}/>
          Tahů <span className={style.dynamicInfo}>{moveCount}</span>
        </div>
        <div className={style.title}>
          Solitaire
        </div>
        <div className={classnames(style.sideContent, style.textContent)}>
          <button className={style.settings}>
            <span className={style.icon}>
              <Gear/>
            </span>
            Nastavení
          </button>
        </div>
      </div>
    </div>
  )
}
