import React from 'react'
import CardItem from './CardItem'
import styles from './styles.module.css'

const CardInRow = ({ data = [] }) => {
  return (
    <div className={styles.card_div} tabIndex={0}>
      {data.map((card, index) => (
        <div className={styles.card_cell} key={index}>
          <CardItem label={card.label} value={card.value} />
        </div>
      ))}
    </div>
  )
}

export default CardInRow
