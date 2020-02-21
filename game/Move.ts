import {Color} from './Card'

export enum MoveType {
  DRAW_CARDS = 'MoveType.DRAW_CARDS',
  REDEAL = 'MoveType.REDEAL',
  WASTE_TO_FOUNDATION = 'MoveType.WASTE_TO_FOUNDATION',
  WASTE_TO_TABLEAU = 'MoveType.WASTE_TO_TABLEAU',
  TABLEAU_TO_FOUNDATION = 'MoveType.TABLEAU_TO_FOUNDATION',
  REVEAL_TABLEAU_CARD = 'MoveType.REVEAL_TABLEAU_CARD',
  FOUNDATION_TO_TABLEAU = 'MoveType.FOUNDATION_TO_TABLEAU',
  TABLEAU_TO_TABLEAU = 'MoveType.TABLEAU_TO_TABLEAU',
}

interface IMove<M extends MoveType> {
  move: M
}

interface IDrawCardsMove extends IMove<MoveType.DRAW_CARDS> {
  drawnCards: number
}

interface IRedealMove extends IMove<MoveType.REDEAL> {
}

interface IWasteToFoundationMove extends IMove<MoveType.WASTE_TO_FOUNDATION> {
}

interface IWasteToTableauMove extends IMove<MoveType.WASTE_TO_TABLEAU> {
  pileIndex: number
}

interface ITableauToFoundationMove extends IMove<MoveType.TABLEAU_TO_FOUNDATION> {
  pileIndex: number
}

interface IRevealTableauCardMove extends IMove<MoveType.REVEAL_TABLEAU_CARD> {
  pileIndex: number
}

interface IFoundationToTableauMove extends IMove<MoveType.FOUNDATION_TO_TABLEAU> {
  color: Color
  pileIndex: number
}

interface ITableauToTableauMove extends IMove<MoveType.TABLEAU_TO_TABLEAU> {
  sourcePileIndex: number
  topMovedCardIndex: number
  targetPileIndex: number
}

export type Move =
  IDrawCardsMove |
  IRedealMove |
  IWasteToFoundationMove |
  IWasteToTableauMove |
  ITableauToFoundationMove |
  IRevealTableauCardMove |
  IFoundationToTableauMove |
  ITableauToTableauMove
