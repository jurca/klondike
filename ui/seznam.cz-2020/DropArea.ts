import classnames from 'classnames'
import {html} from 'neverland'
import styles from './dropArea.css'

export default function DropArea(content: unknown, className?: string) {
  return html`<drop-area class=${classnames(styles.dropArea, className)}>${content}</drop-area>`
}
