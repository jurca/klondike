import {defaultStateRankingHeuristic, IBotOptions} from '../../game/Bot'
import {isVictoryGuaranteed} from '../../game/Desk'
import {IBotSimulationOptions, INewGameRules} from '../../game/Game'
import {MoveConfidence} from '../../game/MoveHintGenerator'

export const DEFAULT_NEW_GAME_OPTIONS: INewGameRules = {
  allowNonKingToEmptyPileTransfer: false,
  drawnCards: 1,
  tableauPiles: 7,
}

export const BOT_OPTIONS: IBotOptions = {
  lookAheadMoves: 2,
  maxConsideredConfidenceLevels: 3,
  minAutoAcceptConfidence: MoveConfidence.HIGH,
  stateRankingHeuristic: defaultStateRankingHeuristic,
}

export const GAME_SIMULATION_OPTIONS: IBotSimulationOptions = {
  maxMoves: 300,
  maxSimulationTime: 20_000, // milliseconds
  simulationEndPredicate: isVictoryGuaranteed,
}
