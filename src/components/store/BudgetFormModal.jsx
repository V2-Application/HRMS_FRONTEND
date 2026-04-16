import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
import { submitBudgetData } from '../../services/Services'
import { useSelector } from 'react-redux'

const BudgetFormModal = ({
  isBudgetFormModalOpen,
  setIsBudgetFormModalOpen,
  budgetHistoryData,
  fetchData,
}) => {
  const [form] = Form.useForm()
  const { Designation } = useSelector((state) => state?.dropdown.response || {})
  const [budgetList, setBudgetList] = useState([
    {
      designation: '',
      manPowerCount: '',
      designationId: '',
      budgetAmount: '',
      storeBudgetId: '',
      storeLocationsId: '',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (budgetHistoryData?.length > 0) {
      const mappedData = budgetHistoryData.map((item) => ({
        designation: item.designationName,
        manPowerCount: item.budgetManpowerCount,
        designationId: item.designationId,
        budgetAmount: item.budgetAmount,
        storeBudgetId: item?.storeBudgetId,
      }))
      setBudgetList(mappedData)

      form.setFieldsValue({
        budget: mappedData.map((item) => ({
          designation: item.designationId,
          manPowerCount: item.manPowerCount,
          budgetAmount: item.budgetAmount,
          storeBudgetId: item?.storeBudgetId,
          storeLocationsId: item?.storeLocationsId,
        })),
      })
    }
  }, [budgetHistoryData, form])

  const addMoreBudget = () => {
    const newBudget = { designation: '', manPowerCount: '', designationId: '' }
    setBudgetList((prev) => [newBudget, ...prev])
    const currentValues = form.getFieldValue('budget') || []
    form.setFieldsValue({
      budget: [{ designation: '', manPowerCount: '' }, ...currentValues],
    })
  }

  const handleBudgetDataChange = (field, value, index) => {
    const updatedData = [...budgetList]
    if (field === 'designationId') {
      const selectedDesignation = Designation.find((d) => d.designationId === value)
      updatedData[index] = {
        ...updatedData[index],
        designationId: value,
        designation: selectedDesignation?.designationName || '',
      }
    } else {
      updatedData[index] = { ...updatedData[index], [field]: value }
    }
    setBudgetList(updatedData)

    const currentValues = form.getFieldValue('budget') || []
    currentValues[index] = { ...currentValues[index], [field]: value }
    form.setFieldsValue({ budget: currentValues })
  }

  const handleRemove = (index) => {
    const updatedData = [...budgetList]
    updatedData.splice(index, 1)
    setBudgetList(updatedData)

    const currentFormValues = form.getFieldsValue('budget')?.budget || []
    const updatedFormValues = [...currentFormValues]
    updatedFormValues.splice(index, 1)
    form.setFieldsValue({ budget: updatedFormValues })
  }

  const handleOk = async () => {
    setIsLoading(true)
    try {
      const values = await form.validateFields()
      const storeLocationsId = budgetHistoryData?.[0]?.storeLocationsId || 0

      const result = values.budget.map((item, index) => ({
        storeBudgetId: budgetList[index]?.storeBudgetId || 0,
        storeLocationsId: storeLocationsId,
        designationId: item.designation,
        designationName:
          Designation.find((d) => d.designationId === item.designation)?.designationName || '',
        budgetManpowerCount: parseInt(item.manPowerCount) || 0,
        budgetAmount: parseInt(item.budgetAmount) || 0,
      }))

      const response = await submitBudgetData(result)

      if (response.status === 200) {
        message.success('Budget updated successfully')
        setIsBudgetFormModalOpen(false)
        form.resetFields()
        fetchData()
      }
    } catch (error) {
      console.error('Error during form submission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Modal
        title="Budget Form"
        open={isBudgetFormModalOpen}
        onOk={handleOk}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsBudgetFormModalOpen(false)
          form.resetFields()
          setSearchTerm('')
        }}
        maskClosable={false}
        width="90vw"
        styles={{
          body: {
            maxHeight: '70vh',
            overflowY: 'auto',
          },
        }}
      >
        <Row justify="space-between" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Input.Search
              placeholder="Search by designation"
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={addMoreBudget}>
              Add More
            </Button>
          </Col>
        </Row>

        <Form layout="vertical" form={form}>
          {budgetList
            .map((budget, index) => ({ ...budget, originalIndex: index }))
            .filter((budget) => budget.designation?.toLowerCase().includes(searchTerm))
            .map((budget, filteredIndex) => {
              const index = budget.originalIndex
              return (
                <Row gutter={[16, 16]} key={index}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['budget', index, 'designation']}
                      label="Designation"
                      rules={[{ required: true, message: 'Please select a designation' }]}
                    >
                      <Select
                        value={budget?.designationId}
                        onChange={(value) => handleBudgetDataChange('designationId', value, index)}
                        placeholder="Select a designation"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {Designation.filter((desg) => {
                          const isSelectedInOtherRows = budgetList.some(
                            (item, i) => item.designationId === desg.designationId && i !== index,
                          )
                          return (
                            !isSelectedInOtherRows || desg.designationId === budget?.designationId
                          )
                        }).map((desg, idx) => (
                          <Select.Option value={desg.designationId} key={idx}>
                            {desg.designationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['budget', index, 'manPowerCount']}
                      label="Man Power"
                      rules={[
                        { required: true, message: 'Please enter man power-count' },
                        { pattern: /^\d+$/, message: 'Only numbers are allowed' },
                      ]}
                    >
                      <Input
                        value={budget?.manPowerCount}
                        onChange={(e) =>
                          handleBudgetDataChange('manPowerCount', e.target.value, index)
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['budget', index, 'budgetAmount']}
                      label="Budget Amount"
                      rules={[
                        { required: true, message: 'Please enter budget amount' },
                        { pattern: /^\d+$/, message: 'Only numbers are allowed' },
                      ]}
                    >
                      <Input
                        value={budget?.budgetAmount}
                        onChange={(e) =>
                          handleBudgetDataChange('budgetAmount', e.target.value, index)
                        }
                      />
                    </Form.Item>
                  </Col>

                  {budgetList.length > 1 && !budget.storeBudgetId && (
                    <Col xs={24} sm={12} md={2} style={{ display: 'flex', alignItems: 'center' }}>
                      <MinusCircleOutlined
                        style={{ fontSize: '18px', color: 'red', cursor: 'pointer' }}
                        onClick={() => handleRemove(index)}
                      />
                    </Col>
                  )}
                </Row>
              )
            })}
        </Form>
      </Modal>
    </>
  )
}

export default BudgetFormModal
