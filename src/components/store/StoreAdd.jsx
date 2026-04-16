import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Col, Form, Input, Row, Select, Upload, DatePicker, message } from 'antd'
import { AiOutlineAppstoreAdd } from 'react-icons/ai'
import { CiEdit } from 'react-icons/ci'
import { MdDeleteForever } from 'react-icons/md'
import { FaSearch, FaRegSave } from 'react-icons/fa'
import { RxCross1 } from 'react-icons/rx'
import { BiExit } from 'react-icons/bi'
import { LuArrowRightToLine, LuArrowRight, LuArrowLeft, LuArrowLeftToLine } from 'react-icons/lu'
import './StoreAdd.css'
import { useNavigate, useParams } from 'react-router-dom'
import { RollbackOutlined } from '@ant-design/icons'
import {
  fetch_store_data,
  searchEmployeeDropdown,
  storeUpdate,
  fetch_countries_list,
  getStateFromCountryValue,
} from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'

const { Option } = Select

function StoreAdd() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])
  const [selectedEmp, setSelectedEmp] = useState('')
  const [employees, setEmployees] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedEmpCode, setSelectedEmpCode] = useState('')
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [stateID, setStateID] = useState(null)
  const dispatch = useDispatch()

  const handleSearch = (value) => {
    setSearchText(value)
  }

  useEffect(() => {
    if (searchText.length >= 2) {
      const debounceTimer = setTimeout(() => {
        const fetchEmployees = async () => {
          try {
            const response = await searchEmployeeDropdown(searchText)
            setEmployees(response?.data?.employees)
          } catch (error) {
            console.error('Search API error:', error)
          }
        }

        fetchEmployees()
      }, 1000)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  const onFinish = async (values) => {
    await dispatch(set({ loading: true }))
    try {
      const updateId = id ? id : 0
      // console.log('store:', values?.store)

      const {
        address,
        billingOver50Lac,
        country,
        emailID,
        erpSiteNameCode,
        esiCode,
        locationIncharge,
        manPower,
        nameOfLocation,
        nonActiveLocation,
        pfCode,
        sapCode,
        stateId,
        stateName,
        type,
        weeklyOff,
        zone,
      } = values?.store || {}

      const requestBody = {
        address: address || '',
        billingOver50Lac: billingOver50Lac || '',
        country: country || '',
        emailID: emailID || '',
        erpSiteNameCode: erpSiteNameCode || '',
        esiCode: esiCode || '',
        locationIncharge: locationIncharge || '',
        nameOfLocation: nameOfLocation || '',
        pfCode: pfCode || '',
        sapCode: sapCode || '',
        stateID: stateId || '',
        stateName: stateName || '',
        type: type || '',
        weeklyOff: weeklyOff || '',
        zone: zone || '',
      }

      // console.log('request body', requestBody)
      //console.log('values-----store update----')

      const response = await storeUpdate({ updateId, requestBody })
      // console.log('values-----store update----', response)

      if (response.status) {
        message.success('Store added successfully')
        navigate('/store-list/all')
      }
    } catch (error) {
      console.error('error', error)
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const fetchStoreData = async () => {
    setLoading(true)
    try {
      const response = await fetch_store_data(id)
      // console.log('fetch api res:', response)
      const apiData = response?.data[0]
      // console.log('response?.data[0]', response?.data[0])
      setStateID(response?.data[0]?.stateId)

      const new_res = {
        address: apiData?.address,
        billingOver50Lac: apiData?.billingOver50Lac,
        emailID: apiData?.emailID,
        erpSiteNameCode: apiData?.erpSiteNameCode,
        esiCode: apiData?.esiCode,
        locationIncharge: apiData?.locationIncharge,
        nameOfLocation: apiData?.nameOfLocation,
        pfCode: apiData?.pfCode,
        sapCode: apiData?.sapCode,
        stateName: apiData?.stateName,
        type: apiData?.type,
        weeklyOff: apiData?.weeklyOff,
        zone: apiData?.zone,
      }

      form.setFieldsValue({ store: new_res })
    } catch (error) {
      console.error('api errror:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    const response = await fetch_countries_list()
    // console.log('api countries:', response)

    if (response.status) {
      setCountries(response?.data)
    }
  }

  const handleCountryChange = async (value) => {
    const response = await getStateFromCountryValue(value)
    // console.log('countries----------------', response);

    if (response.status === 200) {
      setStates(response?.data)
    }
  }

  useEffect(() => {
    if (id) fetchStoreData()
  }, [id])

  useEffect(() => {
    fetchCountries()
  }, [])

  const handleGoBack = () => {
    navigate('/store-list/all')
  }

  return (
    <div className="store-add-container">
      {/* <div className="button-group">
                <div>
                    <Button className="action-button"><AiOutlineAppstoreAdd />Add</Button>
                    <Button className="action-button"><CiEdit />Edit</Button>
                    <Button className="action-button danger"><MdDeleteForever />Delete</Button>
                    <Button className="action-button"><FaSearch />Search</Button>
                </div>
                <div className="navigation-buttons">
                    <Button className="nav-button"><LuArrowLeftToLine /></Button>
                    <Button className="nav-button"><LuArrowLeft /></Button>
                    <Button className="nav-button"><LuArrowRight /></Button>
                    <Button className="nav-button"><LuArrowRightToLine /></Button>
                </div>
                <div>
                    <Button className="action-button"><FaRegSave />Save</Button>
                    <Button className="action-button"><RxCross1 />Cancel</Button>
                    <Button className="action-button"><BiExit />Exit</Button>
                </div>
            </div> */}

      <Button
        type="primary"
        shape="circle"
        icon={<RollbackOutlined />}
        size={'middle'}
        onClick={handleGoBack}
        style={{ marginBottom: '10px' }}
      />

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row
          gutter={16}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Col xs={24} sm={10}>
            <Form.Item
              name={['store', 'nameOfLocation']}
              label="Name of Location"
              rules={[{ required: true, message: 'Please input the location name!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name={['store', 'locationIncharge']}
              label="Location Incharge"
              // rules={[{ required: true, message: 'Please input the location incharge!' }]}
            >
              {/* <Input /> */}
              <Select
                showSearch
                placeholder="Search with employee name or code"
                value={selectedEmpCode || undefined}
                onChange={(value) => setSelectedEmpCode(value)}
                onSearch={handleSearch}
                filterOption={false}
              >
                {employees.map((emp, index) => (
                  <Select.Option key={index} value={emp?.ecode}>
                    {emp?.fullName} - {emp?.ecode}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={4}>
            <Form.Item name={['store', 'nonActiveLocation']} label="" valuePropName="checked">
              <Checkbox>Non Active Location</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name={['store', 'address']}
          label="Address"
          // rules={[{ required: true, message: 'Please input the address!' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'sapCode']} label="SAP Code">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'zone']} label="Zone">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'billingOver50Lac']} valuePropName="checked" label=" ">
              <Checkbox>{'Billing > 50 Lac'}</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'pfCode']} label="P.F. Code">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'esiCode']} label="E.S.I. Code">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'type']} label="Type">
              <Select defaultValue="Regional Office">
                <Option value="Regional Office">Regional Office</Option>
                <Option value="Branch Office">Branch Office</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'country']} label="Country">
              <Select onChange={handleCountryChange}>
                {countries.map((cntry, idx) => (
                  <Option key={idx} value={cntry?.countryId}>
                    {cntry?.countryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'stateName']} label="State/UT">
              <Select>
                {states.map((state, idx) => (
                  <Option key={idx} value={state?.stateId}>
                    {state?.stateName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'weeklyOff']} label="Weekly Off">
              <Select>
                <Option value="Sunday">Sunday</Option>
                <Option value="Saturday">Saturday</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name={['store', 'emailID']}
              label="Email ID"
              rules={[{ type: 'emailID', message: 'The input is not valid E-mail!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={['store', 'erpSiteNameCode']} label="ERP Site Name/Code">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name={['store', 'manPower']}
              label="Total Man Power"
              rules={[{ pattern: /^\d+$/, message: 'Only numbers are valid' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            style={{ width: '8rem', alignSelf: 'end' }}
            type="primary"
            block
            loading={loading}
            htmlType="submit"
          >
            {id ? 'Update L.W.F.' : 'Submit L.W.F.'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default StoreAdd
