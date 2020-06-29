import * as React from 'react'
import getRectanglesOverlap from 'rectangle-overlap'
import style from './dragNDrop.css'

interface IDragNDropContextValue {
  dragged: null | Element
  draggedEntities: readonly object[]
  selected: null | Element
  draggedElementOffset: {x: number, y: number}
  draggedElementOriginalPosition: {x: number, y: number}
  draggedElementPosition: {x: number, y: number}
  dropAreasIds: WeakMap<Element, unknown>
  draggableEntities: WeakMap<Element, object>
  relatedEntities: WeakMap<object, readonly unknown[]>
}

type DragCallback = (draggedElement: Element, dropArea: Element) => void

const DROP_AREA_SURROUNDING_TOLERANCE = Math.min(window.innerWidth, window.innerHeight) / 10 // px
const DRAG_N_DROP_CONTEXT_DEFAULT_VALUE: IDragNDropContextValue = {
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
  draggedEntities: [],
  dropAreasIds: new WeakMap(),
  relatedEntities: new WeakMap(),
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

  const rootRef = React.createRef<HTMLDivElement>()

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

  const onMouseDownListener = React.useMemo(
    () => onMouseDown.bind(null, updateContextValue, contextValue),
    [updateContextValue, contextValue],
  )
  const onTouchStartListener = React.useMemo(
    () => onTouchStart.bind(null, updateContextValue, contextValue),
    [updateContextValue, contextValue],
  )
  const onMouseMoveListener = React.useMemo(
    () => onMouseMove.bind(null, updateContextValue, contextValue),
    [updateContextValue, contextValue],
  )
  const onTouchMoveListener = React.useMemo(
    () => onTouchMove.bind(null, updateContextValue, contextValue),
    [updateContextValue, contextValue],
  )

  const containerGetter = React.useMemo(() => () => rootRef.current, [rootRef])
  const onClickListener = React.useMemo(
    () => onClick.bind(null, updateContextValue, contextValue, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
  )
  const onMouseUpListener = React.useMemo(
    () => onMouseUp.bind(null, updateContextValue, contextValue, containerGetter, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
  )
  const onTouchEndListener = React.useMemo(
    () => onTouchEnd.bind(null, updateContextValue, contextValue, containerGetter, onElementDragged),
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
      ref={rootRef}
    >
      <DRAG_N_DROP_CONTEXT.Provider value={contextValue}>
        {children}
      </DRAG_N_DROP_CONTEXT.Provider>
    </div>
  )
}

let currentlyTrackedTouchId: null | number = null

function onTouchStart(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  event: React.TouchEvent,
): void {
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
    onDragStart(updateContextValue, currentContextValue, dragContainer, {
      x: currentTouch.pageX,
      y: currentTouch.pageY,
    })
  }

  event.preventDefault()
}

function onMouseDown(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  event: React.MouseEvent<HTMLDivElement>,
): void {
  if (!(event.target instanceof Element)) {
    return
  }

  const dragContainer = event.target.closest('ui-draggable')
  if (dragContainer) {
    onDragStart(updateContextValue, currentContextValue, dragContainer, {
      x: event.pageX,
      y: event.pageY,
    })
  }
}

function onDragStart(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  draggedElement: Element,
  pointerOnPagePosition: {x: number, y: number},
): void {
  const bounds = draggedElement.getBoundingClientRect()
  const draggedEntity = currentContextValue.draggableEntities.get(draggedElement)
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
    draggedEntities: (draggedEntity ? [draggedEntity] : []).concat(
      (draggedEntity && currentContextValue.relatedEntities.get(draggedEntity)) || [],
    ),
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

  onDrag(updateContextValue, currentContextValue, {
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

  onDrag(updateContextValue, currentContextValue, {
    x: event.pageX,
    y: event.pageY,
  })
}

function onDrag(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  pointerOnPagePosition: {x: number, y: number},
): void {
  updateContextValue({
    draggedElementPosition: {
      x: pointerOnPagePosition.x + currentContextValue.draggedElementOffset.x,
      y: pointerOnPagePosition.y + currentContextValue.draggedElementOffset.y,
    },
  })
}

function onTouchEnd(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  rootGetter: () => null | HTMLElement,
  dragCallback: DragCallback,
  event: TouchEvent,
): void {
  const currentTouch = Array.from(event.changedTouches).find((touch) => touch.identifier === currentlyTrackedTouchId)
  const root = rootGetter()
  if (currentTouch && root) {
    currentlyTrackedTouchId = null
    onDragEnd(updateContextValue, currentContextValue, root, dragCallback, {
      x: currentTouch.pageX,
      y: currentTouch.pageY,
    })
  }
}

function onMouseUp(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  rootGetter: () => null | HTMLElement,
  dragCallback: DragCallback,
  event: MouseEvent,
): void {
  const root = rootGetter()
  if (currentContextValue.dragged && root) {
    onDragEnd(updateContextValue, currentContextValue, root, dragCallback, {
      x: event.pageX,
      y: event.pageY,
    })
  }
}

function onDragEnd(
  updateContextValue: ContextValueUpdater,
  currentContextValue: IDragNDropContextValue,
  container: HTMLElement,
  dragCallback: DragCallback,
  pointerOnPagePosition: {x: number, y: number},
) {
  if (!currentContextValue.draggedElementOffset.x && !currentContextValue.draggedElementOffset.y) {
    return // A click or a tap
  }

  const dropAreas = [...container.querySelectorAll('drop-area')]
  const currentDropArea = (
    dropAreas.find((candidateArea) => {
      const bounds = candidateArea.getBoundingClientRect()
      return getRectanglesOverlap(bounds, {...pointerOnPagePosition, width: 1, height: 1})
    }) ||
    dropAreas.reduce<[null | Element, number]>(
      ([closestArea, closestDistance], candidateArea) => {
        const bounds = candidateArea.getBoundingClientRect()
        const extendedBounds = {
          height: bounds.height + DROP_AREA_SURROUNDING_TOLERANCE * 2,
          width: bounds.width + DROP_AREA_SURROUNDING_TOLERANCE * 2,
          x: bounds.x - DROP_AREA_SURROUNDING_TOLERANCE,
          y: bounds.y - DROP_AREA_SURROUNDING_TOLERANCE,
        }
        if (!getRectanglesOverlap(extendedBounds, {...pointerOnPagePosition, width: 1, height: 1})) {
          return [closestArea, closestDistance]
        }
        const areaCenter = {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
        }
        const distance = Math.sqrt(
          Math.pow(pointerOnPagePosition.x - areaCenter.x, 2) + Math.pow(pointerOnPagePosition.y - areaCenter.y, 2),
        )
        return distance < closestDistance ? [candidateArea, distance] : [closestArea, distance]
      },
      [null, Number.POSITIVE_INFINITY],
    )[0]
  )

  if (currentContextValue.dragged && currentDropArea) {
    dragCallback(currentContextValue.dragged, currentDropArea)
  }

  updateContextValue({
    dragged: null,
    draggedEntities: [],
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
      dragged: null,
      draggedEntities: [],
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
