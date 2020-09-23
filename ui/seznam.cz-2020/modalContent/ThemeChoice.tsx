import * as React from 'react'
import CircledCheckMarkIcon from '../icon/circled-check-mark.svg'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'
import styles from './themeChoice.css'

interface IProps extends IModalContentComponentProps {
  readonly children: ReadonlyArray<{
    readonly ui: React.ReactElement,
    readonly isSelected: boolean,
    readonly confirmationUI: ModalContentComponent,
  }>
}

export default function ThemeChoice(props: IProps): React.ReactElement {
  const confirmationUiTriggers = React.useMemo(
    () => props.children.map(({confirmationUI}) => () => props.onShowContent(confirmationUI, true)),
    [props.children, props.onShowContent],
  )

  return (
    <ModalContentWithBottomCloseButton {...props}>
      <div className={styles.themeChoice}>
        {props.children.map(({ui, isSelected}, index) =>
          <button key={index} className={styles.option} onClick={confirmationUiTriggers[index]}>
            <div className={styles.optionUiContainer}>
              {ui}
            </div>
            {isSelected &&
              <div className={styles.selectedOptionOverlay}>
                <CircledCheckMarkIcon/>
              </div>
            }
          </button>,
        )}
      </div>
    </ModalContentWithBottomCloseButton>
  )
}
