import React from 'react'
import { Tabs, Form, Input, Button, message, Card } from 'antd'
import { changePassword } from '../../services/Services'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logoutUser } from '../../redux/authSlice'

const { TabPane } = Tabs

const ChangePasswordForm = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    // console.log('Password change submitted:', values);
    const { confirmPassword, ...payload } = values

    try {
      const result = await changePassword(payload)
      message.success('Password changed successfully, Please Login Again with New Password')
      form.resetFields()
      dispatch(logoutUser())
      navigate('/login')
      localStorage.removeItem('data')
    } catch (error) {
      console.error('error', error)
      message.error('Password change Failed')
    }
  }

  const validateNewPassword = (_, value) => {
    const current = form.getFieldValue('oldPassword')
    if (value && value === current) {
      return Promise.reject(new Error('New password must be different from current password'))
    }
    return Promise.resolve()
  }

  const validateConfirmPassword = (_, value) => {
    if (value && value !== form.getFieldValue('newPassword')) {
      return Promise.reject(new Error('Passwords do not match'))
    }
    return Promise.resolve()
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
      <Form.Item
        label="Current Password"
        name="oldPassword"
        rules={[{ required: true, message: 'Please enter your current password' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="New Password"
        name="newPassword"
        rules={[
          { required: true, message: 'Please enter a new password' },
          { validator: validateNewPassword },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Confirm New Password"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Please confirm your new password' },
          { validator: validateConfirmPassword },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Change Password
        </Button>
      </Form.Item>
    </Form>
  )
}

const SettingsTabs = () => {
  return (
    <Card style={{ maxWidth: 600 }}>
      <Tabs
        type="card"
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Change Password',
            children: <ChangePasswordForm />,
          },
          {
            key: '2',
            label: 'Profile Info',
            children: <div>Profile info content goes here.</div>,
          },
          {
            key: '3',
            label: 'Notifications',
            children: <div>Notification settings content goes here.</div>,
          },
        ]}
      />
    </Card>
  )
}

export default SettingsTabs
