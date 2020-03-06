import {useRef} from 'dom-augmentor'
import {html, svg as $svg} from 'lighterhtml'

// See https://codepen.io/WebReflection/pen/maQXwq?editors=0010 for the example/documentation for this. The outdated
// documentation of dom-augmentor (https://github.com/WebReflection/dom-augmentor#example) is not helpful since
// lighterhtml no longer exposes the hook function in favor of using html.for()/svg.for() for this (see
// https://github.com/WebReflection/lighterhtml#v2-breaking-changes--improvements).

// Also, the string id passed to the second argument of html.for()/svg.for() must be unique for the given component's
// instance, otherwise there will be only once instance of the component in the DOM - the last one (at it's correct
// location). For some currently unknown reason, generating the IDs automatically does not solve this - it appears that
// lighterhtml/dom-augmentor re-uses component "instances" whenever possible, which affect state tracking as well.

// Note that the id must be consistent between re-renders of the same component for component updates to work correctly.

export const hookedHtml = (id: string) => (
  (...args: [TemplateStringsArray, ...unknown[]]) => html.for(useRef(null), id).apply(null, args)
)
export const hookedSvg = (id: string) => (
  (...args: [TemplateStringsArray, ...unknown[]]) => $svg.for(useRef(null), id).apply(null, args)
)
