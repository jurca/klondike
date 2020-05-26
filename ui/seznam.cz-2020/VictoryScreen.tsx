import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ICard } from '../../game/Card'
import {lastItem} from '../../game/util'
import Card from './Card'
import style from './victoryScreen.css'

interface IProps {
  gravity: number
  drag: number
  bounciness: number
  squashiness: number
  minHorizontalInitialForce: number
  maxHorizontalInitialForce: number
  animationSpeed: number
  timeDeltaCap: number
  actors: ReadonlyMap<React.RefObject<Element>, ICard>
  nextActorStartDelay: number
}

export default function VictoryScreen(props: IProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const actorsLoading = React.useMemo(() => new Map(Array.from(props.actors).map(([actorStartRef, card]) => {
    const actorStart = actorStartRef.current
    if (!actorStart) {
      return [null, null]
    }
    const actorBounds = actorStart.getBoundingClientRect()
    const actorSvgContainer = document.createElement('div')
    return [actorStart, new Promise((resolve, reject) => requestAnimationFrame(() => {
      try {
        ReactDOM.render(<Card card={card} isHinted={false}/>, actorSvgContainer)
        const actorSvg = actorSvgContainer.querySelectorAll('svg')[1]
        if (!actorSvg) {
          reject(new Error(
            'The VictoryScreen component is broken - expected to find an svg element in a rendered Card component',
          ))
          return
        }
        actorSvg.setAttribute('width', `${actorBounds.width}`)
        actorSvg.setAttribute('height', `${actorBounds.height}`)
        const actorImage = new Image()
        actorImage.onerror = () => reject(new Error('Failed to load some actor images'))
        actorImage.onload = () => {
          // The image must be pre-rendered to a bitmap to allow scaling without having the aspect ratio locked.
          const actorCanvas = document.createElement('canvas')
          actorCanvas.width = actorImage.naturalWidth
          actorCanvas.height = actorImage.naturalHeight
          const context = actorCanvas.getContext('2d')
          if (!context) {
            reject(new Error('Cannot pre-render the actor image to a bitmap'))
            return
          }
          context.drawImage(actorImage, 0, 0)
          resolve(actorCanvas)
        }
        const serializedActorSvg = new XMLSerializer().serializeToString(actorSvg)
        actorImage.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(serializedActorSvg)}`
      } catch (error) {
        reject(error)
      }
    }))]
  }).filter<[Element, Promise<HTMLCanvasElement>]>(
    (pair): pair is [Element, Promise<HTMLCanvasElement>] => !!(pair[0] && pair[1]),
  )), Array.from(props.actors.keys()).map((actorStartRef) => actorStartRef.current))

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const maybeDrawingContext = canvas.getContext('2d')
    if (!maybeDrawingContext) {
      return
    }

    const drawingContext = maybeDrawingContext
    let canceled = false
    let currentAnimationFrameRequestId: null | number = null
    Promise.all(Array.from(actorsLoading).map(
      ([actorStart, imagePromise]) => imagePromise.then((image) => [actorStart, image] as [Element, HTMLCanvasElement]),
    )).then((actorsData) => {
      if (canceled) {
        return
      }

      const canvasPosition = canvas.getBoundingClientRect()
      const actors = actorsData.map(([startPositionElement, image]) => {
        const startPosition = startPositionElement.getBoundingClientRect()
        const distanceUnit = startPosition.width / 10 // card width is 10vmin, see (desk.css and card.css)
        return {
          distanceUnit,
          height: startPosition.height,
          image,
          killed: false,
          left: startPosition.left - canvasPosition.left,
          revivedAt: 0,
          top: startPosition.top - canvasPosition.top,
          velocityX: distanceUnit * (
            Math.random() * (props.maxHorizontalInitialForce - props.minHorizontalInitialForce) +
            props.minHorizontalInitialForce
          ),
          velocityY: 0,
          width: startPosition.width,
        }
      })
      let lastFrameTimestamp = performance.now()
      currentAnimationFrameRequestId = requestAnimationFrame(runAnimation)

      // const previousStateImage = document.createElement('canvas')
      // previousStateImage.width = drawingContext.canvas.width
      // previousStateImage.height = drawingContext.canvas.height
      // const maybePreviousStateImageContext = previousStateImage.getContext('2d')
      // if (!maybePreviousStateImageContext) {
      //   throw new Error('Failed to create a helper buffer rendering context')
      // }
      // const previousStateImageContext = maybePreviousStateImageContext

      function runAnimation() {
        const now = performance.now()
        const delta = Math.min(now - lastFrameTimestamp, props.timeDeltaCap)
        lastFrameTimestamp = now

        // previousStateImageContext.clearRect(0, 0, previousStateImage.width, previousStateImage.height)
        // previousStateImageContext.drawImage(drawingContext.canvas, 0, 0)
        // drawingContext.clearRect(0, 0, drawingContext.canvas.width, drawingContext.canvas.height)
        // drawingContext.globalAlpha = 0.75
        // drawingContext.drawImage(previousStateImage, 0, 0)
        // drawingContext.globalAlpha = 1

        const actorToRevive = actors.find((actor) => !actor.revivedAt)
        const livingActors = actors.filter((actor) => !!actor.revivedAt && !actor.killed)
        if (
          actorToRevive &&
          (!livingActors.length || now - lastItem(livingActors).revivedAt >= props.nextActorStartDelay)
        ) {
          actorToRevive.revivedAt = now
          livingActors.push(actorToRevive)
          drawingContext.drawImage(actorToRevive.image, actorToRevive.left, actorToRevive.top)
        }

        const animationStep = delta * props.animationSpeed / 1000
        for (const actor of livingActors) {
          actor.velocityX *= (1 - props.drag * animationStep)
          actor.velocityY += props.gravity * actor.distanceUnit * animationStep
          actor.left += actor.velocityX * animationStep
          actor.top += actor.velocityY

          const floorCollision = Math.max(actor.top + actor.height - drawingContext.canvas.height, 0)
          if (floorCollision) {
            const squash = props.squashiness * (actor.velocityY / actor.height)
            actor.top -= floorCollision
            actor.velocityY *= -props.bounciness
            const squashDeltaWidth = actor.width * squash
            const squashDeltaHeight = actor.height * squash
            drawingContext.drawImage(
              actor.image,
              actor.left - squashDeltaWidth / 2,
              actor.top + squashDeltaHeight,
              actor.width + squashDeltaWidth,
              actor.height - squashDeltaHeight,
            )
          } else {
            drawingContext.drawImage(actor.image, actor.left, actor.top)
          }

          if (actor.left > drawingContext.canvas.width || actor.left + actor.width < 0) {
            actor.killed = true
          }
        }

        if (livingActors.length) {
          currentAnimationFrameRequestId = requestAnimationFrame(runAnimation)
        }
      }
    })

    return () => {
      canceled = true
      if (currentAnimationFrameRequestId) {
        cancelAnimationFrame(currentAnimationFrameRequestId)
      }
    }
  }, [actorsLoading])

  return (
    <div className={style.victoryScreen}>
      <canvas className={style.canvas} ref={canvasRef}/>
    </div>
  )
}
