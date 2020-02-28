import {augmentor, useContext, useEffect, useRef} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'
import styles from './draggable.css'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'

export default augmentor(function draggable(content: Hole): Hole {
  const dragNDropContext = useContext(DRAG_N_DROP_CONTEXT)
  const wrapperRef = useRef<HTMLElement>()
  useEffect(() => {
    const wrapperNode = wrapperRef.current
    if (wrapperNode) {
      // For some reason updating the attributes via lighterhtml does not work :(
      if (dragNDropContext.dragged === wrapperNode) {
        const {draggedElementOriginalPosition, draggedElementPosition} = dragNDropContext
        const deltaX = draggedElementPosition.x - draggedElementOriginalPosition.x
        const deltaY = draggedElementPosition.y - draggedElementOriginalPosition.y
        wrapperNode.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px)`
        wrapperNode.classList.add(styles.isDragged)
      } else if (wrapperNode.style.transform) {
        wrapperNode.style.transform = ''
        wrapperNode.classList.remove(styles.isDragged)
      }
    }

    return undefined
  }, [wrapperRef, dragNDropContext.dragged, dragNDropContext.draggedElementPosition])

  return html`
    <ui-draggable
      class=${styles.draggable}
      ref=${wrapperRef}
    >
      ${content}
    </ui-draggable>
  `
})
