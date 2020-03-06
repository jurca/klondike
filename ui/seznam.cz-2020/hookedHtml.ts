import {useRef} from 'dom-augmentor'
import {html as $html, svg as $svg} from 'lighterhtml'

// See https://codepen.io/WebReflection/pen/maQXwq?editors=0010 for the example/documentation for this. The outdated
// documentation of dom-augmentor (https://github.com/WebReflection/dom-augmentor#example) is not helpful since
// lighterhtml no longer exposes the hook function in favor of using html.for()/svg.for() for this (see
// https://github.com/WebReflection/lighterhtml#v2-breaking-changes--improvements).

export const html = Object.assign(
  (...args: [TemplateStringsArray, ...unknown[]]) => $html.for(useRef(null), '').apply(null, args),
  {
    for: $html.for,
  },
)
export const svg = Object.assign(
  (...args: [TemplateStringsArray, ...unknown[]]) => $svg.for(useRef(null), '').apply(null, args),
  {
    for: $svg.for,
  },
)
