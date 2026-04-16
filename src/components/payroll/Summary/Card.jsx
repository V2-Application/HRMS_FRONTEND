import React, { useState } from 'react'
import CardItem from './CardItem'
import styles from './Summary.module.css'

const Card = ({ data = [] }) => {
  return (
    <div className={styles.card_div}>
      {data.map((card, index) => {
        return <CardItem label={card.label} value={card.value} key={index}/>
      })}
    </div>
  )
}

export default Card
