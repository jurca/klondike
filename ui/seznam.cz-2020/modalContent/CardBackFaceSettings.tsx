import * as React from 'react'
import CardBackface from '../CardBackface'
import CardBackfaceStyle from '../CardBackfaceStyle'
import {Type} from '../ModalContentHost'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ThemeChoice from './ThemeChoice'
import {createThemePreviewFactory} from './ThemePreview'

const CardBackFaceSettings: ModalContentComponent = Object.assign(
  function CardBackFaceSettingsUI(props: IModalContentComponentProps): React.ReactElement {
    const themePreviewBaseFactory = React.useMemo(
      () => createThemePreviewFactory(
        props.defaultTableauPiles,
        props.winnableGamesProvider,
        'Změnit pozadí karet',
        'Nastavit jako pozadí karet',
      ),
      [props.defaultTableauPiles, props.winnableGamesProvider],
    )
    const themePreviewFactory = React.useMemo(
      () => (cardStyle: CardBackfaceStyle) => themePreviewBaseFactory(props.deskStyle, cardStyle, () => {
        props.onSetCardBackFaceStyle(cardStyle)
        props.onLeaveCurrentModalContent()
      }),
      [themePreviewBaseFactory, props.deskStyle, props.onSetCardBackFaceStyle, props.onLeaveCurrentModalContent],
    )
    const cachingThemePreviewFactory = React.useMemo(
      () => (cardStyle: CardBackfaceStyle) => React.useMemo(() => themePreviewFactory(cardStyle), [cardStyle]),
      [themePreviewFactory],
    )
    const themeOptionFactory = React.useMemo(
      () => (cardStyle: CardBackfaceStyle) => ({
        confirmationUI: cachingThemePreviewFactory(cardStyle),
        isSelected: props.cardBackFaceStyle === cardStyle,
        ui: <CardBackface style={cardStyle}/>,
      }),
      [cachingThemePreviewFactory, props.cardBackFaceStyle],
    )

    return (
      <ThemeChoice {...props}>
        {[
          CardBackfaceStyle.SWithColors,
          CardBackfaceStyle.SeznamLogo,
          CardBackfaceStyle.Dog,
          CardBackfaceStyle.Colors,
        ].map(themeOptionFactory)}
      </ThemeChoice>
    )
  },
  {
    title: 'Změnit pozadí karet',
    type: Type.DRAWER,
  },
)

export default CardBackFaceSettings
