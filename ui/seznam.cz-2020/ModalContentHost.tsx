import classnames from 'classnames'
import * as React from 'react'
import CloseIcon from './icon/close.svg'
import BackIcon from './icon/left.svg'
import styles from './modalContentHost.css'

export enum State {
  CLOSED = 'State.CLOSED',
  OPEN = 'State.OPEN',
}

export enum Type {
  FLOATING = 'Type.FLOATING',
  DRAWER = 'Type.DRAWER',
}

interface IProps {
  state: State
  type: Type
  isNested: boolean
  header: null | string
  children: React.ReactChild
  onClose(): void
  onReturn(): void
}

enum InternalState {
  CLOSED = 'InternalState.CLOSED',
  OPENING = 'InternalState.OPENING',
  OPEN = 'InternalState.OPEN',
  CLOSING = 'InternalState.CLOSING',
}

export default function ModalContentHost(props: IProps): null | React.ReactElement {
  const [internalState, setInternalState] = React.useState<InternalState>(InternalState.CLOSED)
  React.useEffect(() => {
    let newInternalState: null | InternalState = null
    if (internalState === InternalState.CLOSED && props.state !== State.CLOSED) {
      newInternalState = InternalState.OPENING
    } else if (internalState !== InternalState.CLOSED && props.state === State.CLOSED) {
      newInternalState = InternalState.CLOSING
    } else if (internalState === InternalState.OPENING) {
      newInternalState = InternalState.OPEN
    }

    if (newInternalState) {
      const requestId = requestAnimationFrame(() => setInternalState(newInternalState!))
      return () => cancelAnimationFrame(requestId)
    }

    return undefined
  })

  const onTransitionEnd = React.useMemo(
    () => () => {
      if (internalState === InternalState.CLOSING) {
        setInternalState(InternalState.CLOSED)
      }
    },
    [internalState === InternalState.CLOSING, setInternalState],
  )

  if (internalState === InternalState.CLOSED) {
    return null
  }

  const flipControls = !props.isNested && !/^apple/i.test((typeof navigator !== 'undefined' && navigator.vendor) || '')

  return (
    <div
      className={classnames(
        styles.modalContentHost,
        internalState === InternalState.OPEN && styles.isOpen,
        props.type === Type.DRAWER && styles.isDrawer,
        props.header && styles.hasTitle,
        flipControls && styles.flipHeaderButtons,
      )}
      onTransitionEnd={onTransitionEnd}
    >
      <div className={styles.uiWrapper}>
        <button className={styles.overlay} onClick={props.onClose}/>
        <div className={styles.ui}>
          <div className={styles.header}>
            <div className={styles.headerButtonContainer}>
              <button className={styles.headerButton} onClick={props.isNested ? props.onReturn : props.onClose}>
                {props.isNested ?
                  <BackIcon/>
                :
                  <CloseIcon/>
                }
              </button>
            </div>
            <div className={styles.headerTitle}>
              {props.header}
            </div>
            <div className={styles.headerButtonContainer}/>
          </div>
          <div className={styles.content}>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}
