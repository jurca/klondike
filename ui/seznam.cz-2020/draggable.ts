import {augmentor, useContext, useEffect, useRef} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'

export default augmentor(function draggable(content: Hole): Hole {
  const dragNDropContext = useContext(DRAG_N_DROP_CONTEXT)
  const wrapperRef = useRef<HTMLElement>()
  useEffect(() => {
    const wrapperNode = wrapperRef.current
    if (wrapperNode) {
      dragNDropContext.draggable.add(wrapperNode)
      return () => {
        dragNDropContext.draggable.delete(wrapperNode)
      }
    }

    return undefined
  }, [wrapperRef])

  return html`<ui-draggable ref=${wrapperRef}>${content}</ui-draggable>`
})
