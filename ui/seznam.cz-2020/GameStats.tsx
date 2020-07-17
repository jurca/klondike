import * as React from 'react'
import {IGame, isVictory} from '../../game/Game'
import {MoveType} from '../../game/Move'
import {lastItem} from '../../game/util'

export default function GameStats({game}: {game: IGame}) {
  const [, tick] = React.useState()
  const gameplayDuration = (
    (isVictory(game) ? lastItem(game.history)[1].logicalTimestamp : performance.now()) - game.startTime.logicalTimestamp
  )
  setTimeout(tick, 1000 - (gameplayDuration % 1000), gameplayDuration)

  const moveCount = game.history.filter((record) => record[1].move !== MoveType.REVEAL_TABLEAU_CARD).length

  return (
    <div>
      {moveCount} tah{[2, 3, 4].includes(moveCount) ? 'y' : (moveCount === 1 ? '' : 'ů')}
      &nbsp;|&nbsp;
      {Math.floor(gameplayDuration / 60000)}:{Math.floor((gameplayDuration % 60000) / 1000).toString().padStart(2, '0')}
    </div>
  )
}
