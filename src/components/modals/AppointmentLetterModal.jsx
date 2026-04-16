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
  Tag,
  Spin,
} from 'antd'

import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { searchEmployeeDropdown } from '../../services/Services'
import AppointmentLetterTemplate from '../../views/widgets/AppointmentLetterTemplate'

const AppointmentLetterModal = ({
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
  const [selectedEmpCode, setSelectedEmpCode] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    if (!offerLetterModel) {
      form.resetFields()
    } else if (offerLetterModel) {
      // console.log('default form - ', defaultModelData);
      form.setFieldsValue({
        candidateName: defaultModelData?.firstName,
        position: +defaultModelData?.designation,
        email: defaultModelData?.email,
        location: parseInt(defaultModelData?.locationName, 10),
        salary: parseInt(defaultModelData?.grossSalary, 10) * 12,
        joiningDate: dayjs(defaultModelData?.joiningDate),
        department: parseInt(defaultModelData?.department, 10),
      })
      handleCTCChange(defaultModelData?.grossSalary)
    }
  }, [offerLetterModel])

  // Debounced employee search
  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const currentPage = 1
            const pageSize = 100
            const res = await searchEmployeeDropdown(searchText)

            setEmployees(res?.data?.employees)
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
    if (offerDataa) {
      setshowTemplate(true)
    } else {
      setshowTemplate(false)
    }
  }, [offerDataa])

  const salaryFields = [
    { name: 'grossSalary', label: 'Gross Salary' },
    { name: 'basicPay', label: 'Basic Pay' },
    { name: 'hra', label: 'House Rent Allowances' },
    { name: 'specialAllowances', label: 'Special Allowances' },
    { name: 'deducation', label: 'Deducation' },
    { name: 'epf', label: 'EPF' },
    { name: 'esic', label: 'ESIC' },
    { name: 'bonus', label: 'BONUS/Ex-Gratia' },
    { name: 'gratuity', label: 'Gratuity as per Act*' },
    { name: 'grossBenefits', label: 'Gross Benefits' },
    { name: 'cost_to_company', label: 'Gross CTC' },
    // { name: "ctc", label: "Gross CTC" },
  ]

  const keyMatching = {
    basicPay: 'Basic Pay',
    hra: 'House Rent Allowances',
    specialAllowances: 'Special Allowances',
    grossSalary: 'Gross Salary',
    deducation: 'Deducation',
    epf: 'EPF',
    esic: 'ESIC',
    bonus: 'BONUS/Ex-Gratia',
    gratuity: 'Gratuity as per Act*',
    grossBenefits: 'Gross benefits',
    cost_to_company: 'CTC',
    // ctc: 'Gross CTC',
  }

  const data = [
    {
      key: '1',
      description: 'Gross CTC',
      value: '700000',
    },
    {
      key: '3',
      description: 'Basic Pay',
      pm: '29200',
      pa: '350400',
    },
    {
      key: '4',
      description: 'House Rent Allowances',
      pm: '14600',
      pa: '175200',
    },
    {
      key: '5',
      description: 'Special Allowances',
      pm: '14600',
      pa: '175200',
    },
    {
      key: '6',
      description: 'Gross Salary',
      pm: '58400',
      pa: '700800',
    },
    {
      key: '7',
      description: 'Deductions',
      value: '',
    },
    {
      key: '8',
      description: 'EPF',
      pm: '1950',
      pa: '23400',
    },
    {
      key: '9',
      description: 'ESIC',
      pm: '0',
      pa: '0',
    },
    {
      key: '10',
      description: 'Bonus/Ex-Gratia',
      pm: '4900',
      pa: '58800',
    },
    {
      key: '11',
      description: 'Gratuity',
      pm: '1405',
      pa: '16860',
    },
    {
      key: '12',
      description: 'Gross Benefits',
      pm: '8255',
      pa: '99060',
    },
    {
      key: '13',
      description: 'CTC',
      pm: '66655',
      pa: '799860',
    },
  ]

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
    // console.log("offer generate values salary brakup ---", viewSalaryBreakup);

    setloading(true)
    const formattedValues = {
      ...values,
      department: await findValueByid('Department', values.department),
      position: await findValueByid('Designation', values.position),
      locationName: await findValueByid('Location', values.location),
      joiningDate: values.joiningDate.format('MMMM D, YYYY'),
      offerDate: values.appointmentDate.format('MMMM D, YYYY'),
      offerLetterData: values.offerLetterData.format('MMMM D, YYYY'),
      salary: values.salary,
      id: defaultModelData.id,
      ecode: defaultModelData?.eCode,
      salaryDetails: {
        ...salaryFields.reduce((acc, field) => {
          acc[field.name] = salarydata[field.name]
          return acc
        }, {}),
        salary: values.salary,
      },
    }

    console.log('formattedValues:', formattedValues)

    setTimeout(() => {
      setOfferDataa(formattedValues)
      setloading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setofferLetterModel(false)
    setOfferDataa(null)
  }

  const handleCTCChange = (e) => {
    const ctcValue = parseFloat(e.replace(/[^0-9.]/g, ''))
    console.log('ctcvalue:', ctcValue)
    if (isNaN(ctcValue)) return

    // Sample calculation logic (adjust percentages as needed)
    const perMonthGross = Math.ceil(ctcValue / 12 / 100) * 100
    const basicPay = (perMonthGross / 2).toFixed(0)
    const hra = (basicPay / 2).toFixed(0)
    const specialAllowances = (basicPay / 2).toFixed(0)
    // const grossSalary = (
    //   parseFloat(basicPay) +
    //   parseFloat(hra) +
    //   parseFloat(specialAllowances)
    // ).toFixed(0);
    const epf = perMonthGross >= 21000 ? 1950 : 0
    const esic = Math.ceil((perMonthGross < 21000 ? ctcValue * 0.0325 : 0) / 100) * 100
    const bonus = Math.ceil(perMonthGross / 12 / 100) * 100
    const gratuity = (basicPay * 0.0481).toFixed(0)
    const grossBenefits = (
      parseFloat(epf) +
      parseFloat(esic) +
      parseFloat(bonus) +
      parseFloat(gratuity)
    ).toFixed(0)
    const variableBenefit = (Number(perMonthGross) + Number(grossBenefits)).toFixed(0)

    const finalCTC = ctcValue.toFixed(0)

    const breakup = {
      basicPay: basicPay,
      hra: hra,
      specialAllowances: specialAllowances,
      grossSalary: perMonthGross,
      deducation: null,
      epf: epf,
      esic: esic,
      bonus: bonus,
      gratuity: gratuity,
      grossBenefits: grossBenefits,
      cost_to_company: variableBenefit,
      // ctc: finalCTC,
    }

    setsalarydata(breakup)
    const salaryData = Object.entries(breakup).map(([key, value], index) => {
      const amountPM = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value
      // console.log('amountPM', amountPM);

      const amountPA = amountPM === null ? null : amountPM * 12

      return {
        key: `${index + 1}`,
        particulars: keyMatching[key],
        amountPM: amountPM,
        amountPA: amountPA,
      }
    })

    setviewSalaryBreakup(salaryData)

    // console.log('salry data ----', salaryData);

    // console.log('Salary Brakup ----->', {
    //   basicPay: basicPay,
    //   hra: hra,
    //   specialAllowances: specialAllowances,
    //   grossSalary: perMonthGross,
    //   epf: epf,
    //   bonus: bonus,
    //   gratuity: gratuity,
    //   grossBenefits: grossBenefits,
    //   cost_to_company: variableBenefit,
    //   ctc: finalCTC,
    //   esic: esic
    // });

    form.setFieldsValue({
      basicPay: basicPay,
      hra: hra,
      specialAllowances: specialAllowances,
      grossSalary: perMonthGross,
      epf: epf,
      bonus: bonus,
      gratuity: gratuity,
      grossBenefits: grossBenefits,
      cost_to_company: variableBenefit,
      ctc: finalCTC,
      esic: esic,
    })
  }

  const offerLetterTab = (
    <Row gutter={16}>
      <Col span={16}>
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
          label="Designation"
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
              <Option key={index} value={val.designationId}>
                {val.designationName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please select job position' }]}
        >
          <Select
            placeholder="Select Location"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {Location?.map((val, index) => (
              <Option key={index} value={val.locationId}>
                {val.locationName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Department" name="department">
          <Select showSearch optionFilterProp="children">
            <Select.Option value="none">Select Department</Select.Option>
            {Department?.map((loc, index) => (
              <Select.Option value={loc.departmentId} key={loc.departmentId}>
                {loc.departmentName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          name="appointmentDate"
          label="Effective From Date"
          rules={[{ required: true, message: 'date is required' }]}
        >
          <DatePicker format="MMMM D, YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          name="joiningDate"
          label="Joining Date"
          rules={[{ required: true, message: 'date is required' }]}
        >
          <DatePicker format="MMMM D, YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          name="offerLetterData"
          label="Offer Letter Date"
          rules={[{ required: true, message: 'date is required' }]}
        >
          <DatePicker format="MMMM D, YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          name="salary"
          label="Salary"
          rules={[
            { required: true, message: 'Salary is required' },
            { pattern: /^\d+$/, message: 'Only integers are allowed' },
          ]}
          onChange={(e) => {
            handleCTCChange(e.target.value)
          }}
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
            ({ getFieldValue }) => ({
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
            <Select.Option value="Abhishek Bagga">Abhishek Bagga</Select.Option>
            <Select.Option value="Sahil Pathi">Sahil Pathi</Select.Option>
            <Select.Option value="Narad Sah">Narad Sah</Select.Option>
            <Select.Option value="Abhishek Kumar">Abhishek Kumar</Select.Option>
            <Select.Option value="Khushboo Jha">Khushboo Jha</Select.Option>
            <Select.Option value="Ruchi Dubey">Ruchi Dubey</Select.Option>
            <Select.Option value="Sakshi">Sakshi</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={8}>
        {/* <Form.Item name="reportingManager" label="Reporting Manager" rules={[{ required: true }]}>

          <Select
            showSearch
            //  defaultValue={selectedEmpCode}
            placeholder="Employee"
            value={selectedEmpCode || undefined}
            onChange={setSelectedEmpCode}
            onSearch={setSearchText}
            filterOption={false}
            notFoundContent={null}
            allowClear
          > 
            {!searchLoading ? (
              employees.map((emp) => (
                <Select.Option key={emp.employeeId} value={emp.employeeId}>
                  {`${emp.ecode} - ${emp.fullName}`}
                </Select.Option>
              ))
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Spin />
              </div>
            )}
          </Select>
        </Form.Item> */}
        <Form.Item initialValue="none" label="Zonal Head" name="reportingManager">
          <Select showSearch optionFilterProp="children">
            <Select.Option value="none">Select Zonal Head</Select.Option>
            <Select.Option value="Arun Nardia">Arun Nardia</Select.Option>
            <Select.Option value="Mohit Singhal">Mohit Singhal</Select.Option>
            <Select.Option value="Khushal Kumar">Khushal Kumar</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      {/* <Col span={8}>
                <Form.Item initialValue={'8 AM to 6 Pm'} name="workHours" label="Work Hours" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Col> */}
    </Row>
  )

  // const salaryTab = (
  //   <Row gutter={16}>
  //     {salaryFields.map((field) => (
  //       <Col span={8} key={field.name}>
  //         <Form.Item
  //           name={field.name}
  //           label={field.label}
  //           rules={[{ required: true }]}
  //         >
  //           <Input
  //             prefix="₹"
  //             readOnly={field.name !== "ctc"}
  //             onChange={field.name === "ctc" ? handleCTCChange : undefined}
  //           />
  //         </Form.Item>
  //       </Col>
  //     ))}
  //   </Row>
  // );

  const CTCDataTable = (
    <div style={{ padding: '20px' }}>
      {/* <h2>CTC Breakdown</h2> */}
      <Table
        dataSource={viewSalaryBreakup}
        columns={columns}
        pagination={false}
        rowClassName={(record, index) => {
          let baseClass = index % 2 === 0 ? 'custom-row even-row' : 'custom-row odd-row'

          // Check if the row's key is either 'grossSalary' or 'grossBenefits'
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
      title="Appointment Letter Preview"
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
        <AppointmentLetterTemplate
          offerData={offerDataa}
          showTemplate={showTemplate}
          setshowTemplate={setshowTemplate}
          setofferLetterModels={setofferLetterModels}
          ApplicationListData={ApplicationListData}
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={
            {
              // candidateName: "John Doe",
              // employeeId: "EMP123",
              // position: "Software Engineer",
              // salary: "600000",
              // joiningDate: dayjs(),
              // offerDate: dayjs(),
              // location: "Bangalore",
              // hrName: "Jane Smith",
              // reportingManager: "Mr. X",
              // workHours: "8 AM to 4:30 PM",
              // grossSalary: "",
              // basicPay: "",
              // hra: "",
              // specialAllowances: "",
              // epf: "",
              // bonus: "",
              // gratuity: "",
              // grossBenefits: "",
              // variableBenefit: "",
              // ctc: "700000",
            }
          }
        >
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

export default AppointmentLetterModal
