import React from 'react'
import styles from './Summary.module.css'

const CardItem = ({ label = '', value = '' }) => {
  return (
    <div className={styles.card}>
      <span className={styles.card_label}>{label}</span>
      <span className={styles.card_value}>{value}</span>
      <div className={styles.card_line} />
    </div>
  )
}

export default CardItem
