import React from 'react'
import { Card, Typography } from 'antd'

const { Title, Text } = Typography

const EmployeeLeaveCard = ({
  leaveType = '',
  currentBalance = 0,
  acquiredThisYear = 0,
  creditedFromLastYear = 0,
  utilizedThisYear = 0,
  annualAllotment = 0,
}) => {
  const styles = {
    tags: {
      fontWeight: '750',
      fontSize: '0.75rem',
      fontStyle: 'italic',
      color: 'rgb(88 79 79 / 80%)',
    },
  }
  return (
    <Card hoverable style={{ /* width: 300, */ margin: '0 auto', padding: '4px 8px' }}>
      <Title level={4} style={{ marginBottom: 0, fontSize: '14px' }}>
        {leaveType}
      </Title>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentBalance}</Text>
        <Text type="secondary">Currently Available</Text>
      </div>

      <hr />

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{acquiredThisYear}</span>
          <span style={styles.tags}>Acquired so far this year</span>
        </div>
        {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{creditedFromLastYear}</span>
          <span style={styles.tags}>Credited from last year</span>
        </div> */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{utilizedThisYear}</span>
          <span style={styles.tags}>Utilized so far this year</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'right',
          }}
        >
          <span>{annualAllotment}</span>
          <span style={styles.tags}>Monthly Allotment</span>
        </div>
      </div>
    </Card>
  )
}

export default EmployeeLeaveCard
