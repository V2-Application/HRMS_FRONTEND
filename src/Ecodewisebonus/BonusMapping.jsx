import React, { useEffect, useState } from 'react'
import { Card, Form, Select, Button, message, Spin, Table, Input, Popconfirm, Space } from 'antd'
import { useDispatch } from 'react-redux'
import Pageheading from '../../src/components/shared/Pageheading'
import {
  bonusPolicyName,
  searchEmployeeDropdown,
  getBonusPolicyNameTable,
} from '../services/Services'
import axiosInstance from '../../src/services/axiosInstance'
import { set as setUi } from '../../src/redux/uiSlice'

const { Option } = Select
const { Search } = Input

const BonusMapping = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  const [employeeOptions, setEmployeeOptions] = useState([])
  const [bonusPolicies, setBonusPolicies] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [policyLoading, setPolicyLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [mappingData, setMappingData] = useState([])
  const [mappingLoading, setMappingLoading] = useState(false)

  const [searchText, setSearchText] = useState('')

  /* --------- Load Bonus Policies once --------- */
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setPolicyLoading(true)
        const res = await bonusPolicyName()
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : []
        setBonusPolicies(list)
      } catch (err) {
        console.error('Bonus policy fetch error:', err)
        message.error('Unable to load bonus policies')
      } finally {
        setPolicyLoading(false)
      }
    }
    fetchPolicies()
  }, [])

  /* --------- Load mapping table --------- */
  const loadMappingTable = async () => {
    try {
      setMappingLoading(true)
      const res = await getBonusPolicyNameTable()

      // If backend explicitly returns 404 here (axios will usually throw instead),
      // just show an empty table.
      if (res?.status === 404) {
        setMappingData([])
        return
      }

      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : []
      setMappingData(list)
    } catch (err) {
      // If API returns 404 -> no mappings, so keep table empty and don't show error
      if (err?.response?.status === 404) {
        console.warn('Bonus mapping table 404 – showing empty table')
        setMappingData([])
      } else {
        console.error('Mapping table fetch error:', err)
        message.error('Unable to load bonus mappings')
      }
    } finally {
      setMappingLoading(false)
    }
  }

  useEffect(() => {
    loadMappingTable()
  }, [])

  /* --------- Employee search --------- */
  const handleEmployeeSearch = async (value) => {
    const query = value?.trim()
    if (!query || query.length < 2) {
      setEmployeeOptions([])
      return
    }
    try {
      setEmpLoading(true)
      const res = await searchEmployeeDropdown(query)
      const list = res?.data?.employees || res?.employees || []
      setEmployeeOptions(list)
    } catch (err) {
      console.error('Employee search error:', err)
      message.error('Unable to search employees')
      setEmployeeOptions([])
    } finally {
      setEmpLoading(false)
    }
  }

  /* --------- Edit from table -> prefill form --------- */
  const handleEdit = (record) => {
    form.setFieldsValue({
      employeeEcode: record.ecode,
      bonusPolicyId: record.bonusProvisioningPolicyMaster,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* --------- Delete mapping --------- */
  const handleDelete = async (record) => {
    const payload = { id: record.id }

    try {
      setMappingLoading(true)
      await dispatch(setUi({ loading: true }))

      const res = await axiosInstance.post(
        '/api/EcodeWiseBonusProvisioningPolicyMapping/delete',
        payload,
      )

      if (res?.status === 200) {
        message.success(res?.data?.message || 'Bonus mapping deleted successfully')
        await loadMappingTable()
      } else {
        message.error(res?.data?.message || 'Failed to delete bonus mapping')
      }
    } catch (err) {
      console.error('Bonus mapping delete error:', err)
      message.error(err?.response?.data?.message || 'Failed to delete bonus mapping')
    } finally {
      setMappingLoading(false)
      await dispatch(setUi({ loading: false }))
    }
  }

  /* --------- Submit mapping (upsert) --------- */
  const handleSubmit = async (values) => {
    const { employeeEcode, bonusPolicyId } = values
    const payload = {
      ecode: employeeEcode,
      bonusProvisioningPolicyMaster: bonusPolicyId,
    }

    try {
      setSubmitting(true)
      await dispatch(setUi({ loading: true }))

      const res = await axiosInstance.post(
        '/api/EcodeWiseBonusProvisioningPolicyMapping/upsert',
        payload,
      )

      if (res?.status === 200) {
        message.success(res?.data?.message || 'Bonus mapping saved successfully')
        form.resetFields()
        await loadMappingTable()
      } else {
        message.error(res?.data?.message || 'Failed to save bonus mapping')
      }
    } catch (err) {
      console.error('Bonus mapping upsert error:', err)
      message.error(err?.response?.data?.message || 'Failed to save bonus mapping')
    } finally {
      setSubmitting(false)
      await dispatch(setUi({ loading: false }))
    }
  }

  /* --------- Table columns --------- */
  const columns = [
    {
      title: 'Ecode',
      dataIndex: 'ecode',
      key: 'ecode',
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Policy Name',
      dataIndex: 'policyName',
      key: 'policyName',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this mapping?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  /* --------- Filtered data for search --------- */
  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredData = !normalizedSearch
    ? mappingData
    : mappingData.filter((row) => {
        const ecode = String(row.ecode || '').toLowerCase()
        const name = String(row.fullName || '').toLowerCase()
        const policy = String(row.policyName || '').toLowerCase()
        return (
          ecode.includes(normalizedSearch) ||
          name.includes(normalizedSearch) ||
          policy.includes(normalizedSearch)
        )
      })

  return (
    <>
      {/* Page title */}
      <Pageheading title="Bonus Mapping" marginBottom="16px" />

      {/* Top card with form */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmit}
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Employee */}
          <Form.Item
            label="Employee"
            name="employeeEcode"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              showSearch
              placeholder="Select employee"
              style={{ minWidth: 260 }}
              onSearch={handleEmployeeSearch}
              filterOption={false}
              notFoundContent={empLoading ? <Spin size="small" /> : ''}
            >
              {employeeOptions.map((emp) => (
                <Option key={emp.ecode} value={emp.ecode}>
                  {`${emp.ecode} - ${emp.fullName}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Bonus Policy */}
          <Form.Item
            label="Bonus Policy"
            name="bonusPolicyId"
            rules={[{ required: true, message: 'Please select a bonus policy' }]}
          >
            <Select
              placeholder="Select bonus policy"
              style={{ minWidth: 260 }}
              loading={policyLoading}
            >
              {bonusPolicies.map((bp) => (
                <Option key={bp.id} value={bp.id}>
                  {bp.policyName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Submit button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ minWidth: 100 }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Mapping table */}
      <Card
        title="Existing Bonus Mappings"
        
        extra={
          
          <Search
            placeholder="Search by Ecode / Name / Policy"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
            value={searchText}
          />
        
        }
        
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={mappingLoading}
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  )
}

export default BonusMapping
