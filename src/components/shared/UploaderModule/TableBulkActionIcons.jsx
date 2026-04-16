import { UploadOutlined } from '@ant-design/icons'
import { Button, Col, Input, Row, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
const { Search } = Input

const TableBulkActionIcons = ({ totalRecords, search, setSearch, refreshData }) => {
  const dispatch = useDispatch()
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
  ])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    ;[
      setstatusSummary([
        {
          name: 'Total Rows',
          label: 'Pending Interview Schedule',
          count: totalRecords,
          color: 'green',
          id: [1, 2, 3, 4, 5],
        },
      ]),
    ]
  }, [totalRecords])

  return (
    <>
      {isEmpUploadVisible && (
        <GivenToBankUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}

      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {statusSummary.map(({ name, label, count, color, id }, index) => (
            <div
              key={index}
              style={{
                border: '2px solid #ccc',
                padding: 3,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
                maxWidth: 120,
              }}
            >
              {name === 'Total Rows' || name === 'Selected Rows' ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontSize: 12,
                    padding: '0 8px',
                  }}
                >
                  {count} {name}
                </span>
              ) : (
                <Tooltip placement="top" title={label}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '100%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      fontSize: 12,
                      padding: '0 8px',
                    }}
                  >
                    {count} {name}
                  </span>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
        <Row>
          <Col>
            <Tooltip placement="top" title={'Upload Employees'}>
              <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          </Col>
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default TableBulkActionIcons
