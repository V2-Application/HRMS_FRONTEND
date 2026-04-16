import React, { useEffect, useState } from 'react'
import {
  Modal,
  Button,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Tabs,
  Select,
  Table,
  message,
} from 'antd'
import OfferLetterTemplate from '../../views/widgets/OfferLetterTemplate'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { fetchMinWages, searchEmployeeDropdown } from '../../services/Services'
import { useWatch } from 'antd/es/form/Form'

const OfferLetterModal = ({
  offerLetterModel,
  setofferLetterModel,
  defaultModelData,
  setofferLetterModels,
  ApplicationListData,
  ...props
}) => {
  const [form] = Form.useForm()

  const [offerDataa, setOfferDataa] = useState(null)
  const [loading, setloading] = useState(false)
  const [showTemplate, setshowTemplate] = useState(false)

  const { Designation, Location, Department } = useSelector(
    (state) => state.dropdown.response || {},
  )

  const [viewSalaryBreakup, setviewSalaryBreakup] = useState([])
  const [salarydata, setsalarydata] = useState({})

  // Employee search (API unchanged)
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])

  // Min wages
  const [minWagesStates, setMinWagesStates] = useState([])
  const [minWageForState, setMinWageForState] = useState(null)

  // Watches
  const watchSalaryRaw = useWatch('salary', form)
  const watch_salary_pm = watchSalaryRaw ? parseInt(watchSalaryRaw, 10) / 12 : 0
  const watch_state = useWatch('state', form)
  const watch_office_type = useWatch('officeType', form)
  const watch_bonus_applicable = useWatch('bonusApplicable', form)

  const fetchStates = async () => {
    try {
      const response = await fetchMinWages()
      if (response?.status === 200) {
        const data = response?.data?.data || []
        setMinWagesStates(data)
      }
    } catch (error) {
      console.error('minwages error:', error)
      message.error(error?.response?.data?.message || 'Error getting min wage states')
    }
  }

  useEffect(() => {
    fetchStates()
  }, [])

  // Min wage record for selected state (only if salary <= 30k PM)
  useEffect(() => {
    if (!minWagesStates.length || !watch_state || watch_salary_pm > 30000) {
      setMinWageForState(null)
      return
    }

    const stateIdNumber = Number(watch_state)
    const match = minWagesStates.find((dt) => Number(dt.stateId ?? dt.id) === stateIdNumber) || null
    setMinWageForState(match)
  }, [watch_state, watch_salary_pm, minWagesStates])

  // Reset office address on office type change
  useEffect(() => {
    form.setFieldsValue({ officeAddress: '' })
  }, [watch_office_type, form])

  // ✅ PREFILL Salary annual = monthlyGrossCTC * 12
  // ✅ Bonus Applicable from API
  // ✅ Department/Designation prefill works using Number conversion
  useEffect(() => {
    if (!offerLetterModel) {
      form.resetFields()
      setOfferDataa(null)
      return
    }

    const currentPosition = Designation?.find(
      (des) => des?.designationId === Number(defaultModelData?.designation),
    )

    // ✅ Monthly Gross CTC from API response (defaultModelData)
    const monthlyGrossCTC = Number(
      defaultModelData?.monthlyGrossCTC ??
        defaultModelData?.monthlyGrossCtc ??
        defaultModelData?.grossSalaryMonthly ??
        defaultModelData?.grossSalary ??
        0,
    )

    // ✅ Annual salary shown in Salary (per annum) input
    const annualSalary = monthlyGrossCTC ? Math.round(monthlyGrossCTC * 12) : undefined

    // ✅ Bonus Applicable from API boolean
    const apiBonusApplicableRaw =
      defaultModelData?.bonusApplicable ??
      defaultModelData?.isBonusApplicable ??
      defaultModelData?.bonus_applicable

    const apiBonusApplicable =
      typeof apiBonusApplicableRaw === 'boolean'
        ? apiBonusApplicableRaw
        : apiBonusApplicableRaw === 1 || apiBonusApplicableRaw === '1'
          ? true
          : apiBonusApplicableRaw === 0 || apiBonusApplicableRaw === '0'
            ? false
            : undefined

    // ✅ IMPORTANT FIX: Department is coming as string from API ("36")
    // AntD Select options use number, so we must set number.
    const deptId = defaultModelData?.department ? Number(defaultModelData.department) : undefined

    form.setFieldsValue({
      candidateName: defaultModelData?.firstName,
      position: currentPosition ? currentPosition?.designationId : undefined,

      // ❌ Preferred State field commented (as requested)
      // state: defaultModelData?.stateId ? Number(defaultModelData.stateId) : undefined,

      email: defaultModelData?.email,
      currentLocation: defaultModelData?.currentLocation,

      // ✅ salary prefill (annual)
      salary: annualSalary,

      // ✅ bonus prefill
      bonusApplicable: apiBonusApplicable,

      joiningDate: defaultModelData?.joiningDate ? dayjs(defaultModelData.joiningDate) : undefined,

      // ✅ department prefill (number)
      department: deptId,
    })

    if (annualSalary) {
      handleCTCChange(annualSalary)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerLetterModel, defaultModelData, Designation])

  // keep breakup synced when salary/state/bonus changes
  useEffect(() => {
    if (offerLetterModel && watchSalaryRaw) {
      handleCTCChange(watchSalaryRaw)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSalaryRaw, watch_state, watch_bonus_applicable, minWageForState, offerLetterModel])

  // Debounced employee search (API unchanged)
  useEffect(() => {
    if (searchText.length < 2) {
      setEmployees([])
      setsearchLoading(false)
      return
    }

    setsearchLoading(true)
    const debounceTimer = setTimeout(() => {
      ;(async () => {
        try {
          const res = await searchEmployeeDropdown(searchText)
          setEmployees(res?.data?.employees || [])
        } catch (error) {
          console.error('Error fetching employees:', error)
          setEmployees([])
        } finally {
          setsearchLoading(false)
        }
      })()
    }, 800)

    return () => clearTimeout(debounceTimer)
  }, [searchText])

  useEffect(() => {
    setshowTemplate(!!offerDataa)
  }, [offerDataa])

  const salaryFields = [
    { name: 'grossSalary', label: 'Gross Salary' },
    { name: 'basicPay', label: 'Basic Pay' },
    { name: 'hra', label: 'House Rent Allowances' },
    { name: 'specialAllowances', label: 'Special Allowances' },
    { name: 'epf', label: 'EPF' },
    { name: 'esic', label: 'ESIC' },
    { name: 'bonus', label: 'BONUS/Ex-Gratia' },
    { name: 'gratuity', label: 'Gratuity as per Act*' },
    { name: 'grossBenefits', label: 'Gross Benefits' },
    { name: 'cost_to_company', label: 'Gross CTC' },
  ]

  const keyMatching = {
    basicPay: 'Basic Pay',
    hra: 'House Rent Allowances',
    specialAllowances: 'Special Allowances',
    grossSalary: 'Gross Salary',
    epf: 'EPF',
    esic: 'ESIC',
    bonus: 'BONUS/Ex-Gratia',
    gratuity: 'Gratuity as per Act*',
    grossBenefits: 'Gross benefits',
    cost_to_company: 'CTC',
  }

  const columns = [
    { title: 'Particulars', dataIndex: 'particulars', key: 'particulars' },
    { title: 'Amount (P.M)', dataIndex: 'amountPM', key: 'amountPM' },
    { title: 'Amount (P.A)', dataIndex: 'amountPA', key: 'amountPA' },
  ]

  const findValueByid = async (type, vall) => {
    const id = vall == null ? null : Number(vall)
    let val = null

    if (type === 'Department') {
      const dep = Department?.find((d) => Number(d.departmentId) === id)
      val = dep ? dep.departmentName : null
    } else if (type === 'Location') {
      const loc = Location?.find((l) => Number(l.locationId) === id)
      val = loc ? loc.locationName : null
    } else if (type === 'Designation') {
      const des = Designation?.find((d) => Number(d.designationId) === id)
      val = des ? des.designationName : null
    } else {
      val = 'Invalid Type'
    }

    return val
  }

  const handleFinish = async (values) => {
    const perMonthGrossForValidation =
      values.salary && !Number.isNaN(Number(values.salary)) ? Number(values.salary) / 12 : 0

    // ✅ state validation is not needed if Preferred State removed
    // If you keep state later, you can re-enable this check.

    setloading(true)

    // ✅ Department name mapping for template (this is the main ask)
    const departmentName = await findValueByid('Department', values.department)

    const formattedValues = {
      ...values,

      // ✅ Template uses boolean
      isBonusApplicable: values?.bonusApplicable === true,

      // ✅ send department name (not id)
      department: departmentName,

      position: await findValueByid('Designation', values.position),

      joiningDate: values.joiningDate.format('MMMM D, YYYY'),
      offerDate: values.offerDate.format('MMMM D, YYYY'),

      salary: values.salary,
      id: defaultModelData?.id,

      salaryDetails: {
        ...salaryFields.reduce((acc, field) => {
          acc[field.name] = salarydata[field.name]
          return acc
        }, {}),
        salary: values.salary,
      },
    }

    setTimeout(() => {
      setOfferDataa(formattedValues)
      setloading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setofferLetterModel(false)
    setOfferDataa(null)
  }

  const handleCTCChange = (val) => {
    const raw = val == null ? '' : String(val)
    const ctcValue = Number(raw.replace(/[^0-9.]/g, ''))

    if (!ctcValue || Number.isNaN(ctcValue)) {
      setsalarydata({})
      setviewSalaryBreakup([])
      return
    }

    const grossSalaryPerYear = ctcValue
    const perMonthGross = grossSalaryPerYear / 12

    const minWage =
      perMonthGross <= 30000 && minWageForState?.minWages ? Number(minWageForState.minWages) : 0

    let basicPay
    if (perMonthGross > 30000) basicPay = perMonthGross * 0.5
    else basicPay = Math.max(minWage, perMonthGross * 0.5)
    basicPay = Math.round(basicPay)

    const hra = Math.round(basicPay * 0.5)
    const specialAllowances = Math.round(perMonthGross - (basicPay + hra))

    let epf
    if (basicPay >= 15000) epf = Math.round(15000 * 0.13)
    else epf = Math.round(basicPay * 0.13)

    let esic = 0
    if (perMonthGross <= 21000) esic = perMonthGross * 0.0325
    esic = Number.isFinite(esic) && esic > 0 ? esic : 0

    const bonusAnnual = perMonthGross
    const bonusMonthly = bonusAnnual / 12

    const isBonusApplicable = form.getFieldValue('bonusApplicable') === true

    const gratuityBase = Math.max(basicPay, minWage || basicPay)
    const gratuity = gratuityBase * 0.0481

    let bonus = 0
    let grossBenefits = 0

    if (isBonusApplicable) {
      bonus = bonusMonthly
      grossBenefits = epf + esic + bonus + gratuity
    } else {
      bonus = 0
      grossBenefits = epf + esic + gratuity
    }

    const variableBenefit = perMonthGross + grossBenefits

    const breakup = {
      basicPay,
      hra,
      specialAllowances,
      grossSalary: perMonthGross,
      epf,
      esic,
      bonus,
      gratuity,
      grossBenefits,
      cost_to_company: variableBenefit,
    }

    setsalarydata(breakup)

    const salaryData = Object.entries(breakup).map(([key, value], index) => {
      let amountPMNum = value == null ? null : Number(value)
      let amountPANum

      if (key === 'bonus') {
        if (!isBonusApplicable) {
          amountPMNum = 0
          amountPANum = 0
        } else {
          amountPMNum = bonusMonthly
          amountPANum = bonusAnnual
        }
      } else if (key === 'grossSalary') {
        amountPMNum = perMonthGross
        amountPANum = grossSalaryPerYear
      } else {
        amountPANum = amountPMNum == null ? null : amountPMNum * 12
      }

      return {
        key: `${index + 1}`,
        particulars: keyMatching[key],
        amountPM: amountPMNum == null ? null : Number(amountPMNum.toFixed(2)),
        amountPA: amountPANum == null ? null : Number(amountPANum.toFixed(2)),
      }
    })

    setviewSalaryBreakup(salaryData)

    form.setFieldsValue({
      basicPay: Number(basicPay.toFixed(2)),
      hra: Number(hra.toFixed(2)),
      specialAllowances: Number(specialAllowances.toFixed(2)),
      grossSalary: Number(perMonthGross.toFixed(2)),
      epf: Number(epf.toFixed(2)),
      esic: Number(esic.toFixed(2)),
      bonus: isBonusApplicable ? Number(bonusMonthly.toFixed(2)) : 0,
      gratuity: Number(gratuity.toFixed(2)),
      grossBenefits: Number(grossBenefits.toFixed(2)),
      cost_to_company: Number(variableBenefit.toFixed(2)),
      ctc: Number(grossSalaryPerYear.toFixed(2)),
    })
  }

  const offerLetterTab = (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item name="candidateName" label="Candidate Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="email" label="Email ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Col>

      {/* ❌ Commented Preferred State Field */}
      {/*
      <Col span={8}>
        <Form.Item
          name="state"
          label="Preferred State"
          rules={[{ required: watch_salary_pm <= 30000, message: 'State is required' }]}
        >
          <Select placeholder="Select State" showSearch optionFilterProp="children">
            {minWagesStates?.map((st) => (
              <Select.Option key={st.stateId ?? st.id} value={st.stateId ?? st.id}>
                {st.stateName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      */}

      <Col span={8}>
        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: 'Department is required' }]}
        >
          <Select showSearch optionFilterProp="children" placeholder="Select Department" allowClear>
            {Department?.map((dep) => (
              <Select.Option value={dep.departmentId} key={dep.departmentId}>
                {dep.departmentName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Job Position"
          name="position"
          rules={[{ required: true, message: 'Please select job position' }]}
        >
          <Select placeholder="Select Position" showSearch optionFilterProp="children">
            {Designation?.map((val) => (
              <Select.Option key={val.designationId} value={val.designationId}>
                {val.designationName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Bonus Applicable"
          name="bonusApplicable"
          rules={[{ required: true, message: 'Please select an option' }]}
        >
          <Select placeholder="Select Option" allowClear>
            <Select.Option value={true}>Yes</Select.Option>
            <Select.Option value={false}>No</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="offerDate" label="Offer Date" rules={[{ required: true }]}>
          <DatePicker format="MMMM D, YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="joiningDate" label="Joining Date" rules={[{ required: true }]}>
          <DatePicker format="MMMM D, YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          name="salary"
          label="Salary (per annum)"
          rules={[
            { required: true, message: 'Salary is required' },
            { pattern: /^\d+$/, message: 'Only integers are allowed' },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          initialValue="none"
          name="hrName"
          label="HR Name"
          rules={[
            { required: true, message: 'Please select an HR' },
            () => ({
              validator(_, value) {
                if (value && value !== 'none') return Promise.resolve()
                return Promise.reject(new Error('Please select a valid HR'))
              },
            }),
          ]}
        >
          <Select showSearch optionFilterProp="children">
            <Select.Option value="none">Select HR</Select.Option>
            <Select.Option value="Nikhil Chhokra">Nikhil Chhokra</Select.Option>
            <Select.Option value="Narad Sah">Narad Sah</Select.Option>
            <Select.Option value="Abhishek Kumar">Abhishek Kumar</Select.Option>
            <Select.Option value="Khushboo Jha">Khushboo Jha</Select.Option>
            <Select.Option value="Ruchi Dubey">Ruchi Dubey</Select.Option>
            <Select.Option value="Sakshi">Sakshi</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item initialValue="none" label="NSO Head" name="reportingManager">
          <Select showSearch optionFilterProp="children">
            <Select.Option value="none">Select Zonal Head</Select.Option>
            <Select.Option value="Arun Nardia">Arun Nardia</Select.Option>
            <Select.Option value="Mohit Singhal">Mohit Singhal</Select.Option>
            <Select.Option value="Khushal Kumar">Khushal Kumar</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          initialValue={'8 AM to 6 Pm'}
          name="workHours"
          label="Work Hours"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Office Type"
          name="officeType"
          rules={[{ required: true, message: 'Office Type is required' }]}
        >
          <Select
            placeholder="Select office type"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            <Select.Option value="Head Office">Head Office</Select.Option>
            <Select.Option value="DC">DC</Select.Option>
            <Select.Option value="Aquatica">Aquatica</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      {watch_office_type && (
        <Col span={8}>
          <Form.Item
            label="Office Address"
            name="officeAddress"
            rules={[{ required: true, message: 'Office address is required' }]}
          >
            <Select
              placeholder="Select office address"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {watch_office_type === 'Head Office' && (
                <Select.Option value="2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog, Sector 18, Gurugram, Sarhol, Haryana-122015">
                  2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog, Sector 18, Gurugram,
                  Sarhol, Haryana-122015
                </Select.Option>
              )}

              {watch_office_type === 'DC' && (
                <>
                  <Select.Option value="DC KOL - DW01 Old DelhiRoad, Serampore, Hooghly, West Bengal,Kolkata 712203">
                    DC KOL - DW01 Old DelhiRoad, Serampore, Hooghly, West Bengal,Kolkata 712203
                  </Select.Option>
                  <Select.Option value="DC FARRUKHNAGAR - DH24 Warehouse (V2 Retail Ltd), Village Khentawas, Farrukhnagar, District – Gurugram, Haryana – 122506">
                    DC FARRUKHNAGAR - DH24 Warehouse (V2 Retail Ltd), Village Khentawas,
                    Farrukhnagar, District – Gurugram, Haryana – 122506
                  </Select.Option>
                </>
              )}

              {watch_office_type === 'Aquatica' && (
                <Select.Option value="Vishal Water World (P) LTD.">
                  Vishal Water World (P) LTD.
                </Select.Option>
              )}
            </Select>
          </Form.Item>
        </Col>
      )}
    </Row>
  )

  const CTCDataTable = (
    <div style={{ padding: '20px' }}>
      <Table
        dataSource={viewSalaryBreakup}
        columns={columns}
        pagination={false}
        rowClassName={(record, index) => {
          let baseClass = index % 2 === 0 ? 'custom-row even-row' : 'custom-row odd-row'
          if (
            record.key === '4' ||
            record.key === '5' ||
            record.key === '10' ||
            record.key === '11'
          ) {
            baseClass += ' highlight-bold-row'
          }
          return baseClass
        }}
      />
    </div>
  )

  const tabItems = [
    { key: '1', label: 'Offer Letter Details', children: offerLetterTab },
    { key: '2', label: 'Salary Details', children: CTCDataTable },
  ]

  return (
    <Modal
      title="Offer Letter Preview"
      open={offerLetterModel}
      onCancel={handleCancel}
      footer={null}
      width={900}
      style={{ top: 20 }}
      confirmLoading={loading}
    >
      {loading && (
        <div style={{ position: 'absolute', zIndex: 100, top: '40%', left: '40%' }}>
          <img
            src="https://i.gifer.com/origin/7d/7d3a8639eb21b4dd2572653b476daf7a_w200.gif"
            alt="loading"
          />
          <p style={{ textAlign: 'center' }}>Generating......</p>
        </div>
      )}

      {showTemplate ? (
        <OfferLetterTemplate
          offerData={offerDataa}
          showTemplate={showTemplate}
          setshowTemplate={setshowTemplate}
          setofferLetterModels={setofferLetterModels}
          ApplicationListData={ApplicationListData}
        />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Tabs type="card" defaultActiveKey="1" items={tabItems} />
          <div style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block>
              Generate Offer Letter
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  )
}

export default OfferLetterModal
