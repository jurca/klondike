import {ICard, Side} from './Card'
import {draw, IPile, placeCardOnTop, placePileOnTop, slicePile, turnCard} from './Pile'
import {lastItem} from './util'

export interface ITableau {
  readonly piles: ReadonlyArray<IPile>
}

export class Tableau implements ITableau {
  constructor(public readonly piles: ReadonlyArray<IPile>) {
  }
}

export function addCardToPile(tableau: ITableau, pile: IPile, card: ICard): ITableau {
  const pileIndex = tableau.piles.indexOf(pile)
  if (pileIndex === -1) {
    throw new Error('The specified pile is not present in the specified tableau')
  }

  const patchedPile = placeCardOnTop(pile, card)
  const patchedPiles = tableau.piles.slice()
  patchedPiles.splice(pileIndex, 1, patchedPile)
  return new Tableau(patchedPiles)
}

export function removeTopCardFromPile(tableau: ITableau, pile: IPile): [ITableau, ICard] {
  const pileIndex = tableau.piles.indexOf(pile)
  if (pileIndex === -1) {
    throw new Error('The specified pile is not present in the specified tableau')
  }
  if (!pile.cards.length) {
    throw new Error('The specified pile contains no cards')
  }

  const [pileRemainder, [topCard]] = draw(pile, 1)
  const patchedPiles = tableau.piles.slice()
  patchedPiles.splice(pileIndex, 1, pileRemainder)
  return [new Tableau(patchedPiles), topCard]
}

export function revealTopCard(tableau: ITableau, pile: IPile): ITableau {
  if (!pile.cards.length) {
    throw new Error('The specified pile is empty')
  }
  if (lastItem(pile.cards).side === Side.FACE) {
    throw new Error('The top card is already face-up')
  }

  const pileIndex = tableau.piles.indexOf(pile)
  if (pileIndex === -1) {
    throw new Error('The specified pile is not present in the specified tableau')
  }

  const patchedPile = turnCard(pile, lastItem(pile.cards))
  const patchedPiles = tableau.piles.slice()
  patchedPiles.splice(pileIndex, 1, patchedPile)
  return new Tableau(patchedPiles)
}

export function movePilePart(tableau: ITableau, sourcePile: IPile, topCardToMove: ICard, targetPile: IPile): ITableau {
  const sourcePileIndex = tableau.piles.indexOf(sourcePile)
  const targetPileIndex = tableau.piles.indexOf(targetPile)
  if (sourcePileIndex === -1) {
    throw new Error('The specified source pile is not present in the specified tableau')
  }
  if (targetPileIndex === -1) {
    throw new Error('The specified target pile is not present in the specified tableau')
  }

  const [sourcePileRemainder, movedPart] = slicePile(sourcePile, topCardToMove)
  const patchedPiles = tableau.piles.slice()
  patchedPiles.splice(sourcePileIndex, 1, sourcePileRemainder)
  patchedPiles.splice(targetPileIndex, 1, placePileOnTop(targetPile, movedPart))
  return new Tableau(patchedPiles)
}
