import { Button, Col, DatePicker, Input, message, Row, Select, Space, Spin } from 'antd'
import {
  CONTRACT_END_DATE,
  // CONTRACTOR_NAME,
  DATE_OF_JOINING,
  DEPARTMENT,
  DESIGNATION,
  ECODE,
  employeementDetailsRequiredFields,
  ESIC_APPLICABLE,
  NATURE_OF_JOB,
  PF_APPLICABLE,
  SHIFT_DETAILS,
  WORK_LOCATION,
} from '../../constants'
import { useEffect, useRef, useState } from 'react'
import {
  GetAllShifts,
  getDepartments,
  getDesignationByDepartment,
  getDropdownLocDesDep,
  getNatureOfWorkList,
} from '../../../services/Services'
import { getApiError } from '../../helpers'

const EmployeementDetails = ({
  form,
  Form,
  isActive,
  onPrev,
  employeeId,
  isForUpdate,
  vcode,
  ecode,
  onNext,
  checkIfEcodeExists,
  watch_ecode,
}) => {
  const deptId = Form.useWatch(DEPARTMENT, form)
  const skipClearOnceRef = useRef(true)

  const firstRef = useRef(null)

  const [departments, setDepartments] = useState([])
  const [isDeptLoading, setIsDeptLoading] = useState(false)

  const [designations, setDesignations] = useState([])
  const [isDesgLoading, setIsDesgLoading] = useState(false)

  const [locations, setLocations] = useState([])
  const [isLocLoading, setIsLocLoading] = useState(false)

  const [workNatureList, setWorkNatureList] = useState([])
  const [isWorkNatureLoading, setIsWorkNatureLoading] = useState(false)

  const [shifts, setShifts] = useState([])
  const [isShiftLoading, setIsShiftLoading] = useState(false)

  const isRequired = (name) => employeementDetailsRequiredFields.includes(name)
  const reqRule = (name, msg) => (isRequired(name) ? [{ required: true, message: msg }] : [])

  const handleBlur = async (e, name) => {
    const v = e.target.value
    const t = v.trim()

    if (name === ECODE) {
      if (watch_ecode !== '') {
        const shouldBlock = await checkIfEcodeExists()
        if (shouldBlock) return
      }
    }

    if (t !== v) {
      form.setFieldsValue({ [name]: t })
    }
  }

  const fetchDepartments = async () => {
    try {
      setIsDeptLoading(true)

      const response = await getDepartments()

      if (response.status === 200) {
        const data = response.data?.data || []
        setDepartments(data)
        setDesignations([])
      }
    } catch (error) {
      const errMsg = getApiError(error, 'Error fetching departments')
      message.error(errMsg)
    } finally {
      setIsDeptLoading(false)
    }
  }

  const fetchDesignations = async (deptId) => {
    try {
      setIsDesgLoading(true)

      const response = await getDesignationByDepartment(deptId)

      if (response.status === 200) {
        const data = response.data?.data || []
        setDesignations(data)

        const existing = form.getFieldValue(DESIGNATION)
        if (existing) form.setFieldsValue({ [DESIGNATION]: existing })
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Error fetching departments'
      message.error(errMsg)
    } finally {
      setIsDesgLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      setIsLocLoading(true)

      const response = await getDropdownLocDesDep('location')

      if (response.status) {
        const data = response?.data?.Location || []
        setLocations(data)
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Error fetching locations'
      message.error(errMsg)
    } finally {
      setIsLocLoading(false)
    }
  }

  const fetchWorkNature = async () => {
    try {
      setIsWorkNatureLoading(true)

      const response = await getNatureOfWorkList()

      if (response.status === 200) {
        const data = response.data?.data || []
        setWorkNatureList(data)
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Error fetching work nature list'
      message.error(errMsg)
    } finally {
      setIsWorkNatureLoading(false)
    }
  }

  const fetchShifts = async () => {
    try {
      setIsShiftLoading(true)

      const response = await GetAllShifts()

      if (response.status === 200) {
        const data = response.data?.data || []
        const formattedData = Array.isArray(data)
          ? data.map((dt) => {
              const value = dt.shiftID
              const label = `${dt.shiftName || ''} - ${dt.startTime || ''} - ${dt.endTime || ''}`

              return { value, label }
            })
          : []

        setShifts(formattedData)
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Error fetching shifts'
      message.error(errMsg)
    } finally {
      setIsShiftLoading(false)
    }
  }

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        firstRef.current?.focus?.()
      }, 0)
    }
  }, [isActive])

  useEffect(() => {
    fetchDepartments()
    fetchLocations()
    fetchWorkNature()
    fetchShifts()
  }, [])

  useEffect(() => {
    if (skipClearOnceRef.current) {
      skipClearOnceRef.current = false
      if (deptId) fetchDesignations(deptId)
      return
    }

    // form.setFieldsValue({ [DESIGNATION]: undefined })
    // setDesignations([])

    if (deptId) fetchDesignations(deptId)
  }, [deptId, ecode, vcode])

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Form.Item label="Emp Code" name={ECODE}>
          <Input
            ref={firstRef}
            placeholder="Enter emp code"
            onBlur={(e) => handleBlur(e, ECODE)}
            disabled={isForUpdate}
          />
        </Form.Item>
      </Col>

      {/*<Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contractor Name"
          name={CONTRACTOR_NAME}
          rules={[...reqRule(CONTRACTOR_NAME, 'Contractor name is required')]}
        >
          <Input
            placeholder="Enter contractor name"
            onBlur={(e) => handleBlur(e, CONTRACTOR_NAME)}
          />
        </Form.Item>
      </Col>*/}

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Work Location"
          name={WORK_LOCATION}
          rules={[...reqRule(WORK_LOCATION, 'Work Location is required')]}
        >
          <Select
            showSearch
            allowClear
            optionFilterProp="children"
            placeholder="Select location"
            loading={isLocLoading}
          >
            {locations.map((loc) => (
              <Select.Option value={loc.locationId} key={loc.locationId}>
                {loc.locationName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Department"
          name={DEPARTMENT}
          rules={[...reqRule(DEPARTMENT, 'Department is required')]}
        >
          <Select
            showSearch
            allowClear
            optionFilterProp="children"
            placeholder="Select department"
            loading={isDeptLoading}
          >
            <Select.Option>Select department</Select.Option>
            {departments.map((dept) => (
              <Select.Option value={dept.departmentId}>{dept.departmentName}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Designation"
          name={DESIGNATION}
          rules={[...reqRule(DESIGNATION, 'Designation is required')]}
        >
          <Select
            showSearch
            allowClear
            optionFilterProp="children"
            placeholder="Select designation"
            // disabled={!deptId}
            loading={isDeptLoading || isDesgLoading}
          >
            {isDesgLoading ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Spin />
              </div>
            ) : (
              <>
                <Select.Option>Select designation</Select.Option>
                {designations.map((desg) => (
                  <Select.Option value={desg.designationId}>{desg.designationName}</Select.Option>
                ))}
              </>
            )}
          </Select>
        </Form.Item>
      </Col>

      {/* <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Nature Of Job"
          name={NATURE_OF_JOB}
          rules={[...reqRule(NATURE_OF_JOB, 'Nature of Job is required')]}
        >
          <Select
            placeholder="Select job nature"
            allowClear
            showSearch
            optionFilterProp="children"
            loading={isWorkNatureLoading}
          >
            {workNatureList.map((item) => (
              <Select key={item.natureOfWorkId} value={item.natureOfWorkId}>
                {item.workName || ''}
              </Select>
            ))}
          </Select>
        </Form.Item>
      </Col> */}

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Date of Joining"
          name={DATE_OF_JOINING}
          rules={[...reqRule(DATE_OF_JOINING, 'Date of Joining is required')]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contract End Date"
          name={CONTRACT_END_DATE}
          rules={[
            ...reqRule(CONTRACT_END_DATE, 'Contract End Date is required'),
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue(DATE_OF_JOINING)

                if (!start || !value) return Promise.resolve()

                if (value.isBefore(start, 'day')) {
                  return Promise.reject(
                    new Error('End date must be greater than or equal to joining date'),
                  )
                }

                return Promise.resolve()
              },
            }),
          ]}
          dependencies={[DATE_OF_JOINING]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Shift"
          name={SHIFT_DETAILS}
          rules={[...reqRule(SHIFT_DETAILS, 'Shift is required')]}
        >
          <Select
            placeholder="Select Shift"
            allowClear
            showSearch
            optionFilterProp="children"
            loading={isShiftLoading}
          >
            {shifts.map((s) => (
              <Select.Option key={s.value} value={s.value}>
                {s.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item label="PF Applicable" name={PF_APPLICABLE}>
          <Select>
            <Select.Option value={true}>Yes</Select.Option>
            <Select.Option value={false}>No</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item label="ESIC Applicable" name={ESIC_APPLICABLE}>
          <Select>
            <Select.Option value={true}>Yes</Select.Option>
            <Select.Option value={false}>No</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      {/* <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button onClick={onPrev} type="primary">
          Previous
        </Button>
        <Button type="default" htmlType="submit">
          {isForUpdate ? 'Update' : 'Submit'}
        </Button>
      </Space> */}

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button type="primary" onClick={onNext}>
          Next
        </Button>
      </Space>
    </Row>
  )
}

export default EmployeementDetails
