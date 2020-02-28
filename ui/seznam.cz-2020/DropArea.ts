import {augmentor} from 'dom-augmentor'
import {Hole, html} from 'lighterhtml'

export default augmentor(function DropArea(content: Hole) {
  return html`<drop-area>${content}</drop-area>`
})
