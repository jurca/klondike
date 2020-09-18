import {createElement} from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {IBotOptions, makeMove} from '../../game/Bot'
import {ICard, Side} from '../../game/Card'
import {isVictory} from '../../game/Desk'
import {createNewGame, executeMove, IGame, INewGameRules, redoNextMove, resetGame, undoLastMove} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator'
import {deserialize} from '../../game/Serializer'
import {lastItem, lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import {DESK_SKINS, IDeskSkin} from './deskSkins'
import HighScoresStorage from './storage/HighScoresStorage'
import SettingsStorage, {StockPosition} from './storage/SettingsStorage'
import WinnableGamesProvider from './WinnableGamesProvider'

interface IUIState {
  game: IGame
  hint: null | ICard
  deskSkin: IDeskSkin
  cardBackFaceStyle: CardBackfaceStyle
  automaticHintDelay: number,
  stockPosition: StockPosition,
}

const DEFAULT_DRAWN_CARDS = 1

export default class AppController {
  private readonly uiState: Readonly<IUIState>
  private gameAddedToHighScores: boolean = false
  private automaticHintTimeoutId: null | number = null

  constructor(
    private readonly uiRoot: HTMLElement,
    private readonly newGameProvider: WinnableGamesProvider,
    deskSkin: IDeskSkin,
    cardBackFaceStyle: CardBackfaceStyle,
    automaticHintDelay: number,
    stockPosition: StockPosition,
    private readonly settingsStorage: SettingsStorage,
    private readonly highScoresStorage: HighScoresStorage,
    private readonly newGameOptions: INewGameRules,
    private readonly botOption: IBotOptions,
  ) {
    this.uiState = {
      automaticHintDelay,
      cardBackFaceStyle,
      deskSkin,
      game: this.createNewGame(DEFAULT_DRAWN_CARDS),
      hint: null,
      stockPosition,
    }
  }

  public start(): void {
    this.renderUI()
    this.updateAutomaticHintTimer()
  }

  public stop(): void {
    unmountComponentAtNode(this.uiRoot)
    if (this.automaticHintTimeoutId) {
      clearTimeout(this.automaticHintTimeoutId)
      this.automaticHintTimeoutId = null
    }
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
          defaultTableauPiles: this.newGameOptions.tableauPiles,
          game: this.uiState.game,
          hint: this.uiState.hint,
          deskSkin: this.uiState.deskSkin,
          cardBackFace: this.uiState.cardBackFaceStyle,
          automaticHintDelay: this.uiState.automaticHintDelay,
          stockPosition: this.uiState.stockPosition,
          onMove: this.onMove,
          onUndo: this.onUndo,
          onRedo: this.onRedo,
          onReset: this.onReset,
          onNewWinnableGame: this.onNewWinnableGame,
          onShowHint: this.onShowHint,
          onDeskStyleChange: this.onDeskStyleChange,
          onCardStyleChange: this.onCardBackStyleChange,
          onAutomaticHintDelayChange: this.onAutomaticHintDelayChange,
          onStockPositionChange: this.onStockPositionChange,
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

    if (isVictory(statePatch.game.state) && !this.gameAddedToHighScores) {
      this.gameAddedToHighScores = true
      this.highScoresStorage.addGame(statePatch.game).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('Failed to add the won game to the high scores table', error)
      })
    }

    this.updateUI(statePatch)
    this.updateAutomaticHintTimer()
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
    this.updateAutomaticHintTimer()
  }

  private onRedo = (): void => {
    const statePatch: Partial<IUIState> = {}
    statePatch.game = redoNextMove(this.uiState.game)
    if (statePatch.game.future.length && statePatch.game.future[0][1].move === MoveType.REVEAL_TABLEAU_CARD) {
      statePatch.game = redoNextMove(statePatch.game)
    }
    statePatch.hint = null
    this.updateUI(statePatch)
    this.updateAutomaticHintTimer()
  }

  private onReset = (): void => {
    this.updateUI({
      game: resetGame(this.uiState.game),
      hint: null,
    })
    this.updateAutomaticHintTimer()
  }

  private onNewWinnableGame = (drawnCards: 1 | 3): void => {
    const statePatch: Partial<IUIState> = {}
    statePatch.game = this.createNewGame(drawnCards)
    statePatch.hint = null
    this.gameAddedToHighScores = false
    this.updateUI(statePatch)
    this.updateAutomaticHintTimer()
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

  private onBotMove = (): void => {
    this.updateUI({
      game: makeMove(this.uiState.game, this.botOption),
      hint: null,
    })
    this.updateAutomaticHintTimer()
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

  private onAutomaticHintDelayChange = (newAutomaticHintDelay: number): void => {
    this.updateUI({
      automaticHintDelay: newAutomaticHintDelay,
      hint: null,
    })

    this.settingsStorage.setAutomaticHintDelay(newAutomaticHintDelay).catch(
      // tslint:disable-next-line:no-console
      (error) => console.error('Failed to save the automatic hint delay settings', error),
    )
    this.updateAutomaticHintTimer()
  }

  private onStockPositionChange = (newStockPosition: StockPosition): void => {
    this.updateUI({
      stockPosition: newStockPosition,
    })

    this.settingsStorage.setStockPosition(newStockPosition).catch(
      (error) => console.error('Failed to save the stock position', error), // tslint:disable-line:no-console
    )
  }

  private onImport = (): void => {
    const state = prompt('Exportovaný stav hry:') || ''
    this.updateUI({
      game: deserialize(state),
    })
  }

  private updateAutomaticHintTimer(): void {
    if (this.automaticHintTimeoutId) {
      clearTimeout(this.automaticHintTimeoutId)
      this.automaticHintTimeoutId = null
    }

    if (this.uiState.automaticHintDelay && !isVictory(this.uiState.game.state)) {
      this.automaticHintTimeoutId = window.setTimeout(() => {
        this.automaticHintTimeoutId = null
        if (!this.uiState.hint && !isVictory(this.uiState.game.state)) {
          this.onShowHint()
        }
      }, this.uiState.automaticHintDelay)
    }
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
