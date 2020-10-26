import NEW_GAME_IMAGE from '!!raw-loader!./new-game.svg'
import * as React from 'react'
import {Type} from '../ModalContentHost'
import Button from './Button'
import styles from './congratulations.css'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'

const Congratulations: ModalContentComponent = Object.assign(
  function CongratulationsUI(props: IModalContentComponentProps) {
    const onStartNewGameWith1DrawnCard = React.useMemo(() => props.onNewGame.bind(null, 1), [props.onNewGame])
    const onStartNewGameWith3DrawnCards = React.useMemo(() => props.onNewGame.bind(null, 3), [props.onNewGame])

    return (
      <div className={styles.congratulations}>
        <div className={styles.titleImageWrapper}>
          <img className={styles.titleImage} src={`data:image/svg+xml;base64,${btoa(NEW_GAME_IMAGE)}`} alt=''/>
        </div>
        <h1 className={styles.title}>Gratulujeme k výhře!</h1>
        <p className={styles.drawnCardsChoiceLabel}>
          Chcete začít novou hru? Vyberte si obtížnost:
        </p>
        <div className={styles.buttons}>
          <Button onClick={onStartNewGameWith1DrawnCard}>1 karta</Button>
          <Button onClick={onStartNewGameWith3DrawnCards}>3 karty</Button>
        </div>
      </div>
    )
  },
  {
    title: null,
    type: Type.FLOATING,
  },
)

export default Congratulations
