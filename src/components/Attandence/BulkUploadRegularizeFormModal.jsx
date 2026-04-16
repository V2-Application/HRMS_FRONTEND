import { Button, Checkbox, message, Modal } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useState } from 'react'
import { regularizeSubmit } from '../../services/Services'

const BulkUploadRegularizeFormModal = ({
  bulkRegularizeModalOpen,
  setBulkRegularizeModalOpen,
  loading,
  selectedRowKeys = [],
  setSelectedRowKeys,
  activekey,
  fetchData,
}) => {
  const [selectedOption, setSelectedOption] = useState(1)
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!bulkRegularizeModalOpen) {
      setSelectedOption(1)
      setRemarks('')
      setSelectedRowKeys([])
    }
  }, [bulkRegularizeModalOpen])

  const handleRegularize = async () => {
    console.log('remarks: ', remarks)
    console.log('selectedOption: ', selectedOption)
    console.log('selectedRowKeys: ', selectedRowKeys)

    if (!Array.isArray(selectedRowKeys) || selectedRowKeys.length === 0) return

    try {
      setIsSubmitting(true)
      const requestBody = {
        statusId: selectedOption,
        remarks,
      }

      const promises = selectedRowKeys?.map((key) => regularizeSubmit(key, requestBody))
      const results = await Promise.all(promises) // rejects if any promise rejects
      console.log('all results', results)

      activekey == '1' ? fetchData(4) : fetchData(1)
      setSelectedOption(1)
      setRemarks('')
      setSelectedRowKeys([])
      setBulkRegularizeModalOpen(false)
      message.success(results[0]?.data?.message || 'Request submitted successfully')

      //   for (const key of selectedRowKeys) {
      //     const response = await regularizeSubmit(key, requestBody)
      //     console.log('regularize res for: ', response)

      //     if (response?.status === 200) {
      //       activekey === '1' ? fetchData(4) : fetchData(1)
      //       setSelectedOption(1)
      //       setRemarks('')
      //       setSelectedRowKeys([])
      //     }
      //   }
    } catch (error) {
      console.error('Error submitting multiple requests in regularize: ', error)
      message.error(error?.response?.data?.message || 'Request submitted successfully')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckboxChange = (option) => {
    setSelectedOption(option)
  }

  return (
    <Modal
      title="Regularize Request"
      open={bulkRegularizeModalOpen}
      onCancel={() => setBulkRegularizeModalOpen(false)}
      confirmLoading={loading}
      footer={[
        <Button key="submit" type="primary" onClick={handleRegularize} disabled={isSubmitting}>
          Submit
        </Button>,
      ]}
    >
      <Checkbox
        checked={selectedOption === 1}
        onChange={() => handleCheckboxChange(1)}
        disabled={loading}
      >
        Approve
      </Checkbox>

      <Checkbox
        checked={selectedOption === 2}
        onChange={() => handleCheckboxChange(2)}
        disabled={loading}
      >
        Reject
      </Checkbox>

      <TextArea
        rows={4}
        value={remarks || ''}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Enter remarks here..."
        style={{ marginTop: 5 }}
      />
    </Modal>
  )
}

export default BulkUploadRegularizeFormModal
