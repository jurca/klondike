import classnames from 'classnames'
import * as React from 'react'
import style from './fullscreenToggle.css'
import FullscreenOff from './icon/fullscreen-off.svg'
import FullscreenOn from './icon/fullscreen-on.svg'

interface IProps {
  isFullscreenModeActive: boolean
  onToggleFullscreen(): void
}

export default function FullscreenToggle({isFullscreenModeActive, onToggleFullscreen}: IProps) {
  return (
    <button
      className={classnames(style.fullscreenToggle, isFullscreenModeActive && style.active)}
      onClick={onToggleFullscreen}
    >
      {isFullscreenModeActive ?
        <FullscreenOff/>
      :
        <FullscreenOn/>
      }
    </button>
  )
}
