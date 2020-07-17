import {createElement} from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {IBotOptions, makeMove} from '../../game/Bot'
import {ICard, Side} from '../../game/Card'
import {createNewGame, executeMove, IGame, INewGameRules, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator'
import {deserialize} from '../../game/Serializer'
import {lastItem, lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import {DESK_SKINS, IDeskSkin} from './deskSkins'
import SettingsStorage from './storage/SettingsStorage'
import WinnableGamesProvider from './WinnableGamesProvider'

interface IUIState {
  game: IGame
  hint: null | ICard
  deskSkin: IDeskSkin
  cardBackFaceStyle: CardBackfaceStyle
}

export default class AppController {
  private readonly uiState: Readonly<IUIState>

  constructor(
    private readonly uiRoot: HTMLElement,
    private readonly newGameProvider: WinnableGamesProvider,
    deskSkin: IDeskSkin,
    cardBackFaceStyle: CardBackfaceStyle,
    private readonly settingsStorage: SettingsStorage,
    private readonly newGameOptions: INewGameRules,
    private readonly botOption: IBotOptions,
  ) {
    this.uiState = {
      cardBackFaceStyle,
      deskSkin,
      game: this.createNewGame(1),
      hint: null,
    }
  }

  public start(): void {
    this.renderUI()
  }

  public stop(): void {
    unmountComponentAtNode(this.uiRoot)
  }

  private updateUI(statePatch: Partial<IUIState>): void {
    Object.assign(this.uiState, statePatch)
    this.renderUI()
  }

  private renderUI(): void {
    // tslint:disable:object-literal-sort-keys
    render(
      createElement(
        App,
        {
          game: this.uiState.game,
          hint: this.uiState.hint,
          deskSkin: this.uiState.deskSkin,
          cardBackFace: this.uiState.cardBackFaceStyle,
          onMove: this.onMove,
          onUndo: this.onUndo,
          onRedo: this.onRedo,
          onReset: this.onReset,
          onNewWinnableGame: this.onNewWinnableGame,
          onShowHint: this.onShowHint,
          onDeskStyleChange: this.onDeskStyleChange,
          onCardStyleChange: this.onCardBackStyleChange,
          onBotMove: this.onBotMove,
          onImport: this.onImport,
        },
      ),
      this.uiRoot,
    )
    // tslint:enable:object-literal-sort-keys
  }

  private onMove = (move: Move): void => {
    const statePatch: Partial<IUIState> = {}
    try {
      statePatch.game = executeMove(this.uiState.game, move)
      const unrevealedCardPileIndex = statePatch.game.state.tableau.piles.findIndex(
        (pile) => lastItemOrNull(pile.cards)?.side === Side.BACK,
      )
      if (unrevealedCardPileIndex > -1) {
        statePatch.game = executeMove(statePatch.game, {
          move: MoveType.REVEAL_TABLEAU_CARD,
          pileIndex: unrevealedCardPileIndex,
        })
      }
    } catch (moveError) {
      // tslint:disable-next-line:no-console
      console.error(moveError)
      return
    }

    statePatch.hint = null
    this.updateUI(statePatch)
  }

  private onUndo = (): void => {
    const statePatch: Partial<IUIState> = {}
    if (
      this.uiState.game.history.length &&
      lastItem(this.uiState.game.history)[1].move === MoveType.REVEAL_TABLEAU_CARD
    ) {
      statePatch.game = undoLastMove(this.uiState.game)
    }
    statePatch.game = undoLastMove(statePatch.game || this.uiState.game)
    statePatch.hint = null
    this.updateUI(statePatch)
  }

  private onRedo = (): void => {
    const statePatch: Partial<IUIState> = {}
    statePatch.game = redoNextMove(this.uiState.game)
    if (statePatch.game.future.length && statePatch.game.future[0][1].move === MoveType.REVEAL_TABLEAU_CARD) {
      statePatch.game = redoNextMove(statePatch.game)
    }
    statePatch.hint = null
    this.updateUI(statePatch)
  }

  private onReset = (): void => {
    this.updateUI({
      game: resetGame(this.uiState.game),
      hint: null,
    })
  }

  private onNewWinnableGame = (drawnCards: 1 | 3): void => {
    const statePatch: Partial<IUIState> = {}
    statePatch.game = this.createNewGame(drawnCards)
    statePatch.hint = null
    this.updateUI(statePatch)
  }

  private onShowHint = (): void => {
    if (this.uiState.hint) {
      this.updateUI({
        hint: null,
      })
      return
    }

    const {state: gameState, rules} = this.uiState.game
    const basicHints = getMoveHints(gameState, rules, HintGeneratorMode.CURRENT_STATE)
    if (basicHints.length) {
      this.updateUI({
        hint: basicHints[0][1],
      })
    } else {
      const generalHints = getMoveHints(gameState, rules, HintGeneratorMode.WITH_FULL_STOCK)
      this.updateUI({
        hint: generalHints.length ? generalHints[0][1] : null,
      })
    }
  }

  private onDeskStyleChange = (newDeskStyle: string): void => {
    if (newDeskStyle in DESK_SKINS) {
      const deskSkin = DESK_SKINS[newDeskStyle as keyof typeof DESK_SKINS]
      this.settingsStorage.setDeskSkin(deskSkin).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('Failed to save desk skin', error)
      })
      this.updateUI({
        deskSkin,
      })
    }
  }

  private onCardBackStyleChange = (newCardBackStyle: CardBackfaceStyle): void => {
    this.settingsStorage.setCardBackFaceStyle(newCardBackStyle).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to save card back face style', error)
    })
    this.updateUI({
      cardBackFaceStyle: newCardBackStyle,
    })
  }

  private onBotMove = (): void => {
    this.updateUI({
      game: makeMove(this.uiState.game, this.botOption),
    })
  }

  private onImport = (): void => {
    const state = prompt('Exportovaný stav hry:') || ''
    this.updateUI({
      game: deserialize(state),
    })
  }

  private createNewGame(drawnCards: 1 | 3): IGame {
    const deck = this.newGameProvider.getWinnableCardDeck(drawnCards)
    return createNewGame(
      {
        ...this.newGameOptions,
        drawnCards,
      },
      deck,
    )
  }
}
