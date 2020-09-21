import classnames from 'classnames'
import * as React from 'react'
import styles from './button.css'

export default function Button(
  props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
) {
  return (
    <button {...props} className={classnames(styles.button, props.className)}/>
  )
}
