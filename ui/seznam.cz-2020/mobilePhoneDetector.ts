import * as sbrowserApis from '@seznam/seznam.cz-browser-game-module-api'

export function isMobilePhone() {
  return (
    !sbrowserApis.isTablet() &&
    typeof navigator === 'object' &&
    navigator &&
    /(?:\(iPhone;| Android )/.test(navigator.userAgent)
  )
}
