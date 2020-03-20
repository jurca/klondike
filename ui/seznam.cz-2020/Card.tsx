import classnames from 'classnames'
import * as React from 'react'
import {ICard, Side} from '../../game/Card'
import style from './card.css'
import CardBackface from './CardBackface'
import CardFrontFace from './CardFrontFace'
import settingsContext from './settingsContext'

interface IProps {
  card: ICard,
  overrideRotation?: number,
  withShadow?: boolean,
  onClick?: null | ((card: ICard) => void),
}

export default function Card({card, overrideRotation, withShadow, onClick}: IProps) {
  const {cardBackFace} = React.useContext(settingsContext)
  const rotation = typeof overrideRotation === 'number' ? overrideRotation : (card.side === Side.FACE ? 0 : 180)
  const onClickHandler = React.useMemo(() => onClick?.bind(null, card), [card, onClick])

  return (
    <div className={classnames(style.card, withShadow && style.shadow)} onClick={onClickHandler}>
      <div className={style.body} style={{transform: `rotateY(${rotation}deg)`}}>
        <div className={style.back}><CardBackface style={cardBackFace}/></div>
        <div className={style.front}><CardFrontFace color={card.color} rank={card.rank}/></div>
      </div>
    </div>
  )
}
