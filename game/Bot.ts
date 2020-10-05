import {Side} from './Card'
import {executeMove as executeMoveOnDesk, IDesk, isVictory, isVictoryGuaranteed} from './Desk'
import {executeMove, IGame, IGameRules} from './Game'
import {Move, MoveType} from './Move'
import {getMoveHints, HintGeneratorMode, MOVE_CONFIDENCES, MoveConfidence, MoveHint} from './MoveHintGenerator'
import {lastItemOrNull} from './util'

export interface IBotOptions {
  readonly minAutoAcceptConfidence: null | MoveConfidence
  readonly maxConsideredConfidenceLevels: number
  readonly lookAheadMoves: number
  readonly stateRankingHeuristic: (desk: IDesk) => number
}

export function makeMove(game: IGame, options: IBotOptions): IGame {
  validateOptions(options)

  const {state: desk, rules} = game
  if (isVictory(desk)) {
    return game
  }

  const bestMove = findBestMove(desk, rules, options, options.lookAheadMoves)
  if (!bestMove) {
    return game
  }

  const [hint] = bestMove
  return executeMoveHint(game, hint)
}

export function makeMoveOnDesk(desk: IDesk, rules: IGameRules, options: IBotOptions): IDesk {
  validateOptions(options)

  if (isVictory(desk)) {
    return desk
  }

  const bestMove = findBestMove(desk, rules, options, options.lookAheadMoves)
  if (!bestMove) {
    return desk
  }

  const [hint] = bestMove
  return executeMoveHintOnDesk(desk, rules, hint, false)
}

export function defaultStateRankingHeuristic({foundation, tableau: {piles: tableauPiles}}: IDesk) {
  // Total number of face-up cards on the desk, excluding stock/waste
  return Object.values(foundation).map((pile) => pile.cards.length).concat(
    tableauPiles.map((pile) => pile.cards.filter((card) => card.side === Side.FACE).length),
  ).reduce(
    (accumulator, value) => accumulator + value,
    0,
  )
}

function validateOptions(options: IBotOptions): void {
  if (!Number.isInteger(options.maxConsideredConfidenceLevels) || options.maxConsideredConfidenceLevels < 0) {
    throw new TypeError(
      'The maxConsideredConfidenceLevels option must be a non-negative integer, ' +
      `${options.maxConsideredConfidenceLevels} was provided`,
    )
  }
  if (!Number.isSafeInteger(options.lookAheadMoves) || options.lookAheadMoves < 0) {
    throw new TypeError(
      `The lookAheadMoves option must be a non-negative integer, ${options.lookAheadMoves} was provided`,
    )
  }
}

function findBestMove(
  desk: IDesk,
  rules: IGameRules,
  options: IBotOptions,
  lookAheadMoves: number,
): null | [MoveHint, number] {
  const hints = getMoveHints(desk, rules, HintGeneratorMode.WITH_FULL_STOCK)
  if (!hints.length) {
    return null
  }

  if (
    options.minAutoAcceptConfidence &&
    MOVE_CONFIDENCES.indexOf(hints[0][2]) <= MOVE_CONFIDENCES.indexOf(options.minAutoAcceptConfidence)
  ) {
    const deskAfterMove = executeMoveHintOnDesk(desk, rules, hints[0], true)
    const rank = options.stateRankingHeuristic(deskAfterMove)
    return [hints[0], rank]
  }

  let bestHint = hints[0]
  const highestConfidenceIndex = MOVE_CONFIDENCES.indexOf(bestHint[2])
  let bestRank = Number.NEGATIVE_INFINITY
  for (const hint of hints) {
    if (MOVE_CONFIDENCES.indexOf(hint[2]) > highestConfidenceIndex + options.maxConsideredConfidenceLevels) {
      continue
    }

    const deskAfterMove = executeMoveHintOnDesk(desk, rules, hint, true)
    let currentMoveRank
    if (lookAheadMoves && !isVictoryGuaranteed(deskAfterMove)) {
      const deepAnalysisOutcome = findBestMove(deskAfterMove, rules, options, lookAheadMoves - 1)
      if (!deepAnalysisOutcome) {
        continue
      }

      [, currentMoveRank] = deepAnalysisOutcome
    } else {
      currentMoveRank = options.stateRankingHeuristic(deskAfterMove)
    }
    if (currentMoveRank > bestRank) {
      bestRank = currentMoveRank
      bestHint = hint
    }
  }

  return [bestHint, bestRank]
}

function executeMoveHint(game: IGame, hint: MoveHint): IGame {
  const moveType = hint[0].move
  const topWasteCard = lastItemOrNull(game.state.waste.cards)
  const needsToDrawCards =
    (moveType === MoveType.WASTE_TO_FOUNDATION || moveType === MoveType.WASTE_TO_TABLEAU) &&
    (topWasteCard?.rank !== hint[1].rank || topWasteCard.color !== hint[1].color)

  const moveToExecute = needsToDrawCards ? createStockCyclingMove(game.state, game.rules) : hint[0]
  return executeMove(game, moveToExecute)
}

function executeMoveHintOnDesk(deskState: IDesk, rules: IGameRules, hint: MoveHint, autoDrawCards: boolean): IDesk {
  const moveType = hint[0].move
  const topWasteCard = lastItemOrNull(deskState.waste.cards)
  const needsToDrawCards =
    (moveType === MoveType.WASTE_TO_FOUNDATION || moveType === MoveType.WASTE_TO_TABLEAU) &&
    (topWasteCard?.rank !== hint[1].rank || topWasteCard.color !== hint[1].color)

  const moveToExecute = needsToDrawCards ? createStockCyclingMove(deskState, rules) : hint[0]
  const deskAfterExecutingMove = executeMoveOnDesk(deskState, rules, moveToExecute)
  return autoDrawCards && needsToDrawCards ?
    executeMoveHintOnDesk(deskAfterExecutingMove, rules, hint, autoDrawCards)
  :
    deskAfterExecutingMove
}

function createStockCyclingMove(desk: IDesk, rules: IGameRules): Move {
  return desk.stock.cards.length ?
    {
      drawnCards: rules.drawnCards,
      move: MoveType.DRAW_CARDS,
    }
  :
    {
      move: MoveType.REDEAL,
    }
}
