import DeskStyle from './DeskStyle'

export interface IDeskSkin {
  deskColor: {
    background: string,
    topBar: string,
  },
  deskStyle: DeskStyle,
  foundationBackgroundColor: {
    dark: string,
    light: string,
  }
}

export const GREEN_S: IDeskSkin = {
  deskColor: {
    background: 'linear-gradient(0deg, #287d3b 0%, #298d41 17%, #29a249 45%, #2aaf4d 73%, #2ab34f 100%)',
    topBar: '#009245',
  },
  deskStyle: DeskStyle.GREEN_S,
  foundationBackgroundColor: {
    dark: '#00ab51',
    light: '#75cc81',
  },
}

export const TEAL_COLORS: IDeskSkin = {
  deskColor: {
    background: 'linear-gradient(0deg, #1e8270 0%, #1e927f 17%, #1ea793 45%, #1eb49f 73%, #1eb8a3 100%)',
    topBar: '#009287',
  },
  deskStyle: DeskStyle.TEAL_COLORS,
  foundationBackgroundColor: {
    dark: '#00ab9e',
    light: '#5cc9b7',
  },
}

export const GREEN_S_TILES: IDeskSkin = {
  deskColor: {
    background: 'linear-gradient(0deg, #00824e 0%, #008751 100%)',
    topBar: '#007d4b',
  },
  deskStyle: DeskStyle.GREEN_S_TILES,
  foundationBackgroundColor: {
    dark: '#007546',
    light: '#009e5f',
  },
}
