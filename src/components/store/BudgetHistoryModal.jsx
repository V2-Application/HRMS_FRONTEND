import React, { useEffect, useState } from 'react'
import { Input, Modal, Table } from 'antd'
import './BudgetHistoryModal.css' // ⬅️ import custom CSS for hiding scroll

const BudgetHistoryModal = ({
  isBudgetHistoryModalOpen,
  setIsBudgetHistoryModalOpen,
  budgetHistoryData = [],
  fetchData,
}) => {
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    if (isBudgetHistoryModalOpen) {
      fetchData()
    }
  }, [isBudgetHistoryModalOpen])

  useEffect(() => {
    setFilteredData(budgetHistoryData)
  }, [budgetHistoryData])

  useEffect(() => {
    const lowerText = searchText.toLowerCase()
    const filtered = budgetHistoryData.filter((item) =>
      item.designationName?.toLowerCase().includes(lowerText),
    )
    setFilteredData(filtered)
  }, [searchText, budgetHistoryData])

  const columns = [
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      render: (text) => text || '-',
    },
    {
      title: 'Man Power',
      dataIndex: 'budgetManpowerCount',
      key: 'budgetManpowerCount',
      render: (text) => (text !== undefined && text !== null ? text : '-'),
    },
    {
      title: 'Budget Amount',
      dataIndex: 'budgetAmount',
      key: 'budgetAmount',
      render: (text) => (text !== undefined && text !== null ? text : '-'),
    },
  ]

  return (
    <Modal
      title="Budget History"
      centered
      open={isBudgetHistoryModalOpen}
      onCancel={() => setIsBudgetHistoryModalOpen(false)}
      maskClosable={false}
      width="90vw"
      footer={null}
      bodyStyle={{
        padding: 16,
        maxHeight: '70vh',
        overflowY: 'auto',
      }}
      className="hide-scrollbar" // ⬅️ Apply custom class
    >
      <Input.Search
        placeholder="Search by Designation"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={false}
        scroll={{ x: 600,  }}
        rowKey={(record, index) => `${record.designationId}-${index}`}
      />
    </Modal>
  )
}

export default BudgetHistoryModal
