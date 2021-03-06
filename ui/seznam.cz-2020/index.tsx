import AppController from './AppController'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS, MAX_HIGH_SCORE_TABLE_ENTRIES} from './config'
import HighScoresStorage from './storage/HighScoresStorage'
import PausedGameStorage from './storage/PausedGameStorage'
import primaryStorageFactory from './storage/primaryStorageFactory'
import SettingsStorage from './storage/SettingsStorage'
import StatisticsStorage from './storage/StatisticsStorage'
import WinnableGamesProvider from './WinnableGamesProvider'

const UI_CONTAINER_ID = 'app'
const STORAGE_KEY_PREFIX = 'klondike-seznam.cz-2020'

const highScoresStorage = new HighScoresStorage(
  primaryStorageFactory(`${STORAGE_KEY_PREFIX}.highScores.`),
  MAX_HIGH_SCORE_TABLE_ENTRIES,
)
const settingsStorage = new SettingsStorage(primaryStorageFactory(`${STORAGE_KEY_PREFIX}.settings.`))
const pausedGameStorage = new PausedGameStorage(primaryStorageFactory(`${STORAGE_KEY_PREFIX}.pausedGame.`))
const statisticsStorage = new StatisticsStorage(primaryStorageFactory(`${STORAGE_KEY_PREFIX}.statistics.`))

Promise.all([
  settingsStorage.getDeskSkin(),
  settingsStorage.getCardBackFaceStyle(),
  settingsStorage.getAutomaticHintDelay(),
  settingsStorage.getStockPosition(),
  settingsStorage.getEnableAutomaticCompletion(),
  pausedGameStorage.getPausedGame(),
  statisticsStorage.getStatistics(),
] as const).then(
  ([deskSkin, cardBackFaceStyle, automaticHintDelay, stockPosition, automaticCompletionEnabled, pausedGame, statistics],
) => {
  const uiRoot = document.getElementById(UI_CONTAINER_ID)
  if (!uiRoot) {
    throw new Error(`Cannot find the app UI container element - an element with ${UI_CONTAINER_ID} ID`)
  }

  const winnableGamesProvider = new WinnableGamesProvider()
  const appController = new AppController(
    uiRoot,
    winnableGamesProvider,
    deskSkin,
    cardBackFaceStyle,
    automaticHintDelay,
    stockPosition,
    automaticCompletionEnabled,
    pausedGame,
    statistics,
    settingsStorage,
    highScoresStorage,
    pausedGameStorage,
    statisticsStorage,
    DEFAULT_NEW_GAME_OPTIONS,
    BOT_OPTIONS,
  )
  appController.start()
})
