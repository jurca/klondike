import * as React from 'react'
import deskStyles from '../desk.css'
import Clubs from '../deskBackground/clubs.svg'
import Diamonds from '../deskBackground/diamonds.svg'
import Hearths from '../deskBackground/hearths.svg'
import GreenS from '../deskBackground/s.svg'
import Spades from '../deskBackground/spades.svg'
import {DESK_SKINS, IDeskSkin} from '../deskSkins'
import DeskStyle from '../DeskStyle'
import {Type} from '../ModalContentHost'
import styles from './deskBackgroundSettings.css'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ThemeChoice from './ThemeChoice'
import {createThemePreviewFactory} from './ThemePreview'

const DeskBackgroundSettings: ModalContentComponent = Object.assign(
  function DeskBackgroundSettingsUI(props: IModalContentComponentProps): React.ReactElement {
    const themePreviewBaseFactory = React.useMemo(
      () => createThemePreviewFactory(
        props.defaultTableauPiles,
        props.winnableGamesProvider,
        'Změnit pozadí hry',
        'Nastavit jako pozadí',
      ),
      [props.defaultTableauPiles, props.winnableGamesProvider],
    )
    const themePreviewFactory = React.useMemo(
      () => (deskStyle: DeskStyle) => themePreviewBaseFactory(deskStyle, props.cardBackFaceStyle, () => {
        props.onSetDeskStyle(deskStyle)
        props.onLeaveCurrentModalContent()
      }),
      [themePreviewBaseFactory, props.cardBackFaceStyle, props.onSetDeskStyle, props.onLeaveCurrentModalContent],
    )
    const cachingThemePreviewFactory = React.useMemo(
      () => (deskStyle: DeskStyle) => React.useMemo(() => themePreviewFactory(deskStyle), [deskStyle]),
      [themePreviewFactory],
    )
    const themeOptionFactory = React.useMemo(
      () => (deskSkin: IDeskSkin, ui: React.ReactElement) => ({
        confirmationUI: cachingThemePreviewFactory(deskSkin.desk.style),
        isSelected: props.deskStyle === deskSkin.desk.style,
        ui: (
          <div className={styles.option} style={{background: deskSkin.desk.background}}>
            {ui}
          </div>
        ),
      }),
      [cachingThemePreviewFactory],
    )

    return (
      <ThemeChoice {...props}>
        {[
          themeOptionFactory(DESK_SKINS.GREEN_S_TILES, <div className={deskStyles.greenSTiles}/>),
          themeOptionFactory(DESK_SKINS.RED_S_TILES, <div className={deskStyles.redSTiles}/>),
          themeOptionFactory(
            DESK_SKINS.TEAL_COLORS,
            <div className={deskStyles.tealColors}>
              <div className={deskStyles.tealColorsGroup}>
                <Hearths/>
                <Spades/>
                <Diamonds/>
                <Clubs/>
              </div>
            </div>,
          ),
          themeOptionFactory(
            DESK_SKINS.GREEN_S,
            <div className={deskStyles.greenSImageWrapper}>
              <div className={deskStyles.greenSInnerImageWrapper}>
                <div className={deskStyles.greenSImage}>
                  <GreenS/>
                </div>
              </div>
            </div>,
          ),
        ]}
      </ThemeChoice>
    )
  },
  {
    title: 'Změnit pozadí hry',
    type: Type.DRAWER,
  },
)

export default DeskBackgroundSettings
