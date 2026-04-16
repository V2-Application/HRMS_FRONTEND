import { StarFilled, StarOutlined } from '@ant-design/icons'
import React from 'react'

const StarRating = ({ value = 0, onChange }) => {
  return (
    <React.Fragment>
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < value
        return isFilled ? (
          <StarFilled
            key={index}
            style={{ color: 'gold', cursor: 'pointer' }}
            onClick={() => onChange(value === index + 1 ? value - 1 : index + 1)}
          />
        ) : (
          <StarOutlined
            key={index}
            star={{ cursor: 'pointer' }}
            onClick={() => onChange(value === index + 1 ? value - 1 : index + 1)}
          />
        )
      })}
    </React.Fragment>
  )
}

export default StarRating
