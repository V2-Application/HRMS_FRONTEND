import React, { useState } from 'react'
import { Card, Row, Col, Button } from 'antd'
import { DownOutlined, UpOutlined, UserOutlined } from '@ant-design/icons'

const ManagerEmpLeaveCard = ({
  remarksModalOpen,
  setRemarksModalOpen,
  empName = 'none',
  empCode = 'none',
  empLeaveType = 'none',
  empLeaveStartDate = 'none',
  empLeaveEndDate = 'none',
  leaveDayType = 'Full Day',
  noOfDays = 0,
  reason = 'none',
  remarks = 'none',
  appliedOn = 'none',
  idx,
  requestId,
  setRequestId,
  setActionType,
  setSelectedCandidateId,
  storeCodeName = '',
  setStore,
  setStDate,
  setEdDate,
  locId,
  setLocationId,
}) => {
  const [expanded, setExpanded] = useState(true)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  // console.log('empLeaveStartDate: ', empLeaveStartDate)
  // console.log('empLeaveEndDate: ', empLeaveEndDate)

  // Decide what to display for the "Period" line
  // - If both start and end dates are provided (not "none"), show "start - end"
  // - If only one date is provided, show just that one
  // - Otherwise show a placeholder (like "N/A")
  let periodText = 'N/A'
  const hasStart = empLeaveStartDate
  const hasEnd = empLeaveEndDate
  if (hasStart && hasEnd) {
    if (hasStart === hasEnd) {
      periodText = `${empLeaveStartDate}`
    } else {
      periodText = `${empLeaveStartDate} - ${empLeaveEndDate}`
    }
  } else if (hasStart && !hasEnd) {
    periodText = empLeaveStartDate
  } else if (!hasStart && hasEnd) {
    periodText = empLeaveEndDate
  }

  return (
    <Card
      key={idx}
      style={{
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        boxShadow: '0 0 2px gray',
      }}
    >
      {/* Top row: Employee info + Arrow */}
      <Row align="middle" style={{ cursor: 'pointer' }} onClick={toggleExpand}>
        {/* 1. Employee Info */}
        <Col span={8}>
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <UserOutlined style={{ fontSize: '2.1rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem' }}>{empName}</span>
              <span style={{ fontSize: '0.8rem' }}>{empCode}</span>
            </div>
          </div>
        </Col>

        {/* 2. Leave Type */}
        <Col span={6}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.95rem' }}>Leave Type</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{empLeaveType}</span>
          </div>
        </Col>

        {/* 3. Period */}
        <Col span={8}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem' }}>Period</span>
            <strong style={{ fontSize: '0.85rem' }}>{periodText}</strong>
            <span style={{ fontSize: '0.85rem' }}>{leaveDayType}</span>
          </div>
        </Col>

        {/* 4. Arrow */}
        <Col span={2} style={{ textAlign: 'end' }}>
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </Col>
      </Row>

      {/* Collapsible content with transition */}
      <div
        style={{
          maxHeight: expanded ? '500px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          padding: expanded ? '0 10px' : '0 10px',
        }}
      >
        <hr style={{ margin: '16px 0' }} />

        {/* Second section */}
        <Col>
          {/* <Col xs={24} sm={12} md={8}>
            <strong>No. of days:</strong> {noOfDays}
          </Col> */}

          <Col xs={24} sm={12} md={8}>
            <strong>Reason:</strong> {reason}
          </Col>

          {/* <Col xs={24} sm={12} md={8}>
            <strong>Remarks:</strong> {remarks}
          </Col> */}
        </Col>

        {/* <hr style={{ margin: '16px 0' }} /> */}

        {/* Third section: action buttons */}
        <Row gutter={[4, 4]} justify="space-between">
          <Col>
            <strong>Applied on:</strong> {appliedOn}
          </Col>
          <Row gutter={[16, 16]}>
            <Col>
              <Button
                danger
                onClick={() => {
                  setActionType(2)
                  setRequestId(requestId)
                  setSelectedCandidateId(requestId)
                  setRemarksModalOpen(true)
                }}
              >
                Reject
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={() => {
                  setActionType(1)
                  setRequestId(requestId)
                  setSelectedCandidateId(requestId)
                  setRemarksModalOpen(true)
                  setStore(storeCodeName)
                  setStDate(empLeaveStartDate)
                  setEdDate(empLeaveEndDate)
                  setLocationId(locId)
                }}
              >
                Approve
              </Button>
            </Col>
          </Row>
        </Row>
      </div>
    </Card>
  )
}

export default ManagerEmpLeaveCard
