import {Side} from './Card'
import {executeMove, IGame, isVictory, isVictoryGuaranteed} from './Game'
import {Move, MoveType} from './Move'
import {getMoveHints, HintGeneratorMode, MOVE_CONFIDENCES, MoveConfidence, MoveHint} from './MoveHintGenerator'

export interface IBotOptions {
  minAutoAcceptConfidence: null | MoveConfidence
  maxConsideredConfidenceLevels: number
  lookAheadMoves: number
  stateRankingHeuristic: (game: IGame) => number
}

export function makeMove(game: IGame, options: IBotOptions): IGame {
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

  if (isVictory(game)) {
    return game
  }

  const bestMove = findBestMove(game, options, options.lookAheadMoves)
  if (!bestMove) {
    return game
  }

  const [hint] = bestMove
  return executeMoveHint(game, hint, false)
}

export function defaultStateRankingHeuristic({state: {foundation, tableau: {piles: tableauPiles}}}: IGame) {
  // Total number of face-up cards on the desk, excluding stock/waste
  return Object.values(foundation).map((pile) => pile.cards.length).concat(
    tableauPiles.map((pile) => pile.cards.filter((card) => card.side === Side.FACE).length),
  ).reduce(
    (accumulator, value) => accumulator + value,
    0,
  )
}

function findBestMove(game: IGame, options: IBotOptions, lookAheadMoves: number): null | [MoveHint, IGame, number] {
  const hints = getMoveHints(game, HintGeneratorMode.WITH_FULL_STOCK)
  if (!hints.length) {
    return null
  }

  if (
    options.minAutoAcceptConfidence &&
    MOVE_CONFIDENCES.indexOf(hints[0][2]) <= MOVE_CONFIDENCES.indexOf(options.minAutoAcceptConfidence)
  ) {
    const gameAfterMove = executeMoveHint(game, hints[0], true)
    const rank = options.stateRankingHeuristic(gameAfterMove)
    return [hints[0], gameAfterMove, rank]
  }

  let bestHint = hints[0]
  const highestConfidenceIndex = MOVE_CONFIDENCES.indexOf(bestHint[2])
  let bestRank = 0
  for (const hint of hints) {
    if (MOVE_CONFIDENCES.indexOf(hint[2]) > highestConfidenceIndex + options.maxConsideredConfidenceLevels) {
      continue
    }

    const gameAfterMove = executeMoveHint(game, hint, true)
    let currentMoveRank
    if (lookAheadMoves && !isVictoryGuaranteed(gameAfterMove)) {
      const deepAnalysisOutcome = findBestMove(gameAfterMove, options, lookAheadMoves - 1)
      if (!deepAnalysisOutcome) {
        continue
      }

      [, , currentMoveRank] = deepAnalysisOutcome
    } else {
      currentMoveRank = options.stateRankingHeuristic(gameAfterMove)
    }
    if (currentMoveRank > bestRank) {
      bestRank = currentMoveRank
      bestHint = hint
    }
  }

  return [bestHint, game, bestRank]
}

function executeMoveHint(game: IGame, hint: MoveHint, autoDrawCards: boolean): IGame {
  const topWasteCard = game.state.waste.cards[game.state.waste.cards.length - 1]
  if (
    [MoveType.WASTE_TO_FOUNDATION, MoveType.WASTE_TO_TABLEAU].includes(hint[0].move) &&
    (topWasteCard?.rank !== hint[1].rank || topWasteCard?.color !== hint[1].color)
  ) {
    const stockCyclingMove: Move = game.state.stock.cards.length ?
      {
        drawnCards: game.rules.drawnCards,
        move: MoveType.DRAW_CARDS,
      }
    :
      {
        move: MoveType.REDEAL,
      }
    const gameAfterDrawingACard = executeMove(game, stockCyclingMove)
    if (autoDrawCards) {
      return executeMoveHint(gameAfterDrawingACard, hint, autoDrawCards)
    } else {
      return gameAfterDrawingACard
    }
  }

  return executeMove(game, hint[0])
}
