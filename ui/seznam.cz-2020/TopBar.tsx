import classnames from 'classnames'
import * as React from 'react'
import {IGame, isVictory} from '../../game/Game'
import {MoveType} from '../../game/Move'
import {lastItem, lastItemOrNull} from '../../game/util'
import Gear from './icon/gear.svg'
import style from './topBar.css'

const IGNORED_MOVES = [
  MoveType.REVEAL_TABLEAU_CARD,
  MoveType.PAUSE,
  MoveType.RESUME,
]

interface IProps {
  game: null | IGame
  onShowSettings(): void
}

export default function TopBar({game, onShowSettings}: IProps): React.ReactElement {
  const [, tick] = React.useState()
  const gameplayDuration = game ? getGameplayDuration(game) : null
  React.useEffect(() => {
    if (gameplayDuration) {
      const timeoutId = setTimeout(tick, 1_000 - (gameplayDuration % 1_000), gameplayDuration)
      return () => clearTimeout(timeoutId)
    }

    return () => undefined
  })

  const gameplayDurationSeconds = gameplayDuration !== null ? Math.floor(gameplayDuration / 1_000) : null
  const preformattedGameplayDuration: Array<number | string> = gameplayDurationSeconds !== null ?
    [Math.floor(gameplayDurationSeconds / 60), gameplayDurationSeconds % 60]
  :
    ['--', '--']
  const moveCount = game?.history.filter((record) => !IGNORED_MOVES.includes(record[1].move)).length ?? 0

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

function getGameplayDuration(game: IGame): number {
  const endTimestamp = isVictory(game) ? lastItem(game.history)[1].logicalTimestamp : performance.now()
  const {previousTimestamp: lastTimestamp, sum} = game.history.reduce<{previousTimestamp: number, sum: number}>(
    ({previousTimestamp, sum: partialSum}, [, move]) => {
      const {move: moveType, logicalTimestamp} = move
      const timeDelta = moveType === MoveType.RESUME ? 0 : logicalTimestamp - previousTimestamp
      return {
        previousTimestamp: logicalTimestamp,
        sum: partialSum + timeDelta,
      }
    },
    {
      previousTimestamp: game.startTime.logicalTimestamp,
      sum: 0,
    },
  )

  return lastItemOrNull(game.history)?.[1].move !== MoveType.PAUSE ? sum + (endTimestamp - lastTimestamp) : sum
}
