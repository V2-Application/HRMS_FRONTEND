import React, { useState } from 'react'
import styles from './styles.module.css'

const CardItem = ({ label = '', value = '' }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={styles.card}>
      <span
        className={`${styles.card_label} ${expanded ? styles.expandedLabel : ''}`}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        title={label}
      >
        {label}
      </span>
      <span className={styles.card_value}>{value}</span>
      <div className={styles.card_line} />
    </div>
  )
}

export default CardItem
