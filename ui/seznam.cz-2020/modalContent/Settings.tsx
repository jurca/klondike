import * as React from 'react'
import RightIcon from '../icon/right.svg'
import {Type} from '../ModalContentHost'
import {StockPosition} from '../storage/SettingsStorage'
import CardBackFaceSettings from './CardBackFaceSettings'
import DeskBackgroundSettings from './DeskBackgroundSettings'
import GameplayStatistics from './GameplayStatistics'
import HowToPlay from './HowToPlay'
import ListingItem from './ListingItem'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'
import styles from './settings.css'
import Toggle from './Toggle'

const Settings: ModalContentComponent = Object.assign(function SettingsUI(props: IModalContentComponentProps) {
  const onShowGameplayStatistics = React.useMemo(
    () => props.onShowContent.bind(null, GameplayStatistics, true),
    [props.onShowContent],
  )
  const onShowDeskBackgroundSettings = React.useMemo(
    () => props.onShowContent.bind(null, DeskBackgroundSettings, true),
    [props.onShowContent],
  )
  const onShowCardBackFaceSettings = React.useMemo(
    () => props.onShowContent.bind(null, CardBackFaceSettings, true),
    [props.onShowContent],
  )
  const onToggleAutomaticHint = React.useMemo(
    () => () => props.onSetAutomaticHintEnabled(!props.automaticHintEnabled),
    [props.automaticHintEnabled, props.onSetAutomaticHintEnabled],
  )
  const onFlipStockPosition = React.useMemo(
    () => () => props.onSetStockPosition(
      props.stockPosition === StockPosition.LEFT ? StockPosition.RIGHT : StockPosition.LEFT,
    ),
    [props.stockPosition, props.onSetStockPosition],
  )
  const onToggleAutomaticCompletionEnabled = React.useMemo(
    () => () => props.onSetAutomaticCompletionEnabled(!props.automaticCompletionEnabled),
    [props.automaticCompletionEnabled, props.onSetAutomaticCompletionEnabled],
  )
  const onShowHowTo = React.useMemo(() => props.onShowContent.bind(null, HowToPlay, true), [props.onShowContent])

  return (
    <ModalContentWithBottomCloseButton {...props}>
      <ListingItem
        leftContent='Skóre'
        rightContent={
          <span className={styles.rightIcon}>
            <RightIcon/>
          </span>
        }
        onClick={onShowGameplayStatistics}
      />
      <ListingItem
        leftContent='Změnit pozadí hry'
        rightContent={
          <span className={styles.rightIcon}>
            <RightIcon/>
          </span>
        }
        onClick={onShowDeskBackgroundSettings}
      />
      <ListingItem
        leftContent='Změnit pozadí karet'
        rightContent={
          <span className={styles.rightIcon}>
            <RightIcon/>
          </span>
        }
        onClick={onShowCardBackFaceSettings}
      />
      <ListingItem
        leftContent='Automatická nápověda tahu'
        rightContent={
          <Toggle
            defaultChecked={props.automaticHintEnabled}
            onChange={onToggleAutomaticHint}
          />
        }
      />
      <ListingItem
        leftContent='Tahací balíček vpravo'
        rightContent={
          <Toggle
            defaultChecked={props.stockPosition === StockPosition.RIGHT}
            onChange={onFlipStockPosition}
          />
        }
      />
      <ListingItem
        leftContent='Automatické dokončení hry'
        rightContent={
          <Toggle
            defaultChecked={props.automaticCompletionEnabled}
            onChange={onToggleAutomaticCompletionEnabled}
          />
        }
      />
      <ListingItem
        leftContent='Jak hrát Solitaire'
        rightContent=''
        onClick={onShowHowTo}
      />
    </ModalContentWithBottomCloseButton>
  )
}, {
  title: 'Nastavení',
  type: Type.DRAWER,
})

export default Settings
