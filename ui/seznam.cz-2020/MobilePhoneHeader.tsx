import classnames from 'classnames'
import * as React from 'react'
import Gear from './icon/gear.svg'
import Left from './icon/left.svg'
import {isMobilePhone} from './mobilePhoneDetector'
import style from './mobilePhoneHeader.css'

interface IProps {
  onLeave(): void
  onShowSettings(): void
}

export default function MobilePhoneHeader({onLeave, onShowSettings}: IProps) {
  const isIOS = /\(iPhone;/.test(navigator.userAgent)

  return (
    <div className={classnames(style.mobilePhoneHeader, isMobilePhone() && style.isPhoneOrTablet, isIOS && style.ios)}>
      <button className={style.button} onClick={onLeave}>
        <Left/>
      </button>
      <h1 className={style.title}>Solitaire</h1>
      <button className={style.button} onClick={onShowSettings}>
        <Gear/>
      </button>
    </div>
  )
}
