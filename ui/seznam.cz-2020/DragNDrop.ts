import {augmentor, createContext, useEffect, useMemo, useRef} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'
import getRectanglesOverlap from 'rectangle-overlap'
import style from './dragNDrop.css'

interface IDragNDropContext {
  dragged: null | Element
  selected: null | Element
  currentDropArea: null | Element
  draggedElementOffset: {x: number, y: number}
  draggedElementOriginalPosition: {x: number, y: number}
  draggedElementPosition: {x: number, y: number}
}

type DragCallback = (draggedElement: Element, dropArea: Element) => void

export const DRAG_N_DROP_CONTEXT = createContext<IDragNDropContext>({
  currentDropArea: null,
  dragged: null,
  draggedElementOffset: {
    x: 0,
    y: 0,
  },
  draggedElementOriginalPosition: {
    x: 0,
    y: 0,
  },
  draggedElementPosition: {
    x: 0,
    y: 0,
  },
  selected: null,
})

export default augmentor(function DragNDrop(content: Hole, onElementDragged: DragCallback) {
  const onClickListener = useMemo(() => onClick.bind(null, onElementDragged), [onElementDragged])
  const onMouseUpListener = useMemo(() => onMouseUp.bind(null, onElementDragged), [onElementDragged])
  const onTouchEndListener = useMemo(() => onTouchEnd.bind(null, onElementDragged), [onElementDragged])

  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const {current: container} = containerRef
    if (container) {
      container.addEventListener('mousedown', onMouseDown)
      container.addEventListener('touchstart', onTouchStart)
      container.addEventListener('click', onClickListener)
    }

    const onMouseMoveListener = onMouseMove.bind(null, container)
    const onTouchMoveListener = onTouchMove.bind(null, container)
    addEventListener('mousemove', onMouseMoveListener)
    addEventListener('touchmove', onTouchMoveListener)
    addEventListener('mouseup', onMouseUpListener)
    addEventListener('touchend', onTouchEndListener)

    return () => {
      removeEventListener('mousemove', onMouseMoveListener)
      removeEventListener('touchmove', onTouchMoveListener)
      removeEventListener('mouseup', onMouseUpListener)
      removeEventListener('touchend', onTouchEndListener)
      if (container) {
        container.removeEventListener('mousedown', onMouseDown)
        container.removeEventListener('touchstart', onTouchStart)
        container.removeEventListener('click', onClickListener)
      }
    }
  })

  return html`
    <drag-n-drop class=${style.container} ref=${containerRef}>
      ${content}
    </drag-n-drop>
  `
})

let currentlyTrackedTouchId: null | number = null

function onTouchStart(event: Event): void {
  if (!(event instanceof TouchEvent) || currentlyTrackedTouchId) {
    return
  }

  const currentTouch = event.changedTouches[0]
  if (!currentTouch || !(currentTouch.target instanceof Element)) {
    return
  }

  currentlyTrackedTouchId = currentTouch.identifier
  const dragContainer = currentTouch.target.closest('ui-draggable')
  if (dragContainer) {
    onDragStart(dragContainer, {
      x: currentTouch.pageX,
      y: currentTouch.pageY,
    })
  }

  event.preventDefault()
}

function onMouseDown(event: Event): void {
  if (!(event instanceof MouseEvent) || !(event.target instanceof Element)) {
    return
  }

  const dragContainer = event.target.closest('ui-draggable')
  if (dragContainer) {
    onDragStart(dragContainer, {
      x: event.pageX,
      y: event.pageY,
    })
  }
}

function onDragStart(draggedElement: Element, pointerOnPagePosition: {x: number, y: number}): void {
  const bounds = draggedElement.getBoundingClientRect()
  DRAG_N_DROP_CONTEXT.provide({
    ...DRAG_N_DROP_CONTEXT.value,
    dragged: draggedElement,
    draggedElementOffset: {
      x: bounds.x - pointerOnPagePosition.x,
      y: bounds.y - pointerOnPagePosition.y,
    },
    draggedElementOriginalPosition: {
      x: bounds.x,
      y: bounds.y,
    },
    draggedElementPosition: {
      x: bounds.x,
      y: bounds.y,
    },
  })
}

function onTouchMove(container: null | HTMLElement, event: Event): void {
  if (!container || !(event instanceof TouchEvent)) {
    return
  }

  const currentTouch = [...event.changedTouches].find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (!currentTouch) {
    return
  }

  onDrag(container, {
    x: currentTouch.pageX,
    y: currentTouch.pageY,
  })
}

function onMouseMove(container: null | HTMLElement, event: Event): void {
  if (!container || !(event instanceof MouseEvent) || !DRAG_N_DROP_CONTEXT.value.dragged) {
    return
  }

  onDrag(container, {
    x: event.pageX,
    y: event.pageY,
  })
}

function onDrag(container: HTMLElement, pointerOnPagePosition: {x: number, y: number}): void {
  const currentDropArea = [...container.querySelectorAll('drop-area')].find((candidateArea) => {
    const bounds = candidateArea.getBoundingClientRect()
    return getRectanglesOverlap(bounds, {...pointerOnPagePosition, width: 1, height: 1})
  })

  DRAG_N_DROP_CONTEXT.provide({
    ...DRAG_N_DROP_CONTEXT.value,
    currentDropArea: currentDropArea || null,
    draggedElementPosition: {
      x: pointerOnPagePosition.x + DRAG_N_DROP_CONTEXT.value.draggedElementOffset.x,
      y: pointerOnPagePosition.y + DRAG_N_DROP_CONTEXT.value.draggedElementOffset.y,
    },
  })
}

function onTouchEnd(dragCallback: DragCallback, event: Event): void {
  if (!(event instanceof TouchEvent)) {
    return
  }

  const currentTouch = [...event.changedTouches].find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (currentTouch) {
    currentlyTrackedTouchId = null
    onDragEnd(dragCallback)
  }
}

function onMouseUp(dragCallback: DragCallback): void {
  if (DRAG_N_DROP_CONTEXT.value.dragged) {
    onDragEnd(dragCallback)
  }
}

function onDragEnd(dragCallback: DragCallback) {
  if (DRAG_N_DROP_CONTEXT.value.dragged && DRAG_N_DROP_CONTEXT.value.currentDropArea) {
    dragCallback(DRAG_N_DROP_CONTEXT.value.dragged, DRAG_N_DROP_CONTEXT.value.currentDropArea)
  }

  DRAG_N_DROP_CONTEXT.provide({
    ...DRAG_N_DROP_CONTEXT.value,
    currentDropArea: null,
    dragged: null,
  })
}

function onClick(dragCallback: DragCallback, {target}: Event): void {
  if (!(target instanceof Element)) {
    return
  }

  const dropArea = target.closest('drop-area')
  if (DRAG_N_DROP_CONTEXT.value.selected && dropArea) {
    dragCallback(DRAG_N_DROP_CONTEXT.value.selected, dropArea)
    DRAG_N_DROP_CONTEXT.provide({
      ...DRAG_N_DROP_CONTEXT.value,
      selected: null,
    })
    return
  }

  const draggable = target.closest('ui-draggable')
  if (draggable) {
    DRAG_N_DROP_CONTEXT.provide({
      ...DRAG_N_DROP_CONTEXT.value,
      selected: draggable === DRAG_N_DROP_CONTEXT.value.selected ? null : draggable,
    })
  }
}
