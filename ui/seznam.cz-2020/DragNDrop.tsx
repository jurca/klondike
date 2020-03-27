import * as React from 'react'
import getRectanglesOverlap from 'rectangle-overlap'
import style from './dragNDrop.css'

interface IDragNDropContextValue {
  dragged: null | Element
  selected: null | Element
  currentDropArea: null | Element
  draggedElementOffset: {x: number, y: number}
  draggedElementOriginalPosition: {x: number, y: number}
  draggedElementPosition: {x: number, y: number}
  dropAreasIds: WeakMap<Element, unknown>
  draggableEntities: WeakMap<Element, unknown>
}

type DragCallback = (draggedElement: Element, dropArea: Element) => void

const DRAG_N_DROP_CONTEXT_DEFAULT_VALUE: IDragNDropContextValue = {
  currentDropArea: null,
  draggableEntities: new WeakMap(),
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
  dropAreasIds: new WeakMap(),
  selected: null,
}
export const DRAG_N_DROP_CONTEXT = React.createContext<IDragNDropContextValue>(DRAG_N_DROP_CONTEXT_DEFAULT_VALUE)

type ContextValueUpdater = (value: Partial<IDragNDropContextValue>) => void

interface IProps {
  children: React.ReactNode
  onEntityDragged: (draggedEntity: unknown, dropAreaId: unknown) => void,
}

export default function DragNDrop({children, onEntityDragged}: IProps) {
  const [contextValue, setContextValue] = React.useState<IDragNDropContextValue>(DRAG_N_DROP_CONTEXT_DEFAULT_VALUE)
  const updateContextValue = React.useMemo(
    () => (partialValue: Partial<IDragNDropContextValue>) => setContextValue({
      ...contextValue,
      ...partialValue,
    }),
    [contextValue, setContextValue],
  )

  const onElementDragged = React.useMemo<DragCallback>(
    () => (draggableElement: Element, dropAreaElement: Element) => {
      if (
        !contextValue.draggableEntities.has(draggableElement) ||
        !contextValue.dropAreasIds.has(dropAreaElement)
      ) {
        return
      }
      const entity = contextValue.draggableEntities.get(draggableElement)
      const dropAreaId = contextValue.dropAreasIds.get(dropAreaElement)
      onEntityDragged(entity, dropAreaId)
    },
    [onEntityDragged],
  )

  const onMouseDownListener = React.useMemo(() => onMouseDown.bind(null, updateContextValue), [updateContextValue])
  const onTouchStartListener = React.useMemo(() => onTouchStart.bind(null, updateContextValue), [updateContextValue])
  const onMouseMoveListener = React.useMemo(
    () => onMouseMove.bind(null, updateContextValue, contextValue),
    [updateContextValue, contextValue],
  )
  const onTouchMoveListener = React.useMemo(
    () => onTouchMove.bind(null, updateContextValue, contextValue),
    [updateContextValue, contextValue],
  )

  const onClickListener = React.useMemo(
    () => onClick.bind(null, updateContextValue, contextValue, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
  )
  const onMouseUpListener = React.useMemo(
    () => onMouseUp.bind(null, updateContextValue, contextValue, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
  )
  const onTouchEndListener = React.useMemo(
    () => onTouchEnd.bind(null, updateContextValue, contextValue, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
    )

  React.useEffect(() => {
    addEventListener('mouseup', onMouseUpListener)
    addEventListener('touchend', onTouchEndListener)

    return () => {
      removeEventListener('mouseup', onMouseUpListener)
      removeEventListener('touchend', onTouchEndListener)
    }
  }, [onMouseUpListener, onTouchEndListener])

  return (
    <div
      className={style.container}
      onMouseDown={onMouseDownListener}
      onMouseMove={onMouseMoveListener}
      onTouchStart={onTouchStartListener}
      onTouchMove={onTouchMoveListener}
      onClick={onClickListener}
    >
      <DRAG_N_DROP_CONTEXT.Provider value={contextValue}>
        {children}
      </DRAG_N_DROP_CONTEXT.Provider>
    </div>
  )
}

let currentlyTrackedTouchId: null | number = null

function onTouchStart(updateContextValue: ContextValueUpdater, event: React.TouchEvent): void {
  if (currentlyTrackedTouchId) {
    return
  }

  const currentTouch = event.changedTouches[0]
  if (!currentTouch || !(currentTouch.target instanceof Element)) {
    return
  }

  currentlyTrackedTouchId = currentTouch.identifier
  const dragContainer = currentTouch.target.closest('ui-draggable')
  if (dragContainer) {
    onDragStart(updateContextValue, dragContainer, {
      x: currentTouch.pageX,
      y: currentTouch.pageY,
    })
  }

  event.preventDefault()
}

function onMouseDown(updateContextValue: ContextValueUpdater, event: React.MouseEvent<HTMLDivElement>): void {
  if (!(event.target instanceof Element)) {
    return
  }

  const dragContainer = event.target.closest('ui-draggable')
  if (dragContainer) {
    onDragStart(updateContextValue, dragContainer, {
      x: event.pageX,
      y: event.pageY,
    })
  }
}

function onDragStart(
  updateContextValue: ContextValueUpdater,
  draggedElement: Element,
  pointerOnPagePosition: {x: number, y: number},
): void {
  const bounds = draggedElement.getBoundingClientRect()
  updateContextValue({
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

function onTouchMove(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  event: React.TouchEvent<HTMLElement>,
): void {
  if (!currentContextValue.dragged) {
    return
  }

  const currentTouch = Array.from(event.changedTouches).find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (!currentTouch) {
    return
  }

  onDrag(updateContextValue, currentContextValue, event.currentTarget, {
    x: currentTouch.pageX,
    y: currentTouch.pageY,
  })
}

function onMouseMove(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  event: React.MouseEvent<HTMLElement>,
): void {
  if (!currentContextValue.dragged) {
    return
  }

  onDrag(updateContextValue, currentContextValue, event.currentTarget, {
    x: event.pageX,
    y: event.pageY,
  })
}

function onDrag(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  container: HTMLElement,
  pointerOnPagePosition: {x: number, y: number},
): void {
  const currentDropArea = [...container.querySelectorAll('drop-area')].find((candidateArea) => {
    const bounds = candidateArea.getBoundingClientRect()
    return getRectanglesOverlap(bounds, {...pointerOnPagePosition, width: 1, height: 1})
  })

  updateContextValue({
    currentDropArea: currentDropArea || null,
    draggedElementPosition: {
      x: pointerOnPagePosition.x + currentContextValue.draggedElementOffset.x,
      y: pointerOnPagePosition.y + currentContextValue.draggedElementOffset.y,
    },
  })
}

function onTouchEnd(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  dragCallback: DragCallback,
  event: TouchEvent,
): void {
  const currentTouch = Array.from(event.changedTouches).find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (currentTouch) {
    currentlyTrackedTouchId = null
    onDragEnd(updateContextValue, currentContextValue, dragCallback)
  }
}

function onMouseUp(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  dragCallback: DragCallback,
): void {
  if (currentContextValue.dragged) {
    onDragEnd(updateContextValue, currentContextValue, dragCallback)
  }
}

function onDragEnd(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  dragCallback: DragCallback,
) {
  if (!currentContextValue.draggedElementOffset.x && !currentContextValue.draggedElementOffset.y) {
    return // A click or a tap
  }

  if (currentContextValue.dragged && currentContextValue.currentDropArea) {
    dragCallback(currentContextValue.dragged, currentContextValue.currentDropArea)
  }

  updateContextValue({
    currentDropArea: null,
    dragged: null,
  })
}

function onClick(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  dragCallback: DragCallback,
  {target}: React.MouseEvent,
): void {
  if (!(target instanceof Element)) {
    return
  }

  const draggable = target.closest('ui-draggable')
  if (draggable) {
    updateContextValue({
      selected: draggable === currentContextValue.selected ? null : draggable,
    })
    return
  }

  const dropArea = target.closest('drop-area')
  if (currentContextValue.selected && dropArea) {
    dragCallback(currentContextValue.selected, dropArea)
    updateContextValue({
      selected: null,
    })
  }
}
