import React, { useMemo, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button } from 'antd'
import { ImportOutlined, ExportOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
const { Search } = Input

const MasterTable = ({
  title,
  columns,
  dataSource,
  columnWidthsPercent,
  rowKey = 'id',
  showImport = true,
  showExport = true,
  showApproval = true,
  showSearch = true,
  showStatusSummary = false,
  statusSummary = [],
  onRowSelection,
  onImport,
  onExport,
  onApproval,
  customActions = [],
  pageSizeOptions = ['10', '15', '20', '50', '100'],
  defaultPageSize = '100',
  bordered = true,
  loading = false,
  pagination = true,
  ...tableProps
}) => {
  const [selectionType, setSelectionType] = useState('checkbox')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      if (onRowSelection) {
        onRowSelection(selectedRowKeys, selectedRows)
      }
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div style={{ paddingBottom: 10, width: '100%' }}>
        <Table
          title={title}
          // rowSelection={{
          //   type: selectionType,
          //   ...rowSelection,
          // }}
          columns={columns}
          dataSource={dataSource}
          rowKey={rowKey}
          pagination={pagination}
          bordered={bordered}
          loading={loading}
          style={{ width: '100%' }}
          position={['bottomRight']}
          {...tableProps}
          scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
        />
      </div>
    </>
  )
}

export default MasterTable
