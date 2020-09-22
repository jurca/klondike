import * as React from 'react'
import Button from './Button'
import {IModalContentComponentProps} from './ModalContentComponent'
import styles from './modalContentWithBottomCloseButton.css'

interface IProps extends IModalContentComponentProps {
  children: React.ReactChild | React.ReactChild[]
}

export default function ModalContentWithBottomCloseButton(props: IProps) {
  return (
    <div className={styles.container}>
      {props.children}
      <Button className={styles.closeButton} onClick={props.onCloseModalContent}>
        Zpět do hry
      </Button>
    </div>
  )
}
