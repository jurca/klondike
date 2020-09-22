import classnames from 'classnames'
import * as React from 'react'
import styles from './toggle.css'

export default function Toggle(
  props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
): React.ReactElement {
  return (
    <label className={classnames(styles.toggle, props.className)}>
      <input className={styles.input} {...props} type='checkbox'/>
      <span className={styles.ui}/>
    </label>
  )
}
