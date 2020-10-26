import DIFFICULTY_IMAGE from '!!raw-loader!./difficulty.svg'
import * as React from 'react'
import {Type} from '../ModalContentHost'
import Button from './Button'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import styles from './newGame.css'

const NewGame: ModalContentComponent = Object.assign(function NewGameUI(props: IModalContentComponentProps) {
  const onStartNewGameWith1DrawnCard = React.useMemo(() => props.onNewGame.bind(null, 1), [props.onNewGame])
  const onStartNewGameWith3DrawnCards = React.useMemo(() => props.onNewGame.bind(null, 3), [props.onNewGame])

  return (
    <div className={styles.newGame}>
      <div className={styles.titleImageWrapper}>
        <img className={styles.titleImage} src={`data:image/svg+xml;base64,${btoa(DIFFICULTY_IMAGE)}`} alt=''/>
      </div>
      <h1 className={styles.title}>Nová hra</h1>
      <p className={styles.drawnCardsChoiceLabel}>
        Vyberte si obtížnost nové hry
      </p>
      <div className={styles.buttons}>
        <Button onClick={onStartNewGameWith1DrawnCard}>1 karta</Button>
        <Button onClick={onStartNewGameWith3DrawnCards}>3 karty</Button>
      </div>
    </div>
  )
}, {
  title: null,
  type: Type.FLOATING,
})

export default NewGame
