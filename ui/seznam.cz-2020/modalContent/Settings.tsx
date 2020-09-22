import * as React from 'react'
import RightIcon from '../icon/right.svg'
import {Type} from '../ModalContentHost'
import {StockPosition} from '../storage/SettingsStorage'
import ListingItem from './ListingItem'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'
import styles from './settings.css'
import Toggle from './Toggle'

const Settings: ModalContentComponent = Object.assign(function SettingsUI(props: IModalContentComponentProps) {
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

  return (
    <ModalContentWithBottomCloseButton {...props}>
      <ListingItem
        leftContent='Skóre'
        rightContent={
          <span className={styles.rightIcon}>
            <RightIcon/>
          </span>
        }
        onClick={() => alert('yay')}
      />
      <ListingItem
        leftContent='Změnit pozadí hry'
        rightContent={
          <span className={styles.rightIcon}>
            <RightIcon/>
          </span>
        }
      />
      <ListingItem
        leftContent='Změnit pozadí karet'
        rightContent={
          <span className={styles.rightIcon}>
            <RightIcon/>
          </span>
        }
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
        leftContent={'Jak hrát Solitaire'}
        rightContent={''}
      />
    </ModalContentWithBottomCloseButton>
  )
}, {
  title: 'Nastavení',
  type: Type.DRAWER,
})

export default Settings
