import classnames from 'classnames'
import * as React from 'react'
import {Type} from '../ModalContentHost'
import styles from './gameplayStatistics.css'
import ListingItem from './ListingItem'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'
import VictoryIcon from './victory.svg'

const GameplayStatistics: ModalContentComponent = Object.assign(
  function GameplayStatisticsUI(props: IModalContentComponentProps) {
    const [drawnCards, setDrawnCards] = React.useState<1 | 3>(1)
    const onSet1DrawnCard = React.useMemo(() => () => setDrawnCards(1), [setDrawnCards])
    const onSet3DrawnCard = React.useMemo(() => () => setDrawnCards(3), [setDrawnCards])
    const statistics = props.gameplayStats[drawnCards]

    return (
      <ModalContentWithBottomCloseButton {...props}>
        <div className={styles.gameplayStatistics}>
          <div className={styles.drawnCardsSwitchPanel}>
            <button
              className={classnames(styles.drawnCardsSwitchButton, drawnCards === 1 && styles.activeDrawnCardsButton)}
              onClick={onSet1DrawnCard}
            >
              1 Karta
            </button>
            <button
              className={classnames(styles.drawnCardsSwitchButton, drawnCards === 3 && styles.activeDrawnCardsButton)}
              onClick={onSet3DrawnCard}
            >
              3 Karty
            </button>
          </div>
          <div className={styles.content}>
            <ListingItem
              leftContent={
                <span className={styles.statisticWithIcon}>
                  <span className={styles.victoryIcon}>
                    <VictoryIcon/>
                  </span>
                  Vyhrané hry
                </span>
              }
              rightContent={
                <span className={styles.positiveStatistic}>{statistics.wonGamesCount}</span>
              }
            />
            <hr className={styles.separator}/>
            <ListingItem
              leftContent='Nejkratší vyhraná hra'
              rightContent={
                <span className={styles.positiveStatistic}>{formatDuration(statistics.shortestWonGameDuration)}</span>
              }
            />
            <ListingItem
              leftContent='Nejdelší vyhraná hra'
              rightContent={
                <span className={styles.negativeStatistic}>{formatDuration(statistics.longestWonGameDuration)}</span>
              }
            />
            <hr className={styles.separator}/>
            <ListingItem
              leftContent='Nejméně kroků k vítězství'
              rightContent={<span className={styles.positiveStatistic}>{statistics.leastMovesToVictory}</span>}
            />
            <ListingItem
              leftContent='Nejvíc kroků k vítězství'
              rightContent={<span className={styles.negativeStatistic}>{statistics.mostMovesToVictory}</span>}
            />
            <hr className={styles.separator}/>
            <ListingItem
              leftContent='Vyhrané hry bez kroku zpět'
              rightContent={<span className={styles.positiveStatistic}>{statistics.gamesWonWithoutUndoCount}</span>}
            />
          </div>
        </div>
      </ModalContentWithBottomCloseButton>
    )
  },
  {
    title: 'Skóre',
    type: Type.DRAWER,
  },
)

export default GameplayStatistics

function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1_000)
  const parts = [Math.floor(seconds / 60), seconds % 60]
  return parts.map((part, index) => index ? `${part}`.padStart(2, '0') : `${part}`).join(':')
}
