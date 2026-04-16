// Line 1 - Update imports
import { Button, message, Modal, Space, Table, Row, Col } from 'antd' // ADD Row, Col
import React, { useEffect, useRef, useState, useCallback } from 'react' // ADD useCallback
import { deleteJD, fetchJDs, upsertJDForm } from '../../services/Services'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  MinusOutlined, // ADD THIS
} from '@ant-design/icons'
import JDForm from './JDForm'
import axios from 'axios'
import { useActionsMap } from '../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import useMediaQuery from '../../hooks/useMediaQuery' // ADD THIS (adjust path)

const JDList = () => {
  const [data, setData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(null)
  const deletePopupRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 768px)') // ADD THIS
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('actionsMap jd:', actionsMap)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetchJDs()
      console.log('response:', response)

      if (response?.status === 200) {
        setData(response?.data?.data)
      } else {
        message.error(response?.response?.data?.message || 'Error fetching data')
      }
    } catch (error) {
      message.error('Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddNew = () => {
    setEditingRecord(null)
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setIsModalVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this job description?',
      content: `Designation: ${record.designationName}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        // Implement delete API call here
        message.success('Job description deleted successfully')
        fetchData() // Refresh the data
      },
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingRecord(null)
  }

  const handleFormSubmit = async (values) => {
    setSubmitLoading(true)

    const response = await upsertJDForm([values])
    console.log('response:', response)

    if (response?.status === 200) {
      setIsModalVisible(false)
      fetchData()
    } else {
      message.error(response?.response?.data?.message || 'Error in submitting form')
    }

    setSubmitLoading(false)
  }

  const handleDeleteRow = async (record) => {
    const response = await deleteJD(record?.jdId)
    console.log('respons:', response)

    if (response?.status === 200) {
      fetchData()
    } else {
      message.error(response?.response?.data?.message || 'Error in deleting')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(null)
  }

  const handleDeleteClick = (row) => {
    setDeleteConfirmationOpen(row?.jdId)
  }

  const columns = [
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
    },
    {
      title: 'Key Responsibilities',
      dataIndex: 'keyResponsibility',
      key: 'keyResponsibility',
      width: 300,
      render: (text) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
    },
    {
      title: 'Key Skills',
      dataIndex: 'keySkills',
      key: 'keySkills',
      width: 300,
      render: (text) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (_, record) => {
        const isDeleteConfirmOpen = deleteConfirmationOpen === record?.jdId

        return (
          <Space style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }} ref={isDeleteConfirmOpen ? deletePopupRef : null}>
              {actionsMap?.delete?.actionStatus && (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteClick(record)}
                  danger
                  title="Delete"
                />
              )}

              {isDeleteConfirmOpen && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: '0px',
                    right: '45px', // Position to the left of the delete button
                    backgroundColor: '#ffffff',
                    padding: '8px',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e5e7eb',
                    minWidth: '80px',
                  }}
                >
                  <span style={{ fontSize: '15px', color: '#595959', whiteSpace: 'nowrap' }}>
                    Delete?
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleDeleteRow(record)}
                    style={{
                      color: '#52c41a',
                      padding: '2px 4px',
                      minWidth: '24px',
                      height: '24px',
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={handleDeleteCancel}
                    style={{
                      color: '#ff4d4f',
                      padding: '2px 4px',
                      minWidth: '24px',
                      height: '24px',
                    }}
                  />
                </div>
              )}
            </div>

            {actionsMap?.edit?.actionStatus && (
              <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} title="Edit" />
            )}
          </Space>
        )
      },
    },
  ]

  // const fetch = async () => {
  //   const response = await axios.get(
  //     'https://crm.v2retail.com:9543/Overview/GetCustomerLoyaltyIndicators/9971168410',
  //   )
  //   console.log('response nikhil sir:', response)
  // }

  // useEffect(() => {
  //   fetch()
  // }, [])

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        {actionsMap?.addnew?.actionStatus && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Add New JD
          </Button>
        )}
      </div>

      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="jdId"
          loading={loading}
          scroll={{ x: 950 }}
        />
      ) : (
        <div>
          <div
            style={{
              backgroundColor: '#fafafa',
              borderRadius: '8px 8px 0 0',
              border: '1px solid #d9d9d9',
              borderBottom: '2px solid #1890ff',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <table
              style={{
                width: '100%',
                tableLayout: 'fixed',
                borderCollapse: 'collapse',
                fontSize: 11,
              }}
            >
              <colgroup>
                <col style={{ width: '50%' }} />
                <col style={{ width: '50%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    Designation
                  </th>
                  <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {data.map((record) => {
            const isExpanded = expandedCards[record.jdId]
            const isDeleteConfirmOpen = deleteConfirmationOpen === record?.jdId

            return (
              <div
                key={record.jdId}
                style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
              >
                <table
                  style={{
                    width: '100%',
                    tableLayout: 'fixed',
                    borderCollapse: 'collapse',
                    fontSize: 11,
                  }}
                >
                  <colgroup>
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '50%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          fontSize: 10,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {record.designationName || '-'}
                      </td>
                      <td
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          display: 'flex',
                          gap: 4,
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        <Space size="small">
                          {actionsMap?.delete?.actionStatus && (
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteClick(record)}
                              danger
                              size="small"
                            />
                          )}
                          {actionsMap?.edit?.actionStatus && (
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(record)}
                              size="small"
                            />
                          )}
                        </Space>
                        <Button
                          type="text"
                          size="small"
                          icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                          onClick={() => handleToggleCard(record.jdId)}
                          style={{ padding: '2px 4px', fontSize: 10 }}
                        />

                        {isDeleteConfirmOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              zIndex: 1000,
                              top: '0px',
                              right: '45px',
                              backgroundColor: '#ffffff',
                              padding: '8px',
                              display: 'flex',
                              gap: '6px',
                              alignItems: 'center',
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              border: '1px solid #e5e7eb',
                              minWidth: '80px',
                            }}
                          >
                            <span
                              style={{ fontSize: '13px', color: '#595959', whiteSpace: 'nowrap' }}
                            >
                              Delete?
                            </span>
                            <Button
                              type="text"
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={() => handleDeleteRow(record)}
                              style={{
                                color: '#52c41a',
                                padding: '2px 4px',
                                minWidth: '24px',
                                height: '24px',
                              }}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={handleDeleteCancel}
                              style={{
                                color: '#ff4d4f',
                                padding: '2px 4px',
                                minWidth: '24px',
                                height: '24px',
                              }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {isExpanded && (
                  <div
                    style={{
                      padding: 8,
                      background: '#fafafa',
                      borderTop: '1px solid #e8e8e8',
                      fontSize: 10,
                    }}
                  >
                    <Row gutter={[4, 6]}>
                      <Col span={24}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 9,
                            textAlign: 'center',
                          }}
                        >
                          Key Responsibilities
                        </div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 9,
                            whiteSpace: 'pre-wrap',
                            textAlign: 'center',
                          }}
                        >
                          {record.keyResponsibility || '-'}
                        </div>
                      </Col>
                      <Col span={24}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 9,
                            textAlign: 'center',
                          }}
                        >
                          Key Skills
                        </div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 9,
                            whiteSpace: 'pre-wrap',
                            textAlign: 'center',
                          }}
                        >
                          {record.keySkills || '-'}
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        title={editingRecord ? 'Edit Job Description' : 'Add New Job Description'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
        style={{ maxHeight: '80vh' }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}
        destroyOnClose
      >
        <JDForm initialValues={editingRecord} onFinish={handleFormSubmit} loading={submitLoading} />
      </Modal>
    </div>
  )
}

export default JDList
