import classnames from 'classnames'
import {html, neverland, useContext, useRef} from 'neverland'
import styles from './draggable.css'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'

export default neverland(function draggable(content: unknown) {
  const dragNDropContext = useContext(DRAG_N_DROP_CONTEXT)
  const wrapperRef = useRef<HTMLElement>()

  const isDragged = dragNDropContext.dragged === wrapperRef.current
  const {draggedElementOriginalPosition, draggedElementPosition} = dragNDropContext
  const deltaX = draggedElementPosition.x - draggedElementOriginalPosition.x
  const deltaY = draggedElementPosition.y - draggedElementOriginalPosition.y

  return html`
    <ui-draggable
      class=${classnames(styles.draggable, isDragged && styles.isDragged)}
      style=${isDragged ? `transform: translateX(${deltaX}px) translateY(${deltaY}px)` : null}
      ref=${wrapperRef}
    >
      ${content}
    </ui-draggable>
  `
})
