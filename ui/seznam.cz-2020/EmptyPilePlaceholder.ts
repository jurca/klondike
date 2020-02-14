import {augmentor, useContext} from 'dom-augmentor'
import {html} from 'lighterhtml'
import style from './emptyPilePlaceholder.css'
import settingsContext from './settingsContext'

export default augmentor(function EmptyPilePlaceholder() {
  const settings = useContext(settingsContext)
  const {darK: darkColor, light: lightColor} = settings.foundationBackgroundColor

  return html`
    <klondike-empty-pile-placeholder class=${style.placeholder}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><path d="M8 0h64c4.432 0 8 3.568 8 8v104c0 4.432-3.568 8-8 8H8c-4.432 0-8-3.568-8-8V8c0-4.432 3.568-8 8-8z" fill=${lightColor}/><path d="M10 6h60c2.216 0 4 1.784 4 4v100c0 2.216-1.784 4-4 4H10c-2.216 0-4-1.784-4-4V10c0-2.216 1.784-4 4-4z" fill=${darkColor}/></svg>
    </klondike-empty-pile-placeholder>
  `
})
