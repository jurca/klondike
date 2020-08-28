import classnames from 'classnames'
import * as React from 'react'
import {IGame, isVictory} from '../../game/Game'
import {MoveType} from '../../game/Move'
import {lastItem} from '../../game/util'
import Gear from './icon/gear.svg'
import style from './topBar.css'

interface IProps {
  game: IGame
  onShowSettings(): void
}

export default function TopBar({game, onShowSettings}: IProps): React.ReactElement {
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

  const isMobilePhoneOrAndroidTablet = (
    typeof navigator === 'object' &&
    navigator &&
    /(?: iPhone | Android )/.test(navigator.userAgent)
  )

  return (
    <div className={classnames(style.topBar, isMobilePhoneOrAndroidTablet && style.isPhoneOrTablet)}>
      <div className={style.content}>
        <div className={classnames(style.sideContent, style.textContent, style.statsPane)}>
          Čas <span className={style.dynamicInfo}>
            {preformattedGameplayDuration.map((part) => `${part}`.padStart(2, '0')).join(':')}
          </span>
          <span className={style.divider}/>
          Tahů <span className={style.dynamicInfo}>{moveCount}</span>
        </div>
        <div className={style.title}>
          Solitaire
        </div>
        <div className={classnames(style.sideContent, style.textContent, style.settingsPane)}>
          <button className={style.settings} onClick={onShowSettings}>
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
