import { Button, message, Modal, Table } from 'antd'
import { TableOutlined } from '@ant-design/icons'
import { useState } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { useSelector } from 'react-redux'

function camelCaseToTitle(str) {
  return str
    .replace(/([A-Z])/g, ' $1') // add space before capitals
    .replace(/^./, (char) => char.toUpperCase()) // capitalize first char
}

function getTableColumns(data) {
  if (data && Array.isArray(data) && data.length) {
    const columns = Object.keys(data[0]).map((item) => {
      return {
        title: camelCaseToTitle(item),
        dataIndex: item,
        key: item,
        width: '150px',
      }
    })
    return columns
  }
  return []
}

async function fetchShortListedList(employeeId) {
  console.log(employeeId)
  try {
    const response = await axiosInstance.get('/api/Applicant/GetApplicantAssignDetails')
    const data = response?.data
    if (data && Array.isArray(data) && data.length) {
      const datafilteredByEmployee = data.filter((item) => {
        return item?.assignBy?.includes(`${employeeId}`)
      })
      const columns = getTableColumns([datafilteredByEmployee[0]])
      if (!columns) {
        return {
          columns: [],
          dataSource: [],
        }
      } else {
        datafilteredByEmployee.map((item, index) => {
          item.key = index + 1
          return item
        })
        return {
          columns,
          dataSource: datafilteredByEmployee,
        }
      }
    } else {
      message.error('No data found.')
      return {
        columns: [],
        dataSource: [],
      }
    }
  } catch (error) {
    message.error(error?.response?.data?.message || 'Error fetching data. Please Try again.')
    console.error(error)
    return {
      columns: [],
      dataSource: [],
    }
  }
}

const ShortListedApplicantListModal = () => {
  const { employeeId } = useSelector((state) => state.auth.data)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tblDataSource, setTblDataSource] = useState([])
  const [tblColumns, setTblColumns] = useState([])
  const [loading, setLoading] = useState(true)

  const showModal = () => {
    setIsModalOpen(true)
  }

  async function handleModalStateChange(open) {
    if (open) {
      const { columns, dataSource } = await fetchShortListedList(employeeId)
      setTblColumns(columns)
      setTblDataSource(dataSource)
      setLoading(false)
    } else {
      setTblDataSource([])
      setTblColumns([])
      setLoading(true)
    }
  }

  function handleCancel() {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button color="primary" variant="filled" onClick={showModal}>
        <TableOutlined />
        Show Scheduled
      </Button>
      <Modal
        title={
          <div>
            <p style={{ margin: '0', fontWeight: '700', fontSize: '1.5rem' }}>Scheduled List</p>
            <p style={{ fontWeight: '400', color: '0.8', marginBottom: '0', fontSize: '.875rem' }}>
              List of applicants that you have scheduled for an interview.
            </p>
          </div>
        }
        closable={{ 'aria-label': 'Modal Close Button' }}
        onCancel={handleCancel}
        open={isModalOpen}
        footer={[]}
        width={'100%'}
        afterOpenChange={handleModalStateChange}
        bodyStyle={{
          overflowY: 'auto',
        }}
        loading={loading}
      >
        <div style={{ width: '100%' }}>
          <Table
            bordered={true}
            dataSource={tblDataSource}
            columns={tblColumns}
            scroll={{ x: 'max-content', y: '80vh' }}
          />
        </div>
      </Modal>
    </>
  )
}
export default ShortListedApplicantListModal
