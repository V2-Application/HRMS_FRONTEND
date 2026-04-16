import React, { useEffect, useState } from 'react'
import { Modal, Button, Checkbox, Input, Select, Spin, Space } from 'antd'
import { useSelector } from 'react-redux'
import { searchEmployeeDropdown } from '../../services/Services'

const { TextArea } = Input

function ApproveModel({
  initiateModalOpen,
  handleInitializeCandidate,
  setInitiateModalOpen,
  isRevoked,
  approvalContext,
  label = 'Initialize Applicant',
  rmCode = '',
  ...props
}) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [remarks, setRemarks] = useState('')
  const { loading } = useSelector((state) => state.ui)
  const [employees, setEmployees] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedEmpCode, setSelectedEmpCode] = useState('')

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

  const handleCheckboxChange = (option) => {
    setSelectedOption(option)
  }

  useEffect(() => {
    if (!initiateModalOpen) {
      setSelectedOption(null)
      setRemarks('')
    }
  }, [initiateModalOpen])

  return (
    <Modal
      title={label}
      centered
      open={initiateModalOpen}
      onCancel={() => setInitiateModalOpen(false)}
      confirmLoading={loading}
      footer={[
        <Button
          key="approve"
          type="primary"
          onClick={() => handleInitializeCandidate({ selectedOption, remarks, selectedEmpCode })}
          disabled={loading || selectedOption === null}
          loading={loading}
        >
          Submit
        </Button>,
      ]}
    >
      {/* <Space style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center' }}>
        <label>RM Code:</label>
        <Select
          style={{ width: '25rem' }}
          onSearch={setSearchText}
          notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
          showSearch
          allowClear
          filterOption={false}
          onChange={(val) => setSelectedEmpCode(val)}
          placeholder="Search emp code or name"
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
      </Space> */}

      {!isRevoked && (
        <Checkbox
          checked={selectedOption === 1}
          onChange={() => handleCheckboxChange(1)}
          disabled={loading}
        >
          Approve
        </Checkbox>
      )}
      {!isRevoked && (
        <Checkbox
          checked={selectedOption === 2}
          onChange={() => handleCheckboxChange(2)}
          disabled={loading}
          style={{ marginLeft: 10 }}
        >
          Reject
        </Checkbox>
      )}
      {isRevoked && (
        <Checkbox
          checked={selectedOption === 3}
          onChange={() => handleCheckboxChange(3)}
          disabled={loading}
          style={{ marginLeft: 10 }}
        >
          Revoke me
        </Checkbox>
      )}
      <TextArea
        rows={4}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Enter remarks here..."
        style={{ marginTop: 10 }}
      />

      {/* <Select
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
      </Select> */}
    </Modal>
  )
}

export default ApproveModel
