import * as React from 'react'
import RightIcon from '../icon/right.svg'
import {Type} from '../ModalContentHost'
import ListingItem from './ListingItem'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'
import styles from './settings.css'
import Toggle from './Toggle'

const Settings: ModalContentComponent = Object.assign(function SettingsUI(props: IModalContentComponentProps) {
  const onToggleAutomaticHint = React.useMemo(
    () => () => props.setAutomaticHintEnabled(!props.automaticHintEnabled),
    [props.automaticHintEnabled, props.setAutomaticHintEnabled],
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
