import AppController from './AppController'
import {BOT_OPTIONS, DEFAULT_NEW_GAME_OPTIONS} from './config'
import primaryStorageFactory from './storage/primaryStorageFactory'
import SettingsStorage from './storage/SettingsStorage'
import WinnableGamesProvider from './WinnableGamesProvider'

const settingsStorage = new SettingsStorage(primaryStorageFactory('settings'))
Promise.all([
  settingsStorage.getDeskSkin(),
  settingsStorage.getCardBackFaceStyle(),
]).then(([deskSkin, cardBackFaceStyle]) => {
  const uiRoot = document.getElementById('app')!
  const winnableGamesProvider = new WinnableGamesProvider()
  const appController = new AppController(
    uiRoot,
    winnableGamesProvider,
    deskSkin,
    cardBackFaceStyle,
    settingsStorage,
    DEFAULT_NEW_GAME_OPTIONS,
    BOT_OPTIONS,
  )
  appController.start()
})
