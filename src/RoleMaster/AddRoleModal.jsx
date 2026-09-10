import { Alert, Col, Form, Input, message, Modal, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { createRole, updateRole } from '../services/Services'

/**
 * Create or edit a role. Same shape as the Shift Master modal so the two
 * master pages feel identical.
 */
const AddRoleModal = ({ isModalOpen, setIsModalOpen, refreshData, editingRole }) => {
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = !!editingRole

  useEffect(() => {
    if (isModalOpen && editingRole) {
      form.setFieldsValue({
        roleName: editingRole?.roleName,
        description: editingRole?.description,
        isActive: editingRole?.isActive ?? true,
      })
    } else if (isModalOpen && !editingRole) {
      form.resetFields()
      form.setFieldsValue({ isActive: true })
    }
  }, [editingRole, isModalOpen, form])

  const handleOk = () => form.submit()

  const handleCancel = () => {
    form.resetFields()
    setIsModalOpen(false)
  }

  const handleFinish = async (values) => {
    const roleId = editingRole?.roleId

    if (isEdit && typeof roleId !== 'number') {
      message.error('Invalid operation!')
      return false
    }

    const payload = {
      roleName: values.roleName?.trim(),
      description: values.description?.trim() || null,
      isActive: values.isActive ?? true,
      ...(isEdit && { roleId }),
    }

    try {
      setIsLoading(true)

      const response = isEdit ? await updateRole(payload, roleId) : await createRole(payload)

      if (response.status === 200) {
        message.success(
          response.data?.message || `Role ${isEdit ? 'updated' : 'created'} successfully`,
        )
        form.resetFields()
        setIsModalOpen(false)
        await refreshData()
      }
    } catch (error) {
      // model-validation failures come back as { errors: { Field: [msg] } } with
      // no `message`, so read both or the real reason is swallowed
      const data = error?.response?.data
      const fieldError = data?.errors ? Object.values(data.errors).flat()[0] : null

      message.error(
        data?.message || fieldError || `Error in ${isEdit ? 'updating' : 'creating'} role`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Role' : 'Create Role'}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      <Form
        name="createRole"
        autoComplete="off"
        layout="vertical"
        form={form}
        onFinish={handleFinish}
      >
        <Col span={24}>
          <Form.Item
            label="Role Name"
            name="roleName"
            rules={[
              { required: true, message: 'Role name is required' },
              { max: 100, message: 'Role name cannot exceed 100 characters' },
            ]}
          >
            <Input placeholder="e.g. Attendance HR" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
          >
            <Input.TextArea rows={3} placeholder="What is this role for?" maxLength={500} />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Col>

        {isEdit && (editingRole?.employeeCount > 0 || editingRole?.candidateCount > 0) && (
          <Alert
            type="info"
            showIcon
            message={`${editingRole?.employeeCount ?? 0} employee(s) and ${
              editingRole?.candidateCount ?? 0
            } candidate(s) carry this role`}
            description="They store the role id, not its text, so a rename simply shows the new name everywhere."
          />
        )}
      </Form>
    </Modal>
  )
}

export default AddRoleModal
