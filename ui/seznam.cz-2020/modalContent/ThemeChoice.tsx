import * as React from 'react'
import CircledCheckMarkIcon from '../icon/circled-check-mark.svg'
import {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'
import styles from './themeChoice.css'

interface IProps extends IModalContentComponentProps {
  readonly children: ReadonlyArray<{
    readonly ui: React.ReactElement,
    readonly isSelected: boolean,
  }>
}

export default function ThemeChoice(props: IProps): React.ReactElement {
  return (
    <ModalContentWithBottomCloseButton {...props}>
      <div className={styles.themeChoice}>
        {props.children.map(({ui, isSelected}) =>
          <div className={styles.option}>
            <div className={styles.optionUiContainer}>
              {ui}
            </div>
            {isSelected &&
              <div className={styles.selectedOptionOverlay}>
                <CircledCheckMarkIcon/>
              </div>
            }
          </div>,
        )}
      </div>
    </ModalContentWithBottomCloseButton>
  )
}
