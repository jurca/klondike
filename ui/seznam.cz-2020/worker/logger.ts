export enum SEVERITY {
  ERROR = 'SEVERITY.ERROR',
  WARNING = 'SEVERITY.WARNING',
  INFO = 'SEVERITY.INFO',
  DEBUG = 'SEVERITY.DEBUG',
}

export function error(...message: readonly unknown[]): void {
  log(SEVERITY.ERROR, message)
}

export function warning(...message: readonly unknown[]): void {
  log(SEVERITY.WARNING, message)
}

export function info(...message: readonly unknown[]): void {
  log(SEVERITY.INFO, message)
}

export function debug(...message: readonly unknown[]): void {
  log(SEVERITY.DEBUG, message)
}

function log(severity: SEVERITY, messages: readonly unknown[]): void {
  switch (severity) {
    case SEVERITY.ERROR:
      // tslint:disable-next-line:no-console
      console.error(`ERROR | ${self.name} | `, ...messages)
      break
    case SEVERITY.WARNING:
      // tslint:disable-next-line:no-console
      console.warn(`WARNING | ${self.name} | `, ...messages)
      break
    case SEVERITY.INFO:
      // tslint:disable-next-line:no-console
      console.info(`INFO | ${self.name} | `, ...messages)
      break
    case SEVERITY.DEBUG:
      // tslint:disable-next-line:no-console
      console.debug(`DEBUG | ${self.name} | `, ...messages)
      break
    default:
      break // ignore
  }
}
