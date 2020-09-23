import * as React from 'react'
import deskStyles from '../desk.css'
import Clubs from '../deskBackground/clubs.svg'
import Diamonds from '../deskBackground/diamonds.svg'
import Hearths from '../deskBackground/hearths.svg'
import GreenS from '../deskBackground/s.svg'
import Spades from '../deskBackground/spades.svg'
import {DESK_SKINS} from '../deskSkins'
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

    return (
      <ThemeChoice {...props}>
        {[
          {
            confirmationUI: cachingThemePreviewFactory(DeskStyle.GREEN_S_TILES),
            isSelected: props.deskStyle === DeskStyle.GREEN_S_TILES,
            ui: (
              <div className={styles.option} style={{background: DESK_SKINS.GREEN_S_TILES.desk.background}}>
                <div className={deskStyles.greenSTiles}/>
              </div>
            ),
          },
          {
            confirmationUI: cachingThemePreviewFactory(DeskStyle.RED_S_TILES),
            isSelected: props.deskStyle === DeskStyle.RED_S_TILES,
            ui: (
              <div className={styles.option} style={{background: DESK_SKINS.RED_S_TILES.desk.background}}>
                <div className={deskStyles.redSTiles}/>
              </div>
            ),
          },
          {
            confirmationUI: cachingThemePreviewFactory(DeskStyle.TEAL_COLORS),
            isSelected: props.deskStyle === DeskStyle.TEAL_COLORS,
            ui: (
              <div className={styles.option} style={{background: DESK_SKINS.TEAL_COLORS.desk.background}}>
                <div className={deskStyles.tealColors}>
                  <div className={deskStyles.tealColorsGroup}>
                    <Hearths/>
                    <Spades/>
                    <Diamonds/>
                    <Clubs/>
                  </div>
                </div>
              </div>
            ),
          },
          {
            confirmationUI: cachingThemePreviewFactory(DeskStyle.GREEN_S),
            isSelected: props.deskStyle === DeskStyle.GREEN_S,
            ui: (
              <div className={styles.option} style={{background: DESK_SKINS.GREEN_S.desk.background}}>
                <div className={deskStyles.greenSImageWrapper}>
                  <div className={deskStyles.greenSInnerImageWrapper}>
                    <div className={deskStyles.greenSImage}>
                      <GreenS/>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
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
