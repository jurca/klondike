import classnames from 'classnames'
import * as React from 'react'
import {ICard, Side} from '../../game/Card'
import style from './card.css'
import CardBackface from './CardBackface'
import CardFrontFace from './CardFrontFace'
import settingsContext from './settingsContext'

interface IProps {
  card: ICard
  isHinted: boolean
  overrideRotation?: number
  withShadow?: boolean
  onClick?: null | ((card: ICard) => void)
  onDoubleClick?: null | ((card: ICard) => void)
  onSecondaryClick?: null | ((card: ICard) => void)
}

export default React.memo(function Card({card, isHinted, overrideRotation, withShadow, ...callbacks}: IProps) {
  const {onClick, onDoubleClick, onSecondaryClick} = callbacks
  const {cardBackFace, hint: hintColor, selected: selectedCardColor} = React.useContext(settingsContext)
  const rotation = typeof overrideRotation === 'number' ? overrideRotation : (card.side === Side.FACE ? 0 : 180)
  const onClickHandler = React.useMemo(() => onClick?.bind(null, card), [card, onClick])
  const onDoubleClickHandler = React.useMemo(() => onDoubleClick?.bind(null, card), [card, onDoubleClick])
  const onSecondaryClickHandler = React.useMemo(() => (event: React.MouseEvent) => {
    event.preventDefault()
    if (onSecondaryClick) {
      onSecondaryClick(card)
    }
  }, [card, onSecondaryClick])

  return (
    <div
      className={classnames(style.card, isHinted && style.isHinted, withShadow && style.shadow)}
      style={{
        '--hint-color': hintColor,
        '--selected-color': selectedCardColor,
      } as React.CSSProperties}
      onClick={onClickHandler}
      onDoubleClick={onDoubleClickHandler}
      onContextMenu={onSecondaryClickHandler}
    >
      <div className={style.body} style={{transform: `rotateY(${rotation}deg)`}}>
        <div className={style.back}><CardBackface style={cardBackFace}/></div>
        <div className={style.front}><CardFrontFace color={card.color} rank={card.rank}/></div>
      </div>
    </div>
  )
})
