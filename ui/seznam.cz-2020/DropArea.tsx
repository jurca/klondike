import classnames from 'classnames'
import * as React from 'react'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'
import styles from './dropArea.css'

interface IProps {
  className?: string
  areaId: unknown
  children: React.ReactNode
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'drop-area': any
    }
  }
}

export default function DropArea({className, areaId, children}: IProps) {
  const dragNDropContext = React.useContext(DRAG_N_DROP_CONTEXT)
  const ref = React.useRef()
  React.useEffect(() => {
    const element = ref.current
    if (element) {
      dragNDropContext.dropAreasIds.set(element, areaId)

      return () => {
        dragNDropContext.dropAreasIds.delete(element!)
      }
    }

    return undefined
  }, [ref.current])

  return <drop-area class={classnames(styles.dropArea, className)} ref={ref}>{children}</drop-area>
}
