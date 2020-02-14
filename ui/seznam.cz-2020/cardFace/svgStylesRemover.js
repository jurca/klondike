// Unfortunately, SVGO (https://jakearchibald.github.io/svgomg/) does not replace all style declarations with
// attributes, and since SVG style declarations clash with each other when the SVG is used inline, we had to remove them
// like this

function rgbToHex(rgb) {
  const parts = rgb.slice(4, -1).split(/\s*,\s*/).map(part => parseInt(part, 10).toString(16).padStart(2, '0'))
  return `#${parts.join('')}`
}

function parseStyle(style) {
  const rules = style.sheet.rules
  const styling = {}
  for (const {selectorText, style} of rules) {
    if (!/^\.cls-\d+$/.test(selectorText) || style[0] !== 'fill') {
      continue
    }
    styling[selectorText.substring(1)] = rgbToHex(style['fill'])
  }
  return styling
}

function replaceStyles(cardRoot) {
  const styleNode = cardRoot.querySelector('style')
  const style = parseStyle(styleNode)
  for (const [className, fillColor] of Object.entries(style)) {
    for (const node of cardRoot.querySelectorAll(`[class=${className}]`)) {
      node.setAttribute('fill', fillColor)
      node.removeAttribute('class')
    }
  }
  styleNode.parentNode.removeChild(styleNode)
}

[...document.querySelectorAll('klondike-card style')].map(node => node.closest('klondike-card')).map(
  card => (replaceStyles(card), card.querySelectorAll('svg')[1])
)

// The following snippet then removes all id attributes except the ones on <linearGradient> elements
;[...document.querySelectorAll(['[id]'])].filter(node => node.tagName !== 'linearGradient').map(
  node => (node.removeAttribute('id'), node.closest('svg'))
)

// Note: Linear gradients can be inlined (removing the id attributes) using this trick:
// http://dahlström.net/svg/paint/datauri-gradient.svg
