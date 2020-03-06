import classnames from 'classnames'
import {augmentor, useContext, useRef} from 'dom-augmentor'
import {Hole} from 'lighterhtml'
import styles from './draggable.css'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'
import {hookedHtml} from './hookedHtml'

export default augmentor(function draggable(id: string, content: Hole | HTMLElement) {
  const dragNDropContext = useContext(DRAG_N_DROP_CONTEXT)
  const wrapperRef = useRef<HTMLElement>()

  const isDragged = dragNDropContext.dragged === wrapperRef.current
  const {draggedElementOriginalPosition, draggedElementPosition} = dragNDropContext
  const deltaX = draggedElementPosition.x - draggedElementOriginalPosition.x
  const deltaY = draggedElementPosition.y - draggedElementOriginalPosition.y

  return hookedHtml(id)`
    <ui-draggable
      class=${classnames(styles.draggable, isDragged && styles.isDragged)}
      style=${isDragged ? `transform: translateX(${deltaX}px) translateY(${deltaY}px)` : null}
      ref=${wrapperRef}
    >
      ${content}
    </ui-draggable>
  `
})
