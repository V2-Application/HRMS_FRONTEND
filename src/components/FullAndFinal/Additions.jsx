import { Alert, Button, Col, DatePicker, Flex, Form, Input, message, Row, Space, Spin } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import BonusCalculationModal from './BonusCalculationModal'
import ELCalculationModal from './ELCalculationModal'
import { getGratuity, submitFNFAddDed } from '../../services/Services'
import axiosInstance from '../../services/axiosInstance'
import axios from 'axios'
import TableUnpaidSalaryData from './TableUnpaidSalaryData'

dayjs.extend(customParseFormat)

/** Simple, dependency-free responsive hook */
const useIsMobile = (query = '(max-width: 768px)') => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    try {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } catch {
      mq.addListener(onChange)
      return () => mq.removeListener(onChange)
    }
  }, [query])
  return isMobile
}

const Additions = ({
  employee,
  employeeDetails,
  fetchFNFEmployees,
  setSelectedEmployee,
  isLoading,
  goToDeductions,
  setAdditionsData,
}) => {
  const isMobile = useIsMobile()
  const [form] = Form.useForm()
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false)
  const [isElModalOpen, setIsELModalOpen] = useState(false)
  const { ecode } = useSelector((state) => state?.auth?.data || {})
  const [totalBonus, setTotalBonus] = useState(0)
  const [totalEL, setTotalEL] = useState(0)
  const [snapshotLoading, setSnapshotLoading] = useState(false)
  const [originalUnpaidSalary, setOriginalUnpaidSalary] = useState(null);
  const [newUnpaidSalary, setNewUnpaidSalary] = useState(null);
  const [payableDaysSnp, setPayableDaysSnp] = useState(null);
  const [isUnpaidRecalculated, setIsUnpaidRecalculated] = useState(false);
  const [salarySnapshotData, setSalarySnapshotData] = useState(null);

  const toMonthStartDayjs = (v) => {
    if (!v) return null
    const d = dayjs.isDayjs(v) ? v : dayjs(v, ['MMM-YY', 'MMM-YYYY', 'YYYY-MM'], true)
    return d.isValid() ? d.startOf('month') : null
  }
  // console.log("dddddddd",employeeDetails);
  // console.log("fffffffffff",employee);
  const toMonthEndDayjs = (v) => {
    if (!v) return null
    const d = dayjs.isDayjs(v) ? v : dayjs(v, ['MMM-YY', 'MMM-YYYY', 'YYYY-MM'], true)
    return d.isValid() ? d.endOf('month') : null
  }

  // DECIMAL VALIDATION (with optional negative)
  const decimalRule = (decimals = null, { allowNegative = false } = {}) => ({
    validator: (_, value) => {
      if (value === undefined || value === null || value === '') return Promise.resolve()
      const str = String(value)

      if (decimals === 0) {
        const re = allowNegative ? /^-?\d+$/ : /^\d+$/
        return re.test(str)
          ? Promise.resolve()
          : Promise.reject(new Error(allowNegative ? 'Integers only (±)' : 'Integers only'))
      }

      const sign = allowNegative ? '-?' : ''
      if (decimals === null) {
        const re = new RegExp(`^(?:${sign}\\d+|${sign}\\d+\\.\\d*|${sign}\\.\\d+)$`)
        return re.test(str) ? Promise.resolve() : Promise.reject(new Error('Enter a valid number'))
      }
      const re = new RegExp(
        `^(?:${sign}\\d+(?:\\.\\d{0,${decimals}})?|${sign}\\.\\d{1,${decimals}})$`,
      )
      return re.test(str)
        ? Promise.resolve()
        : Promise.reject(
          new Error(`Up to ${decimals} decimal places${allowNegative ? ' (±)' : ''}`),
        )
    },
  })

  // INPUT SANITIZER
  const digitsOnly = (field, { decimals = null, allowNegative = false } = {}) => ({
    inputMode: 'decimal',
    pattern: allowNegative ? '^-?[0-9]*\\.?[0-9]*$' : '^[0-9]*\\.?[0-9]*$',
    onChange: (e) => {
      let v = e.target.value || ''
      v = v.replace(/[^\d\.-]/g, '')
      if (allowNegative) {
        const neg = v.startsWith('-') ? '-' : ''
        v = neg + v.replace(/-/g, '')
      } else {
        v = v.replace(/-/g, '')
      }
      const firstDot = v.indexOf('.')
      if (firstDot !== -1) {
        const before = v.slice(0, firstDot + 1)
        let after = v.slice(firstDot + 1).replace(/\./g, '')
        if (typeof decimals === 'number') after = after.slice(0, decimals)
        v = before + after
      }
      form.setFieldsValue({ [field]: v })
    },
  })

  useEffect(() => {
    const today = dayjs()

    if (!employee) {
      form.resetFields()
      form.setFieldsValue({ fnfDate: today })
      return
    }

    form.setFieldsValue({
      rate: employeeDetails?.rate ?? '',
      reasonOfLeaving: employeeDetails?.remarks || '',
      fnfDate: employee.fnfDate ? dayjs(employee.fnfDate) : today,
      dateOfLeaving: employeeDetails?.lastDay
        ? dayjs(employeeDetails?.lastDay)
        : employee?.dateOfLeaving
          ? dayjs(employee.dateOfLeaving)
          : null,

      unpaidSalaryAmount: employeeDetails?.unpaidAmount ?? '',
      unpaidSalaryDays: 0,
      salaryMonth: employeeDetails?.lastPunchMonth
        ? dayjs(employeeDetails.lastPunchMonth, 'MMM-YY', true)
        : null,

      bonus: employeeDetails?.finalBonus ?? '',
      bonusFrom: employeeDetails?.bonusStartMonth
        ? toMonthStartDayjs(employeeDetails.bonusStartMonth)
        : null,
      bonusTo: employeeDetails?.bonusEndMonth
        ? toMonthEndDayjs(employeeDetails.bonusEndMonth)
        : null,

      gratuity: employeeDetails?.gratuityAmount ?? '',
      // elDays: employeeDetails?.earnedLeaveDays ?? '',
      // elAmount: employeeDetails?.earnedLeaveAmount ?? '',

      noticeSalary: '',
      otherAddition1: '',
      otherAddition2: '',
      otherAddition3: '',
      otherAddition4: '',
      otherAddition1Against: '',
      otherAddition2Against: '',
      otherAddition3Against: '',
      otherAddition4Against: '',
    })
  }, [employee, employeeDetails, form])

  // reflect computed totals
  useEffect(() => {
    if (totalBonus !== undefined && totalBonus !== null) {
      form.setFieldsValue({ bonus: Number(totalBonus) })
    }
  }, [totalBonus, form])

  useEffect(() => {
    if (totalEL !== undefined && totalEL !== null) {
      form.setFieldsValue({ elAmount: Number(totalEL) })
    }
  }, [totalEL, form])

  // ✅ send live values to parent for Deductions calc
  const watched = Form.useWatch([], form)
  useEffect(() => {
    if (!setAdditionsData) return
    const v = form.getFieldsValue(true)

    setAdditionsData({
      unpaidSalaryAmount: Number(v?.unpaidSalaryAmount || 0),
      bonus: Number(v?.bonus || 0),
      gratuity: Number(v?.gratuity || 0),
      noticeSalary: Number(v?.noticeSalary || 0),
      elAmount: Number(v?.elAmount || 0),

      // OPTIONAL: if later you want to include these in calc, they are here
      otherAddition1: Number(v?.otherAddition1 || 0),
      otherAddition2: Number(v?.otherAddition2 || 0),
      otherAddition3: Number(v?.otherAddition3 || 0),
      otherAddition4: Number(v?.otherAddition4 || 0),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched])

  const fetchGratuity = async () => {
    if (!employee?.employeeId) {
      message.warning('Select employee first')
      return
    }
    const response = await getGratuity(employee?.employeeId)
    if (response?.status === 200) {
      form.setFieldsValue({
        gratuity: String(response?.data?.data?.Gratuity ?? response?.data?.data?.gratuity ?? 0),
      })
      form.validateFields(['gratuity'])
    } else {
      message.error(response?.response?.data?.message || 'Error in getting gratuity')
    }
  }

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      employeeId: Number(employee?.employeeId),
      user: ecode,
      fnfDate: values?.fnfDate ? dayjs(values?.fnfDate).format('YYYY-MM-DD') : null,
      dateOfLeaving: values?.dateOfLeaving
        ? dayjs(values?.dateOfLeaving).format('YYYY-MM-DD')
        : null,

      unpaidSalaryAmount: values?.unpaidSalaryAmount ? Number(values?.unpaidSalaryAmount) : 0,
      rate: values?.rate ? Number(values?.rate) : 0,
      days: values?.unpaidSalaryDays ? Number(values?.unpaidSalaryDays) : 0,
      salaryMonth: values?.salaryMonth,

      bonus: values?.bonus ? Number(values?.bonus) : 0,
      bonusPeriodFrom: values?.bonusFrom ? dayjs(values?.bonusFrom).format('YYYY-MM-DD') : null,
      bonusPeriodTill: values?.bonusTo ? dayjs(values?.bonusTo).format('YYYY-MM-DD') : null,

      gratuity: values?.gratuity ? Number(values?.gratuity) : 0,
      e_LeaveAmount: values?.elAmount ? Number(values?.elAmount) : 0,
      elDays: values?.elDays ? Number(values?.elDays) : 0,

      noticeSalary: values?.noticeSalary ? Number(values?.noticeSalary) : 0,
      calculatedAs: values?.calculatedAs,

      otherAddition1: values?.otherAddition1 ? Number(values?.otherAddition1) : 0,
      otherAddition2: values?.otherAddition2 ? Number(values?.otherAddition2) : 0,
      otherAddition3: values?.otherAddition3 ? Number(values?.otherAddition3) : 0,
      otherAddition4: values?.otherAddition4 ? Number(values?.otherAddition4) : 0,
    }

    const response = await submitFNFAddDed(payload)

    if (response?.status === 200) {
      message.success(response?.data?.message || 'FNF saved')
      form.resetFields()
      fetchFNFEmployees()
      setSelectedEmployee(null)
    } else {
      message.error(response?.response?.data?.message || 'Error in submitting FNF')
    }
  }

  function getMonthYear(date) {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${month}-${year}`;
  }

  async function fetchAttendanceSnapshot() {
    try {
      setIsUnpaidRecalculated(false);
      setSnapshotLoading(true)

      const _ecode = employeeDetails?.ecode
      const _month = getMonthYear(form.getFieldValue('dateOfLeaving')?.$d)
      console.log(typeof _month)
      if (!_ecode) {
        message.error('Ecode not found.')
        setSnapshotLoading(false)
        return
      }
      if (!_month) {
        message.error('Day of leaving not found.')
        setSnapshotLoading(false)
        return
      }
      const salaryRecalculateRes = await axiosInstance.post("/api/SalaryRecalculate/recalculate-new", {
        eCodes: _ecode,
        month: _month
      });
      console.log(salaryRecalculateRes);
      const res = await axiosInstance.get(
        `/api/EmpAttendanceViewSnapshot/EmployeeSalarySnapShotByEcode?ecode=${_ecode}&month=${_month}`,
      );
      if (res?.data && res?.data?.data && Array.isArray(res?.data?.data) && res?.data?.data[0]) {
        console.log(res?.data?.data[0]);
        setSalarySnapshotData(res?.data?.data);
        const {
          Monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_: _newUnpaidSalary,
          paybledays: payableDays,
          EarnedLeaveBalance: elDays,
          BasicSalary_Bud_: basicSalary
        } = res.data.data[0];
        setPayableDaysSnp(payableDays);
        console.log(newUnpaidSalary, payableDays)
        setNewUnpaidSalary(_newUnpaidSalary);
        if (!_newUnpaidSalary || !payableDays) {
          message.error('New data not found.')
          setSnapshotLoading(false)
          return
        }
        const _unpaidSalaryAmount = Number(form.getFieldValue('unpaidSalaryAmount')) || 0
        if (originalUnpaidSalary === null) setOriginalUnpaidSalary(form.getFieldValue(_unpaidSalaryAmount));
        const _newUnpaidSalaryAmount = Number(_newUnpaidSalary) || 0;
        const _newTotalSalary = (originalUnpaidSalary || 0) + _newUnpaidSalaryAmount
        const _newElAmount = Math.floor((basicSalary/30)*elDays);
        form.setFieldValue('unpaidSalaryAmount', _newTotalSalary);
        form.setFieldValue('unpaidSalaryDays', payableDays);
        form.setFieldValue("elDays", elDays);
        form.setFieldValue("elAmount", _newElAmount || 0);
        setIsUnpaidRecalculated(true);
      }
      setSnapshotLoading(false)
    } catch (error) {
      console.log(error)
      message.error("Failed to fetch data.")
      setSnapshotLoading(false)
    }
  }

  return (
    <>
      <BonusCalculationModal
        open={isBonusModalOpen}
        setOpen={setIsBonusModalOpen}
        employee={employee}
        totalBonus={totalBonus}
        setTotalBonus={setTotalBonus}
      />
      <ELCalculationModal
        open={isElModalOpen}
        setOpen={setIsELModalOpen}
        employee={employee}
        totalEL={totalEL}
        setTotalEL={setTotalEL}
      />

      {isLoading ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin />
        </div>
      ) : (
        <div style={{ paddingInline: '1rem', paddingBottom: isMobile ? 12 : 20 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            size={isMobile ? 'middle' : 'large'}
            style={{ width: '100%' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Full & Final Date" name="fnfDate">
                  <DatePicker style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Date of Leaving" name="dateOfLeaving">
                  <DatePicker style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item label="Rate/Day" name="rate" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('rate', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Form.Item label="Salary Month" name="salaryMonth">
                  <DatePicker picker="month" style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Bonus" name="bonus" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('bonus', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item label="From" name="bonusFrom">
                  <DatePicker style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item label="To" name="bonusTo">
                  <DatePicker style={{ width: '100%' }} disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Gratuity" name="gratuity" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('gratuity', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Calculated As" name="calculatedAs" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('calculatedAs', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="EL Amount" name="elAmount" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('elAmount', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="EL Days" name="elDays" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('elDays', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>
            </Row>

            {/* Notice Salary */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10} lg={8}>
                <Form.Item
                  label="Notice Salary (+/-)"
                  name="noticeSalary"
                  rules={[decimalRule(2, { allowNegative: true })]}
                >
                  <Input {...digitsOnly('noticeSalary', { decimals: 2, allowNegative: true })} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={12}>
                <Flex align='end' >
                  <Form.Item
                    label="Unpaid Salary Amount"
                    name="unpaidSalaryAmount"
                    rules={[decimalRule(2)]}
                    style={{ flex: "1" }}
                  >
                    <Input {...digitsOnly('unpaidSalaryAmount', { decimals: 2 })} readOnly />
                  </Form.Item>
                  <Button
                    loading={snapshotLoading}
                    disabled={snapshotLoading}
                    onClick={fetchAttendanceSnapshot}
                    variant="outlined"
                    color="primary"
                    style={
                      { marginBottom: "1rem" }
                    }
                  >
                    Recalculate
                  </Button>
                </Flex>

              </Col>
              <Col xs={24} sm={12} md={12}>
                <Form.Item label="Present Days" name="unpaidSalaryDays" rules={[decimalRule(2)]}>
                  <Input {...digitsOnly('unpaidSalaryDays', { decimals: 2 })} readOnly />
                </Form.Item>
              </Col>

              <Col span={24}>
                {
                  isUnpaidRecalculated
                  &&
                  <TableUnpaidSalaryData data={salarySnapshotData} />
                  // <Alert description={
                  // <>
                  // <h6 style={{fontWeight: 'bold'}}>Unpaid Salary Updated</h6>
                  // <p style={{marginBottom: '0.5rem'}}><strong>Previous Unpaid:</strong> {originalUnpaidSalary || 0}</p>
                  // <p style={{marginBottom: '0.5rem'}}><strong>New Unpaid:</strong> {newUnpaidSalary || 0} for <strong>Days:</strong> {payableDaysSnp}</p>
                  // <p style={{marginBottom: '0'}}><strong>Total Unpaid:</strong> {originalUnpaidSalary || 0} + {newUnpaidSalary} = {form.getFieldValue("unpaidSalaryAmount")} </p>
                  // </>
                  // } type="warning" />
                }
              </Col>
            </Row>

            <Form.Item label="Reason of Leaving" name="reasonOfLeaving">
              <Input placeholder="Leaving Reason" readOnly />
            </Form.Item>

            {/* Other Additions + Against */}
            <Row gutter={[16, 16]}>
              {/* Left: amounts */}
              <Col xs={24} md={10} lg={8} style={{ paddingTop: `${!isMobile ? '2.25rem' : '0'}` }}>
                <Form.Item
                  label="Other Addition 1"
                  name="otherAddition1"
                  rules={[decimalRule(2)]}
                  layout="horizontal"
                >
                  <Input {...digitsOnly('otherAddition1', { decimals: 2 })} />
                </Form.Item>

                <Form.Item
                  label="Other Addition 2"
                  name="otherAddition2"
                  rules={[decimalRule(2)]}
                  layout="horizontal"
                >
                  <Input {...digitsOnly('otherAddition2', { decimals: 2 })} />
                </Form.Item>

                <Form.Item
                  label="Other Addition 3"
                  name="otherAddition3"
                  rules={[decimalRule(2)]}
                  layout="horizontal"
                >
                  <Input {...digitsOnly('otherAddition3', { decimals: 2 })} />
                </Form.Item>

                <Form.Item
                  label="Other Addition 4"
                  name="otherAddition4"
                  rules={[decimalRule(2)]}
                  layout="horizontal"
                >
                  <Input {...digitsOnly('otherAddition4', { decimals: 2 })} />
                </Form.Item>
              </Col>

              {/* Right: against */}
              <Col xs={24} md={14} lg={16}>
                <div style={{ fontWeight: 600, padding: '6px 0 8px' }}>Against</div>

                <Form.Item name="otherAddition1Against">
                  <Input placeholder="Against (Other Addition 1)" />
                </Form.Item>

                <Form.Item name="otherAddition2Against">
                  <Input placeholder="Against (Other Addition 2)" />
                </Form.Item>

                <Form.Item name="otherAddition3Against">
                  <Input placeholder="Against (Other Addition 3)" />
                </Form.Item>

                <Form.Item name="otherAddition4Against">
                  <Input placeholder="Against (Other Addition 4)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Next */}
            <Form.Item>
              <Row justify="end">
                <Col xs={24} sm="auto">
                  <Button
                    type="primary"
                    disabled={!employee}
                    block={isMobile}
                    onClick={async () => {
                      try {
                        await form.validateFields()
                        goToDeductions?.()
                      } catch (e) { }
                    }}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  )
}

export default Additions
