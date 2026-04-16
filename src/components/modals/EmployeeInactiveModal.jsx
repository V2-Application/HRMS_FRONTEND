import { Modal, Input, Form, Button, message } from 'antd'
import React, { useState } from 'react'
import { markEmployeeActiveStatus } from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'

const { TextArea } = Input

const EmployeeInactiveModal = ({
  isModalOpen,
  setIsModalOpen,
  empID,
  empName = 'Employee',
  fetchData,
}) => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const { employeeId } = useSelector((state) => state?.auth?.data)

  const handleBlur = (e) => {
    const trimmedValue = e.target.value.trim()
    form.setFieldsValue({ reason: trimmedValue })
  }

  const handleCancelModal = () => {
    form.resetFields()
    setIsModalOpen(false)
  }

  const onFinish = async (values) => {
    const trimmedReason = values.reason.trim()

    if (trimmedReason?.length === 0) {
      form.setFields([
        {
          name: 'reason',
          errors: ['Please enter valid reason'],
        },
      ])
      return false
    }

    try {
      dispatch(set({ loading: true }))
      setLoading(true)
      const formData = new FormData()
      formData.append('id', empID)
      formData.append('remarks', trimmedReason)
      formData.append('isactive', true)
      formData.append('lastUpdatedBy', employeeId)

      // for (const [key, value] of formData.entries()) {
      //   console.log('key: ', key, ' value: ', value)
      // }

      const response = await markEmployeeActiveStatus(formData)
      // console.log('Active employee api res: ', response)

      if (response?.status) {
        message.success(response?.data?.message || 'Success')
        setIsModalOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error submitting active employee api: ', error)
    } finally {
      dispatch(set({ loading: false }))
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`Activate ${empName}`}
      centered
      open={isModalOpen}
      onCancel={handleCancelModal}
      footer={null}
      styles={{ body: { height: '9rem' } }}
    >
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="reason"
          rules={[
            { required: true, message: 'Please enter valid reason' },
            {
              validator: (_, value) => {
                if (value && value?.trim()?.length === 0)
                  return Promise.reject('Please enter valid reason')

                return Promise.resolve()
              },
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter your reason to activate employee"
            // onBlur={handleBlur}
          />
        </Form.Item>
        <Form.Item style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" disabled={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EmployeeInactiveModal
