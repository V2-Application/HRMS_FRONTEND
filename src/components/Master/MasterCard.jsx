import React, { useState } from 'react'
import { Card, Typography, Input } from 'antd'
import { EditOutlined } from '@ant-design/icons'

const { Title } = Typography

const MasterCard = ({ name = '' }) => {
  const [updatedName, setUpdatedName] = useState('')
  const [isEditOn, setIsEditOn] = useState(false)

  return (
    <Card
      hoverable
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: '80px',
        position: 'relative',
      }}
      onMouseEnter={() => setIsEditOn(true)}
      onMouseLeave={() => setIsEditOn(false)}
    >
      <Title
        level={4}
        style={{
          fontSize: '0.79rem',
          fontWeight: 600,
          textAlign: 'center',
          opacity: !isEditOn ? 1 : 0,
          transform: !isEditOn ? 'translateY(0)' : 'translateY(5px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {name}
      </Title>

      {/* {isEditOn && (
        <Input
          placeholder="Basic usage"
          // style={{
          //   opacity: isEditOn ? 1 : 0,
          //   transform: isEditOn ? 'translateY(0)' : 'translateY(5px)',
          //   transition: 'opacity 0.3s ease, transform 0.3s ease',
          // }}
        />
      )} */}

      {/* {isEditOn && (
        <EditOutlined
          // style={{
          //   position: 'absolute',
          //   bottom: '8px',
          //   right: '11px',
          //   fontSize: '1.1rem',
          // }}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '11px',
            fontSize: '1.1rem',
            opacity: isEditOn ? 1 : 0,
            transform: isEditOn ? 'translateY(0)' : 'translateY(5px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: isEditOn ? 'auto' : 'none', // Prevent accidental hover/click when hidden
          }}
        />
      )} */}

      <EditOutlined
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '11px',
          fontSize: '1.1rem',
          opacity: isEditOn ? 1 : 0,
          transform: isEditOn ? 'translateY(0)' : 'translateY(5px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: isEditOn ? 'auto' : 'none',
        }}
      />
    </Card>
  )
}

export default MasterCard
