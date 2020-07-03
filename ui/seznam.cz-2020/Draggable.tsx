import classnames from 'classnames'
import * as React from 'react'
import styles from './draggable.css'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'

interface IProps {
  children: React.ReactNode
  entity: object
  relatedEntities?: readonly object[]
}

declare global {
  namespace JSX {
    // tslint:disable-next-line:interface-name
    interface IntrinsicElements {
      'ui-draggable': any
    }
  }
}

export default function Draggable({children, entity, relatedEntities}: IProps) {
  const dragNDropContext = React.useContext(DRAG_N_DROP_CONTEXT)
  const wrapperRef = React.useRef<HTMLElement>()

  const isDragged = dragNDropContext.draggedEntities.includes(entity)
  const {draggedElementOriginalPosition, draggedElementPosition} = dragNDropContext
  const deltaX = draggedElementPosition.x - draggedElementOriginalPosition.x
  const deltaY = draggedElementPosition.y - draggedElementOriginalPosition.y

  React.useEffect(() => {
    const element = wrapperRef.current
    if (element) {
      dragNDropContext.draggableEntities.set(element, entity)
      dragNDropContext.relatedEntities.set(entity, relatedEntities || [])

      return () => {
        dragNDropContext.draggableEntities.delete(element)
        dragNDropContext.relatedEntities.delete(entity)
      }
    }

    return undefined
  }, [wrapperRef.current, entity, relatedEntities])

  return (
    <ui-draggable
      class={classnames(styles.draggable, isDragged && styles.isDragged)}
      style={isDragged ? {transform: `translateX(${deltaX}px) translateY(${deltaY}px)`} : null}
      ref={wrapperRef}
    >
      {children}
    </ui-draggable>
  )
}
