import classnames from 'classnames'
import * as React from 'react'
import styles from './listingItem.css'

interface IProps {
  leftContent: React.ReactChild
  rightContent: React.ReactChild
  onClick?: () => void
}

export default function ListingItem({leftContent, rightContent, onClick}: IProps) {
  return (
    <div
      className={classnames(styles.listingItem, onClick && styles.interactive)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {leftContent}
      {rightContent}
    </div>
  )
}
