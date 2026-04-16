import React, { useEffect, useState } from 'react'
import { Modal, Button, Checkbox, Input, Select, Spin, Space } from 'antd'
import { useSelector } from 'react-redux'

const { TextArea } = Input

function EmpTransferApprovalModal({
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
          onClick={() => handleInitializeCandidate({ selectedOption })}
          disabled={loading || selectedOption === null}
          loading={loading}
        >
          Submit
        </Button>,
      ]}
    >
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
    </Modal>
  )
}

export default EmpTransferApprovalModal
