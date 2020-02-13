import {html} from 'lighterhtml'

export default function InlineSvg(svgCode: string) {
  const fragments = [svgCode]
  const templateLiteralArray: TemplateStringsArray = Object.assign(fragments, {raw: fragments})
  return html(templateLiteralArray)
}
