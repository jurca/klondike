import * as sbrowserApis from '@seznam/seznam.cz-browser-game-module-api'
import {createElement} from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {IBotOptions, makeMove} from '../../game/Bot'
import {ICard, Side} from '../../game/Card'
import {expand} from '../../game/Compactor'
import {isVictory} from '../../game/Desk'
import {createNewGame, executeMove, IGame, INewGameRules, isVictoryGuaranteed, resetGame} from '../../game/Game'
import {Move, MoveType} from '../../game/Move'
import {getMoveHints, HintGeneratorMode} from '../../game/MoveHintGenerator'
import {deserialize as deserialize2} from '../../game/Serializer'
import {deserialize as deserialize3} from '../../game/Serializer_v3'
import {lastItemOrNull} from '../../game/util'
import App from './App'
import CardBackfaceStyle from './CardBackfaceStyle'
import {DESK_SKINS, IDeskSkin} from './deskSkins'
import DeskStyle from './DeskStyle'
import * as Limits from './conf/Limits'
import Congratulations from './modalContent/Congratulations'
import ModalContentComponent, {IModalContentComponentProps, IModalContentComponentStaticProps} from './modalContent/ModalContentComponent'
import NewGame from './modalContent/NewGame'
import PausedGame from './modalContent/PausedGame'
import Settings from './modalContent/Settings'
import SignIn from './modalContent/SignIn'
import HighScoresStorage from './storage/HighScoresStorage'
import PausedGameStorage from './storage/PausedGameStorage'
import SettingsStorage, {StockPosition} from './storage/SettingsStorage'
import StatisticsStorage, {Statistics} from './storage/StatisticsStorage'
import WinnableGamesProvider from './WinnableGamesProvider'

const GAME_ID = 'solitaire'
const AUTOMATIC_HINT_DELAY = 15_000
const AUTOMATIC_COMPLETION_MOVE_INTERVAL = 250
const CONGRATULATIONS_UI_SHOW_DELAY = 5_000

interface IUIState {
  game: null | IGame
  hint: null | ICard
  deskSkin: IDeskSkin
  cardBackFaceStyle: CardBackfaceStyle
  automaticHintDelay: number,
  stockPosition: StockPosition,
  automaticCompletionEnabled: boolean,
  modalContentStack: readonly ModalContentComponent[]
  pausedGame: null | IGame
  isAutoCompletingGame: boolean
}

export default class AppController {
  private readonly uiState: Readonly<IUIState>
  private gameAddedToHighScores: boolean = false
  private automaticHintTimeoutId: null | number = null
  private automaticCompletionTimeoutId: null | number = null
  private readonly modalContentComponentCache = new WeakMap<
    ModalContentComponent,
    React.ComponentType & IModalContentComponentStaticProps
  >()
  private congratulationsUiTimeoutId: null | number = null
  private sessionStatistics = {
    startedGames: 0,
    wonGames: 0,
  }

  constructor(
    private readonly uiRoot: HTMLElement,
    private readonly newGameProvider: WinnableGamesProvider,
    deskSkin: IDeskSkin,
    cardBackFaceStyle: CardBackfaceStyle,
    automaticHintDelay: number,
    stockPosition: StockPosition,
    automaticCompletionEnabled: boolean,
    pausedGame: null | IGame,
    private gameplayStatistics: Statistics,
    private readonly isUserSignedIn: boolean,
    private readonly settingsStorage: SettingsStorage,
    private readonly highScoresStorage: HighScoresStorage,
    private readonly pausedGameStorage: PausedGameStorage,
    private readonly statisticsStorage: StatisticsStorage,
    private readonly newGameOptions: INewGameRules,
    private readonly botOptions: IBotOptions,
  ) {
    this.uiState = {
      automaticCompletionEnabled,
      automaticHintDelay,
      cardBackFaceStyle,
      deskSkin,
      game: null,
      hint: null,
      isAutoCompletingGame: false,
      modalContentStack: [pausedGame ? PausedGame : NewGame],
      pausedGame,
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
          isPaused: !this.uiState.game && !!this.uiState.pausedGame,
          deskSkin: this.uiState.deskSkin,
          cardBackFace: this.uiState.cardBackFaceStyle,
          stockPosition: this.uiState.stockPosition,
          modalContent: this.getModalContentComponent(),
          isModalContentNested: this.uiState.modalContentStack.length > 1,
          onMove: this.onMove,
          onReset: this.onReset,
          onNewGame: this.onShowModalContent.bind(this, NewGame, false),
          onShowHint: this.onShowHint,
          onBotMove: this.onBotMove,
          onPauseGame: this.onPauseGame,
          onCloseModalContent: this.onCloseModalContent,
          onLeaveCurrentModalContent: this.onLeaveCurrentModalContent,
          onShowSettings: this.onShowModalContent.bind(this, Settings, false),
          onImport: this.onImport,
          onExitApp: this.onExitApp,
        },
      ),
      this.uiRoot,
    )
    // tslint:enable:object-literal-sort-keys
  }

  private get modalContentProps(): IModalContentComponentProps {
    const statistics = this.gameplayStatistics
    const totalStartedGames = statistics[1].startedGamesCount + statistics[3].startedGamesCount
    // tslint:disable:object-literal-sort-keys
    return {
      gameplayStats: this.gameplayStatistics,
      deskStyle: this.uiState.deskSkin.desk.style,
      cardBackFaceStyle: this.uiState.cardBackFaceStyle,
      stockPosition: this.uiState.stockPosition,
      automaticHintEnabled: !!this.uiState.automaticHintDelay,
      automaticCompletionEnabled: this.uiState.automaticCompletionEnabled,
      totalStartedGames,
      onNewGame: this.onNewWinnableGame,
      onShowContent: this.onShowModalContent,
      onLeaveCurrentModalContent: this.onLeaveCurrentModalContent,
      onCloseModalContent: this.onCloseModalContent,
      defaultTableauPiles: this.newGameOptions.tableauPiles,
      winnableGamesProvider: this.newGameProvider,
      onResumePreviousGame: this.onResumePreviousGame,
      onSetDeskStyle: this.onDeskStyleChange,
      onSetCardBackFaceStyle: this.onCardBackStyleChange,
      onSetStockPosition: this.onStockPositionChange,
      onSetAutomaticHintEnabled: this.onSetAutomaticHintEnabled,
      onSetAutomaticCompletionEnabled: this.onSetAutomaticCompletionEnabled,
      onSignIn: this.onSignIn,
      onExitApp: this.onExitApp,
    }
    // tslint:enable:object-literal-sort-keys
  }

  private getModalContentComponent(): null | React.ComponentType & IModalContentComponentStaticProps {
    const currentModalContent = lastItemOrNull(this.uiState.modalContentStack)
    if (!currentModalContent) {
      return null
    }

    const modalContentComponent = this.modalContentComponentCache.get(currentModalContent) || Object.assign(
      () => createElement(currentModalContent, this.modalContentProps),
      {
        displayName: `AppController(${currentModalContent.displayName || currentModalContent.name})`,
        title: currentModalContent.title,
        type: currentModalContent.type,
      },
    )
    this.modalContentComponentCache.set(currentModalContent, modalContentComponent)
    return modalContentComponent
  }

  private onMove = (move: Move): void => {
    if (!this.uiState.game || this.uiState.isAutoCompletingGame) {
      return
    }

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

    if (isVictory(statePatch.game.state)) {
      this.onVictory(statePatch.game)
    }

    if (this.uiState.automaticCompletionEnabled && isVictoryGuaranteed(statePatch.game)) {
      statePatch.isAutoCompletingGame = true
      if (this.automaticCompletionTimeoutId) {
        window.clearTimeout(this.automaticCompletionTimeoutId)
      }
      this.automaticCompletionTimeoutId = window.setTimeout(
        this.executeAutoCompletionMove,
        AUTOMATIC_COMPLETION_MOVE_INTERVAL,
      )
    }

    this.updateUI(statePatch)
    this.updateAutomaticHintTimer()
  }

  private onReset = (): void => {
    if (!this.uiState.game) {
      return
    }

    this.updateUI({
      game: resetGame(this.uiState.game),
      hint: null,
      isAutoCompletingGame: false,
    })
    this.updateAutomaticHintTimer()
  }

  private onNewWinnableGame = (drawnCards: 1 | 3): void => {
    const statePatch: Partial<IUIState> = {}
    
    const statistics = this.gameplayStatistics
    const totalStartedGames = statistics[1].startedGamesCount + statistics[3].startedGamesCount
    if (!this.isUserSignedIn && totalStartedGames >= Limits.UNAUTHENTICATED_GAMES_LIMIT) {
      statePatch.modalContentStack = [SignIn]
      this.updateUI(statePatch)
      return
    }

    statePatch.game = this.createNewGame(drawnCards)
    statePatch.hint = null
    statePatch.isAutoCompletingGame = false
    statePatch.modalContentStack = []
    this.gameAddedToHighScores = false
    if (this.congratulationsUiTimeoutId) {
      clearTimeout(this.congratulationsUiTimeoutId)
      this.congratulationsUiTimeoutId = null
    }
    this.updateUI(statePatch)
    this.updateAutomaticHintTimer()
    this.sessionStatistics.startedGames++
    this.statisticsStorage.onNewGameStarted(drawnCards).then((statistics) => {
      this.gameplayStatistics = statistics
    })
  }

  private onShowHint = (): void => {
    if (!this.uiState.game) {
      return
    }

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
    if (!this.uiState.game) {
      return
    }

    this.updateUI({
      game: makeMove(this.uiState.game, this.botOptions),
      hint: null,
    })
    this.updateAutomaticHintTimer()
  }

  private onPauseGame = (): void => {
    const {game} = this.uiState
    if (!game || isVictory(game.state) || this.uiState.isAutoCompletingGame) {
      return
    }

    const pausedGame = executeMove(game, {move: MoveType.PAUSE})
    this.updateUI({
      game: null,
      modalContentStack: [PausedGame],
      pausedGame,
    })
    this.pausedGameStorage.setPausedGame(pausedGame).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to save the paused game', error)
    })
  }

  private onResumePreviousGame = (): void => {
    if (!this.uiState.pausedGame) {
      return
    }

    this.updateUI({
      game: executeMove(this.uiState.pausedGame, {move: MoveType.RESUME}),
      modalContentStack: [],
      pausedGame: null,
    })
    this.pausedGameStorage.deletePausedGame().catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to clear the paused error storage', error)
    })
  }

  private onExitApp = async (): Promise<void> => {
    const game = this.uiState.game && executeMove(this.uiState.game, {move: MoveType.PAUSE})

    if (game) {
      try {
        await this.pausedGameStorage.setPausedGame(game)
      } catch (savingError) {
        // tslint:disable-next-line:no-console
        console.error('Failed to save the game', savingError)
      }
    }

    sbrowserApis.gamesExit(GAME_ID, this.sessionStatistics.startedGames, this.sessionStatistics.wonGames)
    location.href = 'menu.html'
  }

  private onDeskStyleChange = (newStyle: DeskStyle): void => {
    const deskSkin = ((): IDeskSkin => {
      switch (newStyle) {
        case DeskStyle.GREEN_S:
          return DESK_SKINS.GREEN_S
        case DeskStyle.GREEN_S_TILES:
          return DESK_SKINS.GREEN_S_TILES
        case DeskStyle.RED_S_TILES:
          return DESK_SKINS.RED_S_TILES
        case DeskStyle.TEAL_COLORS:
          return DESK_SKINS.TEAL_COLORS
        default:
          throw new Error(`Unknown desk style: ${newStyle}`)
      }
    })()
    this.settingsStorage.setDeskSkin(deskSkin).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to save desk skin', error)
    })
    this.updateUI({
      deskSkin,
    })
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

  private onSetAutomaticHintEnabled = (enabled: boolean): void => {
    this.onAutomaticHintDelayChange(enabled ? AUTOMATIC_HINT_DELAY : 0)
  }

  private onSetAutomaticCompletionEnabled = (enabled: boolean): void => {
    this.settingsStorage.setEnableAutomaticCompletion(enabled).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Failed to save automatic game completion preference', error)
    })
    this.updateUI({
      automaticCompletionEnabled: enabled,
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
    switch (state.charAt(0)) {
      case '3':
        this.updateUI({game: deserialize3(state)})
        break
      case '2':
        this.updateUI({game: deserialize2(state)})
        break
      case '{':
        this.updateUI({game: expand(JSON.parse(state))})
        break
      default:
        throw new Error('Unsupported serialized game format')
    }
  }

  private onShowModalContent = (newContent: ModalContentComponent, stack: boolean): void => {
    if (this.isUserSignedIn === false && newContent === NewGame) {
      const statistics = this.gameplayStatistics
      const totalStartedGames = statistics[1].startedGamesCount + statistics[3].startedGamesCount
      if (
        totalStartedGames === Limits.UNAUTHENTICATED_GAMES_WARNING ||
        totalStartedGames >= Limits.UNAUTHENTICATED_GAMES_LIMIT
      ) {
        if (totalStartedGames < Limits.UNAUTHENTICATED_GAMES_LIMIT && this.uiState.modalContentStack[0] === SignIn) {
          // Allow transitioning from the sign-in dialog to the new game dialog if the player has not reached the hard
          // limit yet
          this.updateUI({
            modalContentStack: [newContent]
          })
          return
        }

        this.updateUI({
          modalContentStack: [SignIn],
        })
        return
      }
    }

    this.updateUI({
      modalContentStack: stack ? this.uiState.modalContentStack.concat(newContent) : [newContent],
    })
  }

  private onCloseModalContent = (): void => {
    if (!this.uiState.game && this.uiState.pausedGame) {
      this.onResumePreviousGame()
    } else {
      this.updateUI({
        modalContentStack: [],
      })
    }
  }

  private onLeaveCurrentModalContent = (): void => {
    this.updateUI({
      modalContentStack: this.uiState.modalContentStack.slice(0, -1),
    })
  }

  private onSignIn = (): void => {
    sbrowserApis.openLoginForm()
  }

  private updateAutomaticHintTimer(): void {
    const {game} = this.uiState
    if (!game) {
      return
    }

    if (this.automaticHintTimeoutId) {
      clearTimeout(this.automaticHintTimeoutId)
      this.automaticHintTimeoutId = null
    }

    if (this.uiState.automaticHintDelay && !isVictory(game.state)) {
      this.automaticHintTimeoutId = window.setTimeout(() => {
        this.automaticHintTimeoutId = null
        if (!this.uiState.hint && !isVictory(game.state)) {
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

  private executeAutoCompletionMove = (): void => {
    this.automaticCompletionTimeoutId = null
    if (!this.uiState.game || !this.uiState.isAutoCompletingGame) {
      return
    }

    const statePatch: Partial<IUIState> = {}
    statePatch.game = makeMove(this.uiState.game, this.botOptions)

    if (isVictory(statePatch.game.state)) {
      statePatch.isAutoCompletingGame = false
      this.onVictory(statePatch.game)
    } else {
      this.automaticCompletionTimeoutId = window.setTimeout(
        this.executeAutoCompletionMove,
        AUTOMATIC_COMPLETION_MOVE_INTERVAL,
      )
    }

    this.updateUI(statePatch)
  }

  private onVictory(wonGame: IGame): void {
    if (!this.gameAddedToHighScores) {
      this.gameAddedToHighScores = true
      this.highScoresStorage.addGame(wonGame).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('Failed to add the won game to the high scores table', error)
      })
      this.statisticsStorage.addGame(wonGame).then((statistics) => {
        this.gameplayStatistics = statistics
        this.sessionStatistics.wonGames++
      }).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('Failed to add the won game to the gameplay statistics', error)
      })
    }

    if (this.congratulationsUiTimeoutId) {
      clearTimeout(this.congratulationsUiTimeoutId)
    }
    this.congratulationsUiTimeoutId = window.setTimeout(() => {
      this.congratulationsUiTimeoutId = null
      if (this.uiState.game && isVictory(this.uiState.game.state) && !this.uiState.modalContentStack.length) {
        this.onShowModalContent(Congratulations, false)
      }
    }, CONGRATULATIONS_UI_SHOW_DELAY)
  }
}
