import AppController from './AppController'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS, MAX_HIGH_SCORE_TABLE_ENTRIES} from './config'
import HighScoresStorage from './storage/HighScoresStorage'
import primaryStorageFactory from './storage/primaryStorageFactory'
import SettingsStorage from './storage/SettingsStorage'
import WinnableGamesProvider from './WinnableGamesProvider'

const STORAGE_KEY_PREFIX = 'klondike-seznam.cz-2020'

const highScoresStorage = new HighScoresStorage(
  primaryStorageFactory(`${STORAGE_KEY_PREFIX}.highScores`),
  MAX_HIGH_SCORE_TABLE_ENTRIES,
)
const settingsStorage = new SettingsStorage(primaryStorageFactory(`${STORAGE_KEY_PREFIX}.settings`))
Promise.all([
  settingsStorage.getDeskSkin(),
  settingsStorage.getCardBackFaceStyle(),
  settingsStorage.getAutomaticHintDelay(),
  settingsStorage.getStockPosition(),
]).then(([deskSkin, cardBackFaceStyle, automaticHintDelay, stockPosition]) => {
  const uiRoot = document.getElementById('app')!
  const winnableGamesProvider = new WinnableGamesProvider()
  const appController = new AppController(
    uiRoot,
    winnableGamesProvider,
    deskSkin,
    cardBackFaceStyle,
    automaticHintDelay,
    stockPosition,
    settingsStorage,
    highScoresStorage,
    DEFAULT_NEW_GAME_OPTIONS,
    BOT_OPTIONS,
  )
  appController.start()
})
