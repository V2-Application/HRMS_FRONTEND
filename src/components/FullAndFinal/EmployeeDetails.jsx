import React from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Card, Select, Space, Grid, Spin } from 'antd'

const { Option } = Select

const EmployeeDetails = ({ employees = [], selected, onSelect, isLoading }) => {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md // md and up = desktop/tablet; below md = mobile

  return (
    <div>
      <Card
        title={titleData({ employees, selected, onSelect, isMobile, isLoading })}
        variant="borderless"
      >
        {cardData(selected, isMobile)}
      </Card>
    </div>
  )
}

export default EmployeeDetails

const titleData = ({ employees = [], selected, onSelect, isMobile, isLoading }) => {
  return (
    <Space style={{ width: '100%', justifyContent: isMobile ? 'stretch' : 'flex-start' }}>
      <div style={{ width: isMobile ? '100%' : '20rem' }}>
        <Select
          placeholder="Select employee"
          showSearch
          optionFilterProp="label"
          value={selected?.employeeId}
          onChange={onSelect}
          style={{ width: '100%' }}
          allowClear
        >
          {isLoading ? (
            <Option key={'loading'} value="loading" disabled>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Spin style={{ alignSelf: 'center' }} />
              </div>
            </Option>
          ) : (
            employees?.map((emp) => (
              <Option
                key={emp.employeeId}
                value={emp.employeeId}
                label={`${emp.name} (${emp.employeeCode})`}
              >
                {emp.name} — {emp.employeeCode}
              </Option>
            ))
          )}
        </Select>
      </div>
      {/* <Button type="primary">Add</Button> */}
    </Space>
  )
}

const cardData = (emp = {}, isMobile) => {
  const styles = {
    wrapper: {
      display: 'flex',
      gap: isMobile ? '1rem' : '2rem',
      width: '100%',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
    },
    iconWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: isMobile ? '3.5rem' : 'auto',
    },
    grid: {
      display: 'grid',
      gap: '0.75rem 1rem',
      flex: 1,
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(180px, 1fr))',
    },
    cell: {
      minWidth: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }

  console.log('card data:', emp)

  const doj = emp?.dateOfJoining ? String(emp.dateOfJoining).split('T')[0] : '-'
  const dol = emp?.dateOfLeaving ? String(emp.dateOfLeaving).split('T')[0] : '-'

  return (
    <div style={styles.wrapper}>
      <div style={styles.iconWrap}>
        <UserOutlined style={{ fontSize: '3.5rem' }} />
      </div>

      <div style={styles.grid}>
        {/* Name */}
        <div style={styles.cell}>
          <b>Name:</b> {emp?.name || '-'}
        </div>
        {/* Department */}
        <div style={styles.cell}>
          <b>Department:</b> {emp?.department || '-'}
        </div>
        {/* Date of Joining */}
        <div style={styles.cell}>
          <b>Date of Joining:</b> {doj}
        </div>

        {/* Code */}
        <div style={styles.cell}>
          <b>Code:</b> {emp?.employeeCode || '-'}
        </div>
        {/* Designation */}
        <div style={styles.cell}>
          <b>Designation:</b> {emp?.designation || '-'}
        </div>
        {/* Date of Leaving */}
        <div style={styles.cell}>
          <b>Date of Leaving:</b> {dol}
        </div>
      </div>
    </div>
  )
}
