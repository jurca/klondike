import * as React from 'react'
import {IGame} from '../../game/Game'
import {MoveType} from '../../game/Move'

export default function GameStats({game}: {game: IGame}) {
  const [, tick] = React.useState()
  const timeSinceStart = performance.now() - game.startTime.logicalTimestamp
  setTimeout(tick, 1000 - (timeSinceStart % 1000), timeSinceStart)

  const moveCount = game.history.filter((record) => record[1].move !== MoveType.REVEAL_TABLEAU_CARD).length

  return (
    <div>
      {moveCount} tah{[2, 3, 4].includes(moveCount) ? 'y' : (moveCount === 1 ? '' : 'ů')}
      &nbsp;|&nbsp;
      {Math.floor(timeSinceStart / 60000)}:{Math.floor((timeSinceStart % 60000) / 1000).toString().padStart(2, '0')}
    </div>
  )
}
