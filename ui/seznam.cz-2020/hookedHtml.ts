import {useRef} from 'dom-augmentor'
import {html as $html, svg as $svg} from 'lighterhtml'

export const html = (...args: [TemplateStringsArray, ...unknown[]]) => $html.for(useRef(null), '').apply(null, args)
export const svg = (...args: [TemplateStringsArray, ...unknown[]]) => $svg.for(useRef(null), '').apply(null, args)
