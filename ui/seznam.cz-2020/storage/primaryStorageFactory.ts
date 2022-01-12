import IStorage from './IStorage'
import LocalStorage from './LocalStorage'
import SBrowserStorage from './SBrowserStorage'
import VolatileStorage from './VolatileStorage'

export default function primaryStorageFactory(keyPrefix: string): IStorage {
  try {
    return new SBrowserStorage()
  } catch (error) {
    console.warn('Failed to initialize SBrowser persistent storage, falling back to DOM storage')
  }

  try {
    if (
      // Match localhost, IPv4 and IPv6 addresses
      /^(?:localhost|\d+(:?\.\d+){3}|\[(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,7})?(?:::)?(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,7})?])$/.test(location.hostname)
    ) {
      return new VolatileStorage(keyPrefix)
    }
    if (!process.env.ENABLE_FILE_SYSTEM_LOCAL_STORAGE && location.protocol === 'file:') {
      return new VolatileStorage(keyPrefix)
    }

    return new LocalStorage(keyPrefix)
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.warn('Failed to initialize persistent local storage, falling back to volatile storage', error)
    return new VolatileStorage(keyPrefix)
  }
}
