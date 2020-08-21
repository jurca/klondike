import DeskStyle from './DeskStyle'

export interface IDeskSkin {
  desk: {
    style: DeskStyle,
    background: string,
    stocksBarBackground: string,
    stocksBarShadow: string,
  }
  foundationBackgroundColor: {
    dark: string,
    light: string,
  }
  hint: string
  selected: string
}

export const GREEN_S: IDeskSkin = {
  desk: {
    background: 'linear-gradient(0deg, #287d3b 0%, #298d41 17%, #29a249 45%, #2aaf4d 73%, #2ab34f 100%)',
    stocksBarBackground: 'transparent',
    stocksBarShadow: 'none',
    style: DeskStyle.GREEN_S,
  },
  foundationBackgroundColor: {
    dark: '#00ab51',
    light: '#75cc81',
  },
  hint: '#de0000',
  selected: '#dea000',
}

export const TEAL_COLORS: IDeskSkin = {
  desk: {
    background: 'linear-gradient(0deg, #1e8270 0%, #1e927f 17%, #1ea793 45%, #1eb49f 73%, #1eb8a3 100%)',
    stocksBarBackground: 'transparent',
    stocksBarShadow: 'none',
    style: DeskStyle.TEAL_COLORS,
  },
  foundationBackgroundColor: {
    dark: '#00ab9e',
    light: '#5cc9b7',
  },
  hint: '#de0000',
  selected: '#dea000',
}

export const GREEN_S_TILES: IDeskSkin = {
  desk: {
    background: 'linear-gradient(0deg, #00824e 0%, #008751 100%)',
    stocksBarBackground: 'transparent',
    stocksBarShadow: 'none',
    style: DeskStyle.GREEN_S_TILES,
  },
  foundationBackgroundColor: {
    dark: '#007546',
    light: '#009e5f',
  },
  hint: '#de0000',
  selected: '#dea000',
}

export const RED_S_TILES: IDeskSkin = {
  desk: {
    background: 'linear-gradient(180deg, #9f292a 0%, #9c2829 48%, #932627 83%, #8c2425 98%)',
    stocksBarBackground: 'transparent',
    stocksBarShadow: 'none',
    style: DeskStyle.RED_S_TILES,
  },
  foundationBackgroundColor: {
    dark: '#802122',
    light: '#b45656',
  },
  hint: '#00de00',
  selected: '#00dea0',
}

export const DESK_SKINS = {
  GREEN_S,
  GREEN_S_TILES,
  RED_S_TILES,
  TEAL_COLORS,
}
