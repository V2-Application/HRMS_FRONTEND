import React from 'react'
import { Modal, Descriptions, Card, Row, Col, Typography } from 'antd'

const { Title } = Typography

const SalaryInfoModal = ({ isVisible, onCancel, data }) => {
  if (!data) {
    return null
  }

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace('Ecode', 'ECode')
      .replace('Cca', 'CCA')
      .replace('Da', 'DA')
      .replace('Hra', 'HRA')
      .replace('Pf', 'PF')
      .replace('Esic', 'ESIC')
      .replace('Tds', 'TDS')
      .replace('Id', 'ID')
  }

  const employeeDetails = {
    ecode: data.ecode,
    employee_Name: data.employee_Name,
    location_Name: data.location_Name,
    designation: data.designation,
    department: data.department,
    month_Year: data.month_Year,
    status: data.status,
  }

  const attendanceDetails = {
    ttl_bgt_days: data.ttl_bgt_days,
    actualttl_days: data.actualttl_days,
    machine: data.machine,
    manual: data.manual,
    actualweekly: data.actualweekly,
    presentweeklyoff: data.presentweeklyoff,
    holidayOff: data.holidayOff,
    paybledays: data.paybledays,
    extradays: data.extradays,
    absent: data.absent,
    lwp: data.lwp,
  }

  const actualSalary = {
    basicSalary_Actual_: data.basicSalary_Actual_,
    hrA_Actual_: data.hrA_Actual_,
    ccA_Actual_: data.ccA_Actual_,
    specialAllowance_Actual_: data.specialAllowance_Actual_,
    dA_Actual_: data.dA_Actual_,
    extraDayAllowance: data.extraDayAllowance,
    reimbersment_Actual_: data.reimbersment_Actual_,
    monthly_Gross_CTC_Actual_: data.monthly_Gross_CTC_Actual_,
  }

  const deductions = {
    pF_Employee_: data.pF_Employee_,
    esiC_Employee_: data.esiC_Employee_,
    tds: data.tds,
    pTax: data.pTax,
    loan: data.loan,
    cashShort: data.cashShort,
    dieselDeduction: data.dieselDeduction,
    penality: data.penality,
    lwf: data.lwf,
    totalDeductions: data.totalDeductions,
  }

  const additions = {
    incentive: data.incentive,
    arrear: data.arrear,
    overtime: data.overtime,
    fooding_Allowance: data.fooding_Allowance,
    mobile_Bill: data.mobile_Bill,
  }

  const leaveBalance = {
    opening_EL: data.opening_EL,
    earnedLeaveAcquired: data.earnedLeaveAcquired,
    earnedLeaveUsed: data.earnedLeaveUsed,
    earnedLeaveBalance: data.earnedLeaveBalance,
    opening_CL: data.opening_CL,
    casualLeaveAcquired: data.casualLeaveAcquired,
    casualLeaveUsed: data.casualLeaveUsed,
    casualLeaveBalance: data.casualLeaveBalance,
    opening_CompoOff: data.opening_CompoOff,
    compoOffAcquired: data.compoOffAcquired,
    compoOffUsed: data.compoOffUsed,
    compoOffBalance: data.compoOffBalance,
  }

  const sections = [
    { title: 'Employee Details', data: employeeDetails },
    { title: 'Attendance Details', data: attendanceDetails },
    { title: 'Salary (Actual)', data: actualSalary },
    { title: 'Deductions', data: deductions },
    { title: 'Additions', data: additions },
    { title: 'Leave Balance', data: leaveBalance },
  ]

  const renderDescription = (title, details) => (
    <Card title={<Title level={5}>{title}</Title>} style={{ marginBottom: '16px' }}>
      <Descriptions bordered column={2} size="small">
        {Object.entries(details).map(([key, value]) => (
          <Descriptions.Item label={formatKey(key)} key={key}>
            {value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  )

  return (
    <Modal
      title={`Salary Information for ${data.employee_Name} (${data.ecode})`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {sections.map((section) => (
        <Row gutter={16} key={section.title}>
          <Col span={24}>{renderDescription(section.title, section.data)}</Col>
        </Row>
      ))}
    </Modal>
  )
}

export default SalaryInfoModal
