import classnames from 'classnames'
import {augmentor} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'
import styles from './dropArea.css'

export default augmentor(function DropArea(content: Hole, className?: string) {
  return html`<drop-area class=${classnames(styles.dropArea, className)}>${content}</drop-area>`
})
