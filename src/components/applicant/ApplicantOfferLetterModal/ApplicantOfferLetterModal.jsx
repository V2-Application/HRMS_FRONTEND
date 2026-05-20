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
import ApplicantOfferLetterTemplate from './ApplicantOfferLetterTemplate'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { fetchMinWages, searchEmployeeDropdown } from '../../../services/Services'
import { useWatch } from 'antd/es/form/Form'

const ApplicantOfferLetterModal = ({
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
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const [minWagesStates, setMinWagesStates] = useState([])

  const [minWageForState, setMinWageForState] = useState(null)

  const watchSalaryRaw = useWatch('salary', form)
  const watch_salary = watchSalaryRaw ? parseInt(watchSalaryRaw, 10) / 12 : 0
  const watch_state = useWatch('state', form)
  const watch_office_type = useWatch('officeType', form)

  const fetchStates = async () => {
    try {
      const response = await fetchMinWages()

      if (response.status === 200) {
        const data = response.data?.data || []
        setMinWagesStates(data)
      }
    } catch (error) {
      console.error('minwages error:', error)
      const msg = error?.response?.data?.message
      if (msg) message.error(msg)
    }
  }

  useEffect(() => {
    fetchStates()
  }, [])

  // --- Whenever state or salary changes, pick the min wage record (only if salary <= 30000) ---
  useEffect(() => {
    if (!minWagesStates.length || !watch_state || watch_salary > 30000) {
      setMinWageForState(null)
      return
    }

    const stateIdNumber = Number(watch_state)
    const match =
      minWagesStates.find(
        (dt) => Number(dt.stateId ?? dt.id) === stateIdNumber, // support stateId or id from API
      ) || null

    setMinWageForState(match)
  }, [watch_state, watch_salary, minWagesStates])

  useEffect(() => {
    if (!offerLetterModel) {
      form.resetFields()
      setOfferDataa(null)
      return
    }

    const currentPosition = Designation?.find(
      (des) => des?.designationId === Number(defaultModelData?.designation),
    )

    form.setFieldsValue({
      candidateName: defaultModelData?.firstName,
      position: currentPosition ? currentPosition?.designationId : undefined,
      state: defaultModelData?.stateId ? Number(defaultModelData.stateId) : undefined,
      email: defaultModelData?.email,
      currentLocation: defaultModelData?.currentLocation,
      salary: defaultModelData?.grossSalary
        ? parseInt(defaultModelData.grossSalary, 10)
        : undefined,
      joiningDate: defaultModelData?.joiningDate ? dayjs(defaultModelData.joiningDate) : undefined,
      department: defaultModelData?.department,
    })

    if (defaultModelData?.grossSalary) {
      handleCTCChange(defaultModelData.grossSalary)
    }
  }, [offerLetterModel])

  useEffect(() => {
    form.setFieldsValue({
      officeAddress: '',
    })
  }, [watch_office_type])

  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            setEmployees(res?.data?.employees || [])
          } catch (error) {
            console.error('Error fetching employee attendance:', error)
            setEmployees([])
          } finally {
            setsearchLoading(false)
          }
        }

        fetchData()
      }, 800)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  useEffect(() => {
    setshowTemplate(!!offerDataa)
  }, [offerDataa])

  const salaryFields = [
    { name: 'grossSalary', label: 'Gross Salary' },
    { name: 'basicPay', label: 'Basic Pay' },
    { name: 'hra', label: 'House Rent Allowances' },
    { name: 'specialAllowances', label: 'Special Allowances' },
    // { name: 'deducation', label: 'Deducation' },
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
    // deducation: 'Deducation',
    epf: 'EPF',
    esic: 'ESIC',
    bonus: 'BONUS/Ex-Gratia',
    gratuity: 'Gratuity as per Act*',
    grossBenefits: 'Gross benefits',
    cost_to_company: 'CTC',
  }

  const columns = [
    {
      title: 'Particulars',
      dataIndex: 'particulars',
      key: 'particulars',
    },
    {
      title: 'Amount (P.M)',
      dataIndex: 'amountPM',
      key: 'amountPM',
    },
    {
      title: 'Amount (P.A)',
      dataIndex: 'amountPA',
      key: 'amountPA',
    },
  ]

  const findValueByid = async (type, vall) => {
    const id = parseInt(vall, 10)
    let val = null
    if (type === 'Department') {
      const department = Department.find((dep) => dep.departmentId === id)
      val = department ? department.departmentName : null
    } else if (type === 'Location') {
      const department = Location.find((dep) => dep.locationId === id)
      val = department ? department.locationName : null
    } else if (type === 'Designation') {
      const department = Designation.find((dep) => dep.designationId === id)
      val = department ? department.designationName : null
    } else {
      val = 'Invalid Type'
    }
    return val
  }

  const handleFinish = async (values) => {
    const perMonthGrossForValidation =
      values.salary && !Number.isNaN(Number(values.salary)) ? Number(values.salary) / 12 : 0

    // Only validate min wage if per-month gross <= 30000 and state selected
    if (perMonthGrossForValidation <= 30000 && minWageForState?.minWages) {
      if (perMonthGrossForValidation < minWageForState.minWages) {
        message.error(
          `Per month gross: ${perMonthGrossForValidation} is less than min wage: ${minWageForState.minWages} for selected state`,
        )
        return
      }
    }

    setloading(true)
    const formattedValues = {
      ...values,
      isBonusApplicable: values?.bonusApplicable,
      department: await findValueByid('Department', values.department),
      position: await findValueByid('Designation', values.position),
      locationName: await findValueByid('Location', values.locationName),
      joiningDate: values.joiningDate.format('MMMM D, YYYY'),
      offerDate: values.offerDate.format('MMMM D, YYYY'),
      salary: values.salary,
      id: defaultModelData?.id,
      salaryDetails: {
        ...salaryFields.reduce((acc, field) => {
          acc[field.name] = salarydata[field.name]
          return acc
        }, {}),
        salary: values.salary, // per annum salary
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

    // Gross salary per annum (from Salary field)
    const grossSalaryPerYear = ctcValue

    // Per-month gross salary
    const perMonthGross = grossSalaryPerYear / 12

    const minWage =
      perMonthGross <= 30000 && minWageForState?.minWages ? Number(minWageForState.minWages) : 0

    // BASIC PAY
    let basicPay
    if (perMonthGross > 31050) {
      basicPay = perMonthGross * 0.5
    } else {
      basicPay = 15100
    }
    basicPay = Math.round(basicPay)

    // HRA = 50% of BASIC
    const hra = Math.round(basicPay * 0.5)

    // SPECIAL ALLOWANCE = GS - (BASIC + HRA)
    const specialAllowances = Math.round(perMonthGross - (basicPay + hra))

    // EPF
    let epf = 1950;
    // if (basicPay >= 15000) {
    //   epf = Math.round(15000 * 0.13) // 1950
    // } else {
    //   epf = Math.round(basicPay * 0.13)
    // }

    // ESIC: GS <= 21000 => 3.25% of GS
    // let esic = 0
    // if (perMonthGross <= 21000) {
    //   esic = perMonthGross * 0.0325
    // }

let esic = 0
if (perMonthGross <= 21000) {
  esic = perMonthGross * 0.0325
}
esic = Number.isFinite(esic) && esic > 0 ? esic : 0


    // BONUS RULE:
    // Annual bonus = 1 month gross (perMonthGross)
    // Monthly accrual = perMonthGross / 12
    const bonusAnnual = perMonthGross
    const bonusMonthly = bonusAnnual / 12
    const isBonusApplicable = form.getFieldValue('bonusApplicable') === true

    // GRATUITY: 4.81% of Basic or Minimum Wage whichever is higher
    const gratuityBase = Math.max(basicPay, minWage || basicPay)
    const gratuity = gratuityBase * 0.0481

    let bonus = 0
    let deducation = 0
    let grossBenefits = 0

    if (isBonusApplicable) {
      bonus = bonusMonthly
      deducation = 0
      grossBenefits = epf + esic + bonus + gratuity
    } else {
      bonus = 0
      deducation = bonusMonthly
      grossBenefits = epf + esic + gratuity
    }

    // Monthly CTC = GS + Benefits
    const variableBenefit = perMonthGross + grossBenefits
    const finalCTC = grossSalaryPerYear

    const breakup = {
      basicPay,
      hra,
      specialAllowances,
      grossSalary: perMonthGross, // per month
      // deducation,
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
        // For Gross Salary, P.A MUST equal Salary (per annum) field
        amountPMNum = perMonthGross
        amountPANum = grossSalaryPerYear
      } else {
        amountPANum = amountPMNum == null ? null : amountPMNum * 12
      }

      const amountPM = amountPMNum == null ? null : Math.floor(Number(amountPMNum.toFixed(2)))
      const amountPA = amountPANum == null ? null : Math.floor(Number(amountPANum.toFixed(2)))

      return {
        key: `${index + 1}`,
        particulars: keyMatching[key],
        amountPM,
        amountPA,
      }
    })

    setviewSalaryBreakup(salaryData)

    form.setFieldsValue({
      basicPay: Math.floor(Number(basicPay.toFixed(2))),
      hra: Math.floor(Number(hra.toFixed(2))),
      specialAllowances: Math.floor(Number(specialAllowances.toFixed(2))),
      grossSalary: Math.floor(Number(perMonthGross.toFixed(2))), // per month
      epf: Math.floor(Number(epf.toFixed(2))),
      esic: Math.floor(Number(esic.toFixed(2))),
      bonus: isBonusApplicable ? Math.floor(Number(bonusMonthly.toFixed(2))) : 0,
      // deducation: Number(deducation.toFixed(2)),
      gratuity: Math.floor(Number(gratuity.toFixed(2))),
      grossBenefits: Math.floor(Number(grossBenefits.toFixed(2))),
      cost_to_company: Math.floor(Number(variableBenefit.toFixed(2))),
      ctc: Math.floor(Number(finalCTC.toFixed(2))),
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

      <Col span={8}>
        <Form.Item
          name="state"
          label="Preferred State"
          rules={[{ required: watch_salary <= 30000, message: 'State is required' }]}
        >
          <Select
            placeholder="Select State"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
            onChange={() => {
              const salaryVal = form.getFieldValue('salary')
              if (salaryVal) {
                handleCTCChange(salaryVal)
              }
            }}
          >
            {minWagesStates?.map((st) => (
              <Select.Option key={st.stateId ?? st.id} value={st.stateId ?? st.id}>
                {st.stateName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Department" name="department">
          <Select showSearch optionFilterProp="children">
            <Select.Option value="none">Select Location</Select.Option>
            {Department?.map((loc) => (
              <Select.Option value={loc.departmentId} key={loc.departmentName}>
                {loc.departmentName}
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
          <Select
            placeholder="Select Position"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {Designation?.map((val, index) => (
              <Select.Option key={index} value={val?.designationId}>
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
          <Select
            placeholder="Select Option"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
            onChange={() => {
              const salaryVal = form.getFieldValue('salary')
              if (salaryVal) {
                handleCTCChange(salaryVal)
              }
            }}
          >
            <Select.Option>Select an option</Select.Option>
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
          <Input
            onChange={(e) => {
              handleCTCChange(e.target.value)
            }}
          />
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
                if (value && value !== 'none') {
                  return Promise.resolve()
                }
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
            <Select.Option value="Sadanand">Sadanand</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item initialValue="none" label="NSO Head" name="reportingManager">
          <Select showSearch optionFilterProp="children">
            <Select.Option value="none">Select NSO Head</Select.Option>
            <Select.Option value="Dinesh Prasad">Dinesh Prasad</Select.Option>
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
          <Select placeholder="Select office type" allowClear showSearch filterOption="children">
            <Select.Option value="">Select</Select.Option>
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
              filterOption="children"
            >
              {watch_office_type &&
                (watch_office_type === 'Head Office' ? (
                  <React.Fragment>
                    <Select.Option>Select</Select.Option>
                    <Select.Option value="2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog, Sector 18, Gurugram, Sarhol, Haryana-122015">
                      2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog, Sector 18, Gurugram,
                      Sarhol, Haryana-122015
                    </Select.Option>
                  </React.Fragment>
                ) : watch_office_type === 'DC' ? (
                  <React.Fragment>
                    <Select.Option>Select</Select.Option>
                    <Select.Option value="DC KOL - DW01 Old DelhiRoad, Serampore, Hooghly, West Bengal,Kolkata 712203">
                      DC KOL - DW01 Old DelhiRoad, Serampore, Hooghly, West Bengal,Kolkata 712203
                    </Select.Option>
                    <Select.Option value="DC FARRUKHNAGAR - DH24 Warehouse (V2 Retail Ltd), Village Khentawas, Farrukhnagar, District – Gurugram, Haryana – 122506">
                      DC FARRUKHNAGAR - DH24 Warehouse (V2 Retail Ltd), Village Khentawas,
                      Farrukhnagar, District – Gurugram, Haryana – 122506
                    </Select.Option>
                  </React.Fragment>
                ) : watch_office_type === 'Aquatica' ? (
                  <React.Fragment>
                    <Select.Option value="Vishal Water World (P) LTD.">
                      Vishal Water World (P) LTD.
                    </Select.Option>
                  </React.Fragment>
                ) : null)}
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
        <ApplicantOfferLetterTemplate
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

export default ApplicantOfferLetterModal
