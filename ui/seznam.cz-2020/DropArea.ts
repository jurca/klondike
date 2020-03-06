import classnames from 'classnames'
import {Hole, html} from 'lighterhtml'
import styles from './dropArea.css'

export default function DropArea(content: Hole | HTMLElement, className?: string) {
  return html`<drop-area class=${classnames(styles.dropArea, className)}>${content}</drop-area>`
}
