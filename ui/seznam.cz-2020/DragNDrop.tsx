import * as React from 'react'
import getRectanglesOverlap from 'rectangle-overlap'
import style from './dragNDrop.css'

interface IDragNDropContextValue {
  dropAreasIds: Map<Element, unknown>
  draggableEntities: Map<HTMLElement, object>
  relatedEntities: WeakMap<object, readonly unknown[]>
}

interface IDragNDropState {
  dragged: null | HTMLElement
  draggedEntities: readonly object[]
  selected: null | HTMLElement
  draggedElementOffset: {x: number, y: number}
  draggedElementOriginalPosition: {x: number, y: number}
  draggedElementPosition: {x: number, y: number}
}

type DragCallback = (draggedElement: HTMLElement, dropArea: Element) => void

const DROP_AREA_SURROUNDING_TOLERANCE = Math.min(window.innerWidth, window.innerHeight) / 10 // px
const DRAG_N_DROP_CONTEXT_DEFAULT_VALUE: IDragNDropContextValue = {
  draggableEntities: new Map(),
  dropAreasIds: new Map(),
  relatedEntities: new WeakMap(),
}
const DRAG_N_DROP_DEFAULT_STATE: IDragNDropState = {
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
  selected: null,
}
export const DRAG_N_DROP_CONTEXT = React.createContext<IDragNDropContextValue>(DRAG_N_DROP_CONTEXT_DEFAULT_VALUE)

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

  const dragNDropState = React.useMemo(() => ({
    ...DRAG_N_DROP_DEFAULT_STATE,
  }), [])
  const setDragNDropState = React.useMemo(() => (statePatch: Partial<IDragNDropState>): void => {
    const entityToElement = new Map(
      Array.from(contextValue.draggableEntities.entries()).map(([key, value]) => [value, key]),
    )

    let isNewDragNDrop = false
    if ('dragged' in statePatch && statePatch.dragged !== dragNDropState.dragged) {
      if (dragNDropState.dragged) {
        for (const dragged of dragNDropState.draggedEntities.map((entity) => entityToElement.get(entity))) {
          if (dragged) {
            dragged.removeAttribute('is-dragged')
            dragged.style.transform = ''
          }
        }
      }
      isNewDragNDrop = !!statePatch.dragged
    }

    if ('selected' in statePatch && statePatch.selected !== dragNDropState.selected) {
      if (dragNDropState.selected) {
        dragNDropState.selected.removeAttribute('is-selected')
      }
      if (statePatch.selected) {
        statePatch.selected.setAttribute('is-selected', '')
      }
    }

    Object.assign(dragNDropState, statePatch)

    if (dragNDropState.draggedEntities.length && statePatch.draggedElementPosition) {
      const {draggedElementOriginalPosition, draggedElementPosition} = dragNDropState
      const deltaX = draggedElementPosition.x - draggedElementOriginalPosition.x
      const deltaY = draggedElementPosition.y - draggedElementOriginalPosition.y
      for (const dragged of dragNDropState.draggedEntities.map((entity) => entityToElement.get(entity))) {
        if (dragged) {
          if (isNewDragNDrop) {
            dragged.setAttribute('is-dragged', '')
          }
          dragged.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        }
      }
    }
  }, [])

  const onElementDragged = React.useMemo<DragCallback>(
    () => (draggableElement: HTMLElement, dropAreaElement: Element) => {
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
    () => onMouseDown.bind(null, contextValue, dragNDropState, setDragNDropState),
    [contextValue, dragNDropState, setDragNDropState],
  )
  const onTouchStartListener = React.useMemo(
    () => onTouchStart.bind(null, contextValue, setDragNDropState),
    [contextValue, setDragNDropState],
  )
  const onMouseMoveListener = React.useMemo(
    () => onMouseMove.bind(null, dragNDropState, setDragNDropState),
    [dragNDropState, setDragNDropState],
  )
  const onTouchMoveListener = React.useMemo(
    () => onTouchMove.bind(null, dragNDropState, setDragNDropState),
    [dragNDropState, setDragNDropState],
  )

  const onClickListener = React.useMemo(
    () => onClick.bind(null, dragNDropState, setDragNDropState, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
  )
  const onMouseUpListener = React.useMemo(
    () => onMouseUp.bind(null, contextValue, dragNDropState, setDragNDropState, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
  )
  const onTouchEndListener = React.useMemo(
    () => onTouchEnd.bind(null, contextValue, dragNDropState, setDragNDropState, onElementDragged),
    [updateContextValue, contextValue, onElementDragged],
    )

  React.useEffect(() => {
    addEventListener('touchmove', onTouchMoveListener)
    addEventListener('mouseup', onMouseUpListener)
    addEventListener('touchend', onTouchEndListener)

    return () => {
      removeEventListener('mouseup', onMouseUpListener)
      removeEventListener('touchend', onTouchEndListener)
      addEventListener('touchmove', onTouchMoveListener)
    }
  }, [onMouseUpListener, onTouchEndListener])

  return (
    <div
      className={style.container}
      onMouseDown={onMouseDownListener}
      onMouseMove={onMouseMoveListener}
      onTouchStart={onTouchStartListener}
      onClick={onClickListener}
    >
      <DRAG_N_DROP_CONTEXT.Provider value={contextValue}>
        {children}
      </DRAG_N_DROP_CONTEXT.Provider>
    </div>
  )
}

let currentlyTrackedTouchId: null | number = null

function onTouchStart(
  currentContextValue: IDragNDropContextValue,
  setState: (statePatch: Partial<IDragNDropState>) => void,
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
  const dragContainer = currentTouch.target.closest('ui-draggable') as null | HTMLElement
  if (dragContainer) {
    onDragStart(currentContextValue, setState, dragContainer, {
      x: currentTouch.pageX,
      y: currentTouch.pageY,
    })
  }
}

function onMouseDown(
  currentContextValue: IDragNDropContextValue,
  dragNDropState: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  event: React.MouseEvent<HTMLDivElement>,
): void {
  if (!(event.target instanceof Element) || event.button !== 0) {
    return
  }

  const dragContainer = event.target.closest('ui-draggable') as null | HTMLElement
  if (dragContainer) {
    onDragStart(currentContextValue, setState, dragContainer, {
      x: event.pageX,
      y: event.pageY,
    })
  } else if (dragNDropState.selected && !event.target.closest('drop-area')) {
    setState({
      selected: null,
    })
  }
}

function onDragStart(
  currentContextValue: IDragNDropContextValue,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  draggedElement: HTMLElement,
  pointerOnPagePosition: {x: number, y: number},
): void {
  const bounds = draggedElement.getBoundingClientRect()
  const draggedEntity = currentContextValue.draggableEntities.get(draggedElement)
  setState({
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
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  event: TouchEvent,
): void {
  if (!state.dragged) {
    return
  }

  const currentTouch = Array.from(event.changedTouches).find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (!currentTouch) {
    return
  }

  onDrag(state, setState, {
    x: currentTouch.pageX,
    y: currentTouch.pageY,
  })
}

function onMouseMove(
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  event: React.MouseEvent<HTMLElement>,
): void {
  if (!state.dragged) {
    return
  }

  onDrag(state, setState, {
    x: event.pageX,
    y: event.pageY,
  })
}

function onDrag(
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  pointerOnPagePosition: {x: number, y: number},
): void {
  setState({
    draggedElementPosition: {
      x: pointerOnPagePosition.x + state.draggedElementOffset.x,
      y: pointerOnPagePosition.y + state.draggedElementOffset.y,
    },
  })
}

function onTouchEnd(
  currentContextValue: IDragNDropContextValue,
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  dragCallback: DragCallback,
  event: TouchEvent,
): void {
  const currentTouch = Array.from(event.changedTouches).find((touch) => touch.identifier === currentlyTrackedTouchId)
  if (!currentTouch) {
    return
  }

  currentlyTrackedTouchId = null
  if (state.dragged) {
    onDragEnd(currentContextValue, state, setState, dragCallback, {
      x: currentTouch.pageX,
      y: currentTouch.pageY,
    })
  }
}

function onMouseUp(
  currentContextValue: IDragNDropContextValue,
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  dragCallback: DragCallback,
  event: MouseEvent,
): void {
  if (state.dragged) {
    onDragEnd(currentContextValue, state, setState, dragCallback, {
      x: event.pageX,
      y: event.pageY,
    })
  }
}

function onDragEnd(
  currentContextValue: IDragNDropContextValue,
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  dragCallback: DragCallback,
  pointerOnPagePosition: {x: number, y: number},
) {
  const {draggedElementPosition, draggedElementOriginalPosition} = state
  const deltaX = draggedElementPosition.x - draggedElementOriginalPosition.x
  const deltaY = draggedElementPosition.y - draggedElementOriginalPosition.y
  if (!deltaX && !deltaY) {
    return // A click or a tap
  }

  const dropAreas = Array.from(currentContextValue.dropAreasIds.keys())
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

  if (state.dragged && currentDropArea) {
    dragCallback(state.dragged, currentDropArea)
  }

  setState({
    dragged: null,
    draggedEntities: [],
  })
}

function onClick(
  state: IDragNDropState,
  setState: (statePatch: Partial<IDragNDropState>) => void,
  dragCallback: DragCallback,
  {target}: React.MouseEvent,
): void {
  if (!(target instanceof Element)) {
    return
  }

  // Safari does not fire the touchend event if the pointer did not move since touchstart event
  currentlyTrackedTouchId = null

  const dropArea = target.closest('drop-area')
  if (state.selected && dropArea) {
    dragCallback(state.selected, dropArea)
    setState({
      dragged: null,
      draggedEntities: [],
      selected: null,
    })
    return
  }

  const draggable = target.closest('ui-draggable') as null | HTMLElement
  if (draggable) {
    setState({
      dragged: null,
      draggedEntities: [],
      selected: draggable === state.selected ? null : draggable,
    })
  }
}
