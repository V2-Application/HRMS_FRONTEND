import { Space, Table, Input, Button } from 'antd'
const { Search } = Input
import { columns, ttlWidth } from './LWFMasterColumns'
import { useState } from 'react'
import LWFMasterUploader from './LWFMasterUploader'
import { UploadOutlined } from '@ant-design/icons'

const LWFMaster = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)

  const fetchData = () => {}

  return (
    <>
      <LWFMasterUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
        }}
      >
        <Button onClick={() => setIsUploaderOpen(true)}>
          <UploadOutlined />
        </Button>
        <Search placeholder="Search in table..." />
      </Space>
      <Table columns={columns} scroll={{ x: ttlWidth }} />
    </>
  )
}

export default LWFMaster
