import { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportEmployeeMaster, fetchApplicabilityMaster } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import ApplicabilityUploader from './ApplicabilityUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const ApplicabilityMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile columns - ALL in one row with YES/NO
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'e_CODE',
      width: 70, // Reduced from 100
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'PF',
      dataIndex: 'pF_APPLICABLE',
      width: 50,
      render: (val) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            textAlign: 'center',
            color: val === true ? '#52c41a' : '#ff4d4f',
          }}
        >
          {val === true ? 'YES' : 'NO'}
        </div>
      ),
    },
    {
      title: 'EPS',
      dataIndex: 'epS_APPLICABLE',
      width: 50,
      render: (val) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            textAlign: 'center',
            color: val === true ? '#52c41a' : '#ff4d4f',
          }}
        >
          {val === true ? 'YES' : 'NO'}
        </div>
      ),
    },
    {
      title: 'P-TAX',
      dataIndex: 'ptaX_APPLICABLE',
      width: 55,
      render: (val) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            textAlign: 'center',
            color: val === true ? '#52c41a' : '#ff4d4f',
          }}
        >
          {val === true ? 'YES' : 'NO'}
        </div>
      ),
    },
    {
      title: 'ESIC',
      dataIndex: 'esiC_APPLICABLE',
      width: 55,
      render: (val) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            textAlign: 'center',
            color: val === true ? '#52c41a' : '#ff4d4f',
          }}
        >
          {val === true ? 'YES' : 'NO'}
        </div>
      ),
    },
    {
      title: 'ExDay',
      dataIndex: 'extrA_DAY_APPLICABLE',
      width: 55,
      render: (val) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            textAlign: 'center',
            color: val === true ? '#52c41a' : '#ff4d4f',
          }}
        >
          {val === true ? 'YES' : 'NO'}
        </div>
      ),
    },
  ]

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchApplicabilityMaster()

      if (response.status === 200) {
        setTotalCount(response?.totalRecords)
        setEmployeesListData(response?.data?.data)
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
      message.error(error?.response?.data?.message || 'Error fetching applicability data')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // useEffect(() => {
  //   const new_search = search?.trim().toLowerCase()

  //   if (new_search.length > 0) {
  //     const new_data =
  //       employeesListData.filter((dt) =>
  //         Object.values(dt).some((val) => String(val).toLowerCase().includes(new_search)),
  //       ) || []

  //     setTotalCount(new_data.length)
  //     setFilteredData(new_data)
  //   } else {
  //     setTotalCount(employeesListData.length)
  //     setFilteredData(employeesListData)
  //   }
  // }, [search, employeesListData])

  useEffect(() => {
    const new_search = (search || '').trim().toLowerCase()

    const normalize = (val) => {
      if (val === null || val === undefined) return ''
      if (typeof val === 'boolean') return val ? 'yes' : 'no' // boolean -> yes/no
      if (typeof val === 'number') {
        if (val === 1) return 'yes' // if you store booleans as 1/0
        if (val === 0) return 'no'
        return String(val)
      }
      if (typeof val === 'string') {
        const s = val.trim().toLowerCase()
        if (s === 'true') return 'yes' // handle 'true'/'false' strings
        if (s === 'false') return 'no'
        return s
      }
      // fallback (objects, arrays, dates, ...)
      try {
        return String(val).toLowerCase()
      } catch {
        return ''
      }
    }

    if (new_search.length > 0) {
      const new_data =
        employeesListData.filter((dt) =>
          Object.values(dt).some((val) => normalize(val).includes(new_search)),
        ) || []

      setTotalCount(new_data.length)
      setFilteredData(new_data)
    } else {
      setTotalCount(employeesListData.length)
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'PF Applicable',
      dataIndex: 'pF_APPLICABLE',
      key: 'pF_APPLICABLE',
      width: 150,
      render: (val) => (val === true ? 'YES' : 'NO'),
    },
    {
      title: 'EPS Applicable',
      dataIndex: 'epS_APPLICABLE',
      key: 'epS_APPLICABLE',
      width: 150,
      render: (val) => (val === true ? 'YES' : 'NO'),
    },
    {
      title: 'P-TAX Applicable',
      dataIndex: 'ptaX_APPLICABLE',
      key: 'ptaX_APPLICABLE',
      width: 150,
      render: (val) => (val === true ? 'YES' : 'NO'),
    },
    {
      title: 'ESIC Applicable',
      dataIndex: 'esiC_APPLICABLE',
      key: 'esiC_APPLICABLE',
      width: 150,
      render: (val) => (val === true ? 'YES' : 'NO'),
    },
    {
      title: 'Extra Day Applicable',
      dataIndex: 'extrA_DAY_APPLICABLE',
      key: 'extrA_DAY_APPLICABLE',
      width: 150,
      render: (val) => (val === true ? 'YES' : 'NO'),
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Applicability Master Uploader" />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          totalRecords={totalCount}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          search={search}
          actionsMap={actionsMap}
          filteredData={filteredData}
        />
        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
            columns={mobileColumns}
            dataSource={filteredData}
            bordered
            size="small"
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            scroll={{ x: 'max-content' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        ) : (
          <Table
            rowKey="storeBudgetId"
            columns={columns}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            dataSource={filteredData}
            bordered={true}
            scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        )}
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  filteredData,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
    { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue', id: [7] },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Pending Interview Schedule',
        count: totalRecords,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [totalRecords])

  const downloadStoreDataAsExcel = async ({ isActive, allEmployee, companyId, lodingLocal }) => {
    try {
      setlodingLocal(true)
      toast.info('Export is in queue, you will get an alert once the download is completed')
      const { data, status } = await exportEmployeeMaster({ isActive, allEmployee, companyId })

      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Employee_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
      }
    } catch (error) {
      console.error('api eror', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <>
      {isEmpUploadVisible && (
        <ApplicabilityUploader
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
        <Space>
          {statusSummary.map(({ name, label, count, color, id }, index) => (
            <div
              key={index}
              style={{
                border: '2px solid #ccc',
                padding: 3,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
              onClick={() => {
                filterByStatus(id)
              }}
              className={theme === 'dark' ? 'dark-theme' : ''}
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
        </Space>
        <Row>
          <Col>
            {actionsMap?.upload?.actionStatus && (
              <Tooltip placement="top" title={'Upload Applicability Master'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            )}
          </Col>
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={isMobile ? { width: 150, marginLeft: 5 } : { width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default ApplicabilityMaster
