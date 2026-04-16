import { Button, Form, message, Select, Spin } from 'antd'
import axiosInstance from '../../../services/axiosInstance'
import { postEmpRoleMap, searchEmployeeDropdown } from '../../../services/Services'
import { useEffect, useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import EmpRoleMapUploader from './EmpRoleMapUploader'

const EmpRoleMap = ({ roles = [] }) => {
  const [form] = Form.useForm()
  const [employees, setEmployees] = useState([])
  const [selectedEmpCode, setSelectedEmpCode] = useState('')
  const [selectedEmpName, setSelectedEmpName] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  // Debounced employee search
  useEffect(() => {
    if (searchText.length >= 2) {
      setSearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            // console.log('emp api res: ', res)
            if (res?.data?.employees?.length > 0) {
              setEmployees(res.data.employees)
            } else {
              setEmployees([])
            }
          } catch (error) {
            console.error('Error fetching employee attendance:', error)
            setEmployees([])
          } finally {
            setSearchLoading(false)
          }
        }

        fetchData()
      }, 800)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  const handleSubmitForm = async (values) => {
    const {
      empRoleMap: { employee, role },
    } = values

    const requestBody = {
      employeeRoles: [
        {
          ecode: employee,
          roleName: role,
        },
      ],
    }
    setLoading(true)

    const response = await postEmpRoleMap(requestBody)

    if (response?.status === 200) {
      console.log('status: ', response?.status)
      console.log('form:', form)
      message.success(response?.data?.message || 'Role mapped with employee')
      form.resetFields()
      setSelectedEmpCode('')
      setSelectedEmpName('')
      setSearchText('')
      setEmployees([])
    } else {
      message.error(response?.response?.data?.message || 'Error in mapping role to employee')
    }

    setLoading(false)
  }

  return (
    <>
      <EmpRoleMapUploader isVisible={isVisible} setIsVisible={setIsVisible} />
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
      >
        <Form name="empRoleMap" form={form} layout="inline" onFinish={handleSubmitForm}>
          <Form.Item
            label="Employee"
            name={['empRoleMap', 'employee']}
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              style={{ width: 200 }}
              onSearch={setSearchText}
              notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
              showSearch
              allowClear
              filterOption={false}
            >
              {employees?.length > 0
                ? employees.map((e) => (
                    <Select.Option key={e.ecode} value={e.ecode}>
                      {e.ecode} - {e.fullName}
                    </Select.Option>
                  ))
                : -(<Select.Option>No Employee Found</Select.Option>) +
                  (
                    <Select.Option disabled key="no-emp">
                      No Employee Found
                    </Select.Option>
                  )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Role"
            name={['empRoleMap', 'role']}
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              style={{ width: 200 }}
              showSearch
              allowClear
              filterOption={(input, option) => {
                const label = String(option?.children ?? '')?.toLowerCase()
                const value = String(option?.value ?? '')?.toLowerCase()
                return (
                  label?.includes(input?.toLowerCase()) || value?.includes(input?.toLowerCase())
                )
              }}
            >
              <Select.Option value="">Select Role</Select.Option>
              {roles?.map((role) => (
                <Select.Option key={role?.roleId} value={role?.roleName}>
                  {role?.roleName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>

        <Button icon={<UploadOutlined />} onClick={() => setIsVisible(true)} />
      </div>
    </>
  )
}

export default EmpRoleMap
