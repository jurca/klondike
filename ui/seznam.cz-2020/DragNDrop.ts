import {augmentor, createContext, useContext, useEffect, useMemo, useRef} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'
import getRectanglesOverlap from 'rectangle-overlap'
import style from './dragNDrop.css'

interface IDragNDropContext {
  draggable: Set<Element>
  dragged: null | Element
  ghost: null | Element
  selected: null | Element
  dropAreas: Set<Element>
  currentDropArea: null | Element
  draggedElementOffset: {x: number, y: number}
  draggedElementPosition: {x: number, y: number}
}

type DragCallback = (draggedElement: Element, dropArea: Element) => void

export const DRAG_N_DROP_CONTEXT = createContext<IDragNDropContext>({
  currentDropArea: null,
  draggable: new Set(),
  dragged: null,
  draggedElementOffset: {
    x: 0,
    y: 0,
  },
  draggedElementPosition: {
    x: 0,
    y: 0,
  },
  dropAreas: new Set(),
  ghost: null,
  selected: null,
})

export default augmentor(function DragNDrop(content: Hole, onElementDragged: DragCallback) {
  const {draggable, draggedElementPosition, dropAreas, ghost} = useContext(DRAG_N_DROP_CONTEXT)
  const onClickListener = useMemo(() => onClick.bind(null, onElementDragged), [onElementDragged])
  const onMouseUpListener = useMemo(() => onMouseUp.bind(null, onElementDragged), [onElementDragged])
  const onTouchEndListener = useMemo(() => onTouchEnd.bind(null, onElementDragged), [onElementDragged])

  useEffect(() => {
    for (const draggableElement of draggable) {
      draggableElement.addEventListener('mousedown', onMouseDown)
      draggableElement.addEventListener('touchstart', onTouchStart)
      draggableElement.addEventListener('click', onClickListener)
    }
    for (const dropArea of dropAreas) {
      dropArea.addEventListener('click', onClickListener)
    }

    addEventListener('mousemove', onMouseMove)
    addEventListener('touchmove', onTouchMove)
    addEventListener('mouseup', onMouseUpListener)
    addEventListener('touchend', onTouchEndListener)

    return () => {
      removeEventListener('mousemove', onMouseMove)
      removeEventListener('touchmove', onTouchMove)
      removeEventListener('mouseup', onMouseUpListener)
      removeEventListener('touchend', onTouchEndListener)
    }
  })
  const containerRef = useRef<HTMLElement>()
  const containerPosition = containerRef.current?.getBoundingClientRect()
  const ghostPosition = ghost && containerPosition && {
    x: draggedElementPosition.x - containerPosition.x,
    y: draggedElementPosition.y - containerPosition.y,
  }

  return html`
    <drag-n-drop class=${style.container} ref=${containerRef}>
      ${content}
      ${ghostPosition ?
        html`
          <div class=${style.ghost} style="transform: translate(${ghostPosition.x}px ${ghostPosition.y}px)">
            ${ghost}
          </div>
        `
      :
        null
      }
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
    draggedElementPosition: {
      x: bounds.x,
      y: bounds.y,
    },
    ghost: draggedElement.cloneNode(true) as Element,
  })
}

function onTouchMove(event: Event): void {
  if (!(event instanceof TouchEvent)) {
    return
  }

  const currentTouch = [...event.changedTouches].find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (!currentTouch) {
    return
  }

  onDrag({
    x: currentTouch.pageX,
    y: currentTouch.pageY,
  })
}

function onMouseMove(event: Event): void {
  if (!(event instanceof MouseEvent) || !DRAG_N_DROP_CONTEXT.value.dragged) {
    return
  }

  onDrag({
    x: event.pageX,
    y: event.pageY,
  })
}

function onDrag(pointerOnPagePosition: {x: number, y: number}): void {
  const currentDropArea = [...DRAG_N_DROP_CONTEXT.value.dropAreas].find((candidateArea) => {
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
    ghost: null,
  })
}

function onClick(dragCallback: DragCallback, {target}: Event): void {
  if (!(target instanceof Element)) {
    return
  }

  if (DRAG_N_DROP_CONTEXT.value.selected && DRAG_N_DROP_CONTEXT.value.dropAreas.has(target)) {
    dragCallback(DRAG_N_DROP_CONTEXT.value.selected, target)
    DRAG_N_DROP_CONTEXT.provide({
      ...DRAG_N_DROP_CONTEXT.value,
      selected: null,
    })
    return
  }

  if (DRAG_N_DROP_CONTEXT.value.draggable.has(target)) {
    DRAG_N_DROP_CONTEXT.provide({
      ...DRAG_N_DROP_CONTEXT.value,
      selected: target === DRAG_N_DROP_CONTEXT.value.selected ? null : target,
    })
  }
}
