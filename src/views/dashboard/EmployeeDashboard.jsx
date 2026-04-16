import React from 'react'
import styles from './dashboard.module.css'
import EmpDetailCard from './dashboard-common/EmpDetailsCard/EmpDetailCard'
import { Col, Row } from 'antd'

const EmployeeDashboard = () => {
  return (
    <div className={`${styles.container}`}>
      <Row>
        <Col span={8}>
          <EmpDetailCard />
        </Col>

        <Col span={8}>
          <div className="div">div 2</div>
        </Col>

        <Col span={8}>
          <div className="div">div 3</div>
        </Col>
      </Row>
    </div>
  )
}

export default EmployeeDashboard
