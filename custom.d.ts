// https://webpack.js.org/guides/typescript/#importing-other-assets

declare module '*.svg' {
  const content: React.ComponentType
  export default content
}
