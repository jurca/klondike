import classnames from 'classnames'
import * as React from 'react'
import Gear from './icon/gear.svg'
import Left from './icon/left.svg'
import {isMobilePhoneOrAndroidTablet} from './mobilePhoneDetector'
import style from './mobilePhoneHeader.css'

interface IProps {
  onLeave(): void
  onShowSettings(): void
}

export default function MobilePhoneHeader({onLeave, onShowSettings}: IProps) {
  return (
    <div className={classnames(style.mobilePhoneHeader, isMobilePhoneOrAndroidTablet && style.isPhoneOrTablet)}>
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
