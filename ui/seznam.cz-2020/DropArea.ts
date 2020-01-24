import {augmentor, useContext, useEffect, useRef} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'
import {DRAG_N_DROP_CONTEXT} from './DragNDrop'

export default augmentor(function DropArea(content: Hole) {
  const dragNDropContext = useContext(DRAG_N_DROP_CONTEXT)
  const wrapperRef = useRef<HTMLElement>()
  useEffect(() => {
    const wrapperNode = wrapperRef.current
    if (wrapperNode) {
      dragNDropContext.dropAreas.add(wrapperNode)
      return () => {
        dragNDropContext.dropAreas.delete(wrapperNode)
      }
    }

    return undefined
  })

  return html`<drop-area ref=${wrapperRef}>${content}</drop-area>`
})
