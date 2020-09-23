import PAUSED_GAME_IMAGE from '!!raw-loader!./paused-game.svg'
import * as React from 'react'
import {Type} from '../ModalContentHost'
import Button from './Button'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import NewGame from './NewGame'
import styles from './pausedGame.css'

const PausedGame: ModalContentComponent = Object.assign(function PausedGameUI(props: IModalContentComponentProps) {
  const onResumeGame = React.useMemo(() => () => props.onResumePreviousGame(), [props.onResumePreviousGame])
  const onStartNewGame = React.useMemo(() => () => props.onShowContent(NewGame, false), [props.onShowContent])

  return (
    <div className={styles.pausedGame}>
      <div className={styles.titleImageWrapper}>
        <img className={styles.titleImage} src={`data:image/svg+xml;base64,${btoa(PAUSED_GAME_IMAGE)}`} alt=''/>
      </div>
      <h1 className={styles.title}>Solitaire je pozastaven</h1>
      <div className={styles.buttons}>
        <Button onClick={onResumeGame}>Pokračovat</Button>
        <Button onClick={onStartNewGame}>Nová hra</Button>
      </div>
    </div>
  )
}, {
  title: '',
  type: Type.FLOATING,
})

export default PausedGame
