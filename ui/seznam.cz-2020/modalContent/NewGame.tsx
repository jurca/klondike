import NEW_GAME_IMAGE from '!!raw-loader!./new-game.svg'
import * as React from 'react'
import Button from './Button'
import ModalContentComponent, {IModalContentComponentProps, Type} from './ModalContentComponent'
import styles from './newGame.css'

const NewGame: ModalContentComponent = Object.assign(function NewGameUI(props: IModalContentComponentProps) {
  const onStartNewGameWith1DrawnCard = React.useMemo(() => props.onNewGame.bind(null, 1), [props.onNewGame])
  const onStartNewGameWith3DrawnCards = React.useMemo(() => props.onNewGame.bind(null, 3), [props.onNewGame])

  return (
    <div className={styles.newGame}>
      <img className={styles.titleImage} src={`data:image/svg+xml;base64,${btoa(NEW_GAME_IMAGE)}`} alt=''/>
      <h1 className={styles.title}>Nová hra</h1>
      <p className={styles.drawnCardsChoiceLabel}>
        Počet karet tažených z&nbsp;balíčku
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
