import classnames from 'classnames'
import {html} from 'neverland'
import styles from './dropArea.css'

export default function DropArea(areaId: unknown, content: unknown, className?: string) {
  return html`<drop-area class=${classnames(styles.dropArea, className)} .areaId=${areaId}>${content}</drop-area>`
}
