import React, { useEffect, useRef, useState } from 'react'
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  message,
  Dropdown,
  Checkbox,
  Popconfirm,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExportOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportEmployeeMaster,
  fetchBgtSeatMaster,
  fetchPaidByBank,
  fetchPayroll,
  fetchWeeklyOffPolicy,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import BgtSeatUploader from './BgtSeatUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import axiosInstance from '../../services/axiosInstance'
import { createFilterWorker } from '../../utils/createFilterWorker'

const { Search } = Input

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || []) // Temporary storage for selected checkboxes

  const filteredOptions = dataList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleChange = (checkedValues) => {
    setSelectedOptions(checkedValues) // Update temporary selection without applying filter
  }

  const handleFilter = () => {
    setFilterValues(selectedOptions) // Apply the selected options to filterValues
    confirm() // Trigger the table to apply the filter
  }

  const handleReset = () => {
    setSelectedOptions([]) // Clear temporary selection
    setFilterValues([]) // Clear filter values
    setSearchText('')
    confirm() // Trigger the table to reset the filter
  }

  return (
    <div style={{ padding: 8, width: 215 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />

      <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={selectedOptions} // Use temporary selection
          onChange={handleChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Space style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={handleFilter}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

const BgtSeatMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [searchTerm, setSerachTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)
  const [locCodeFilterValues, setLocCodeFilterValues] = useState([])
  const [deptNameValues, setDeptNameValues] = useState([])
  const [desgNameValues, setDesgNameValues] = useState([])
  const [seatMasterValues, setSeatMasterValues] = useState([])
  const [salaryBgtValues, setSalaryBgtValues] = useState([])
  const [salaryActValues, setSalaryActValues] = useState([])
  const [empCodeValues, setEmpCodeValues] = useState([])
  const [empNameValues, setEmpNameValues] = useState([])
  const data = useSelector((state) => state?.auth?.data)
  const { locationList } = data || {}

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(null)
  const deletePopupRef = useRef(null)

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchBgtSeatMaster()

      if (response.status === 200) {
        const records = response?.data?.data || []
        setEmployeesListData(records)
        setTotalCount(records?.length)

        // if (Array.isArray(locationList) && locationList.length > 0) {
        //   const records = response?.data?.data || []

        //   const stCodes = locationList.map((loc) => String(loc?.stCode).trim().toLowerCase())
        //   const filteredWithStCodes =
        //     records?.filter((rec) => stCodes.includes(String(rec?.stCode).trim().toLowerCase())) ||
        //     []
        //   setEmployeesListData(filteredWithStCodes || [])
        //   setTotalCount(filteredWithStCodes?.length)
        // }
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [locationList])

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(null)
  }

  const handleDeleteClick = (row) => {
    setDeleteConfirmationOpen(row?.id)
  }

  // delete row
  const handleDeleteRow = async (record) => {
    try {
      const payload = {
        locCode: record?.stCode,
        deptSno: record?.departmentId,
        desgSno: record?.designationId,
        deleteCount: 1,
      }

      const response = await axiosInstance.get(`/api/BgtSeatMaster/DeleteBySeries`, payload)
      console.log('response: ', response)

      if (response?.status === 200) {
        message.success(response?.data?.message || 'Deleted successfully')
        fetchData()
      }
    } catch (error) {
      console.error('error deleting bgt seat: ', error)
      message.error(error?.response?.data?.message || 'Error deleting bgt seat')
    }
  }

  const columns = [
    {
      title: 'Loc Code',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 120,
      filteredValue: locCodeFilterValues?.length ? locCodeFilterValues : null,
      onFilter: (value, record) => locCodeFilterValues?.includes(record?.stCode),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Loc Code"
          dataIndex="stCode"
          dataList={[...new Set(employeesListData?.map((item) => item?.stCode))]}
          filterValues={locCodeFilterValues}
          setFilterValues={setLocCodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    // {
    //   title: 'Desg No.',
    //   dataIndex: 'designationId',
    //   key: 'designationId',
    //   width: 100,
    //   ellipsis: true,
    // },
    {
      title: 'Desg Name',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
      ellipsis: true,
      filteredValue: desgNameValues?.length ? desgNameValues : null,
      onFilter: (value, record) => desgNameValues?.includes(record?.designationName),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Desg Name"
          dataIndex="designationName"
          dataList={[...new Set(employeesListData?.map((item) => item?.designationName))]}
          filterValues={desgNameValues}
          setFilterValues={setDesgNameValues}
          confirm={confirm}
        />
      ),
    },
    // {
    //   title: 'Dept No.',
    //   dataIndex: 'departmentId',
    //   key: 'departmentId',
    //   width: 100,
    //   ellipsis: true,
    // },
    {
      title: 'Dept Name',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      ellipsis: true,
      filteredValue: deptNameValues?.length ? deptNameValues : null,
      onFilter: (value, record) => deptNameValues?.includes(record?.departmentName),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Dept Name"
          dataIndex="departmentName"
          dataList={[...new Set(employeesListData?.map((item) => item?.departmentName))]}
          filterValues={deptNameValues}
          setFilterValues={setDeptNameValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Seat Master No.',
      dataIndex: 'seatOrStatus',
      key: 'seatOrStatus',
      width: 120,
      ellipsis: true,
      // filteredValue: seatMasterValues?.length ? seatMasterValues : null,
      // onFilter: (value, record) => seatMasterValues?.includes(record?.seatOrStatus),
      // filterDropdown: ({ confirm }) => (
      //   <FilterDropdown
      //     title="Seat Master No."
      //     dataIndex="seatOrStatus"
      //     dataList={[...new Set(employeesListData?.map((item) => item?.seatOrStatus))]}
      //     filterValues={seatMasterValues}
      //     setFilterValues={setSeatMasterValues}
      //     confirm={confirm}
      //   />
      // ),
    },
    {
      title: 'Salary Bgt',
      dataIndex: 'salarY_BGT',
      key: 'salarY_BGT',
      width: 100,
      ellipsis: true,
      // filteredValue: salaryBgtValues?.length ? salaryBgtValues : null,
      // onFilter: (value, record) => salaryBgtValues?.includes(record?.salarY_BGT),
      // filterDropdown: ({ confirm }) => (
      //   <FilterDropdown
      //     title="Salary Bgt"
      //     dataIndex="salarY_BGT"
      //     dataList={[...new Set(employeesListData?.map((item) => item?.salarY_BGT))]}
      //     filterValues={salaryBgtValues}
      //     setFilterValues={setSalaryBgtValues}
      //     confirm={confirm}
      //   />
      // ),
    },
    {
      title: 'Salary Act.',
      dataIndex: 'actualSalary',
      key: 'actualSalary',
      width: 100,
      ellipsis: true,
      // onFilter: (value, record) => salaryActValues?.includes(record?.actualSalary),
      // filterDropdown: ({ confirm }) => (
      //   <FilterDropdown
      //     title="Salary Act"
      //     dataIndex="actualSalary"
      //     dataList={[...new Set(employeesListData?.map((item) => item?.actualSalary))]}
      //     filterValues={salaryActValues}
      //     setFilterValues={setSalaryActValues}
      //     confirm={confirm}
      //   />
      // ),
    },
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 100,
      ellipsis: true,
      // onFilter: (value, record) => empCodeValues?.includes(record?.ecode),
      // filterDropdown: ({ confirm }) => (
      //   <FilterDropdown
      //     title="Emp Code"
      //     dataIndex="ecode"
      //     dataList={[...new Set(employeesListData?.map((item) => item?.ecode))]}
      //     filterValues={empCodeValues}
      //     setFilterValues={setEmpCodeValues}
      //     confirm={confirm}
      //   />
      // ),
    },
    {
      title: 'Emp Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
      ellipsis: true,
      // onFilter: (value, record) => empNameValues?.includes(record?.fullName),
      // filterDropdown: ({ confirm }) => (
      //   <FilterDropdown
      //     title="Emp Name"
      //     dataIndex="fullName"
      //     dataList={[...new Set(employeesListData?.map((item) => item?.fullName))]}
      //     filterValues={empNameValues}
      //     setFilterValues={setEmpNameValues}
      //     confirm={confirm}
      //   />
      // ),
    },
    {
      title: 'Report Head Code',
      dataIndex: 'reportEcode',
      key: 'reportEcode',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Report Head Name',
      dataIndex: 'reportFullName',
      key: 'reportFullName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Report Mngr. Desg.',
      dataIndex: 'bgtReportingDesig',
      key: 'bgtReportingDesig',
      width: 150,
      ellipsis: true,
    },
    // {
    //   title: 'Report Mngr. Desg Act',
    //   dataIndex: 'actualReportingDesig',
    //   key: 'actualReportingDesig',
    //   width: 150,
    //   ellipsis: true,
    // },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      ellipsis: true,
      render: (val) => (val === true ? 'Yes' : 'No'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      ellipsis: true,
      render: (row, record, index) => {
        console.log('index:', index)
        const isDeleteConfirmOpen = deleteConfirmationOpen === row?.id

        return (
          <Space style={{ position: 'relative' }}>
            <Popconfirm
              title="Are you sure you want to delete this record?"
              onConfirm={() => handleDeleteRow(record)}
              okText="Yes"
              cancelText="No"
              placement="left"
            >
              <Button icon={<DeleteOutlined />} title="Delete Group" />
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    const new_search = search?.trim().toLowerCase()

    if (new_search.length > 0) {
      const new_data =
        employeesListData.filter((dt) =>
          Object.values(dt).some((val) => String(val).toLowerCase().includes(new_search)),
        ) || []

      setTotalCount(new_data.length)
      setFilteredData(new_data)
    } else {
      setTotalCount(employeesListData.length)
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Bgt Seat Master Uploader" />
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
          setimportExelModal={setimportExelModal}
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          actionsMap={actionsMap}
          filteredData={filteredData}
        />
        <Table
          rowKey="storeBudgetId"
          // rowSelection={{
          //   type: selectionType,
          //   ...rowSelection,
          // }}
          columns={columns}
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize: pageSize, // Set the number of items per page
            showSizeChanger: true, // Allow users to change page size
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={filteredData}
          bordered={true}
          scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          // expandable={{
          //   expandedRowRender: (record) => (<>
          //     <p style={{ margin: 0 }}> <span style={{fontWeight:700}}>keyResponsibility : </span><br/>{record.keyResponsibility || 'No keyResponsibility details'}</p>
          //     <p style={{ margin: 0 }}><span style={{fontWeight:700}}>keySkill : </span><br/>{record.keySkill || 'No keySkill details'}</p>
          //     </>
          //   ),
          //   rowExpandable: (record) => true, // or add conditions
          // }}
        />
      </div>
      {/* <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      /> */}
    </>
  )
}

const TableBulkActionIcons = ({
  setimportExelModal,
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  filteredData,
}) => {
  // console.log('>>>>>>>>>selectedRowKeys', selectedRowKeys);
  const dispatch = useDispatch()
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
    // { name: 'Completed', label: 'Completed', count: 15, color: 'red', id: [6] },
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
  }, [selectedRowKeys, totalRecords])
  const exportExcel = async () => {
    try {
      setlodingLocal(true)
      const response = await axiosInstance.get(`/api/BgtSeatMaster/GetAll?isExcel=true`, {
        responseType: 'blob',
      })

      const blob = new Blob([response?.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `BgtSeatMaster_${new Date().toISOString()}.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Error occured')
    } finally {
      setlodingLocal(false)
    }
  }

  const handleDownloadExcel = () => {
    exportExcelFromFrontend()
  }

  return (
    <>
      {/* {isEmpUploadVisible && (
        <EmployeesUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )} */}
      {isEmpUploadVisible && (
        <BgtSeatUploader
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
                // ✅ No tooltip
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
                // ✅ Tooltip for other statuses (if any)
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

        {/* <Space>
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
          >
            <Tooltip placement="top" title={label}>
              <span
                style={{
                  display: 'inline-block',
                  width: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 12,
                  padding: '0 8px', // Optional: adds some spacing inside
                }}
              >
                {count} {name}{' '}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space> */}
        <Row>
          <Col>
            {/* <Tooltip placement="top" title={'Send Email'} style={{ marginLeft: 5 }}>
            <Button
              onClick={() => {
                message.success('Email Sent Successfully')
              }}
            >
              <MailOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Add Candidate'}>
            <Link to={'/employee/add_new'} style={{ marginLeft: 5 }}>
              <Button>
                <PlusOutlined />
              </Button>
            </Link>
          </Tooltip> */}

            {/* <Tooltip placement="top" title={'Import'} >
            <Button style={{ marginLeft: 5 }} onClick={() => setimportExelModal(true)} disabled>
              <ImportOutlined />
            </Button>
          </Tooltip> */}
            {/* <Tooltip placement="top" title={'Export'}>
            <Button style={{ marginLeft: 5 }} onClick={downloadStoreDataAsExcel} >
              <ExportOutlined />
            </Button>
          </Tooltip> */}
            {actionsMap?.upload?.actionStatus && (
              <Tooltip placement="top" title={'Upload Bgt Seat Master'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal} onClick={exportExcel}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            )}
          </Col>
          <Search
            // placeholder="Search by name, role, or tags"
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            // onBlur={(e) => sessionStorage.setItem('employee-search', e.target.value)}
            style={{ width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default BgtSeatMaster

// BgtSeatMaster.jsx
/**
 * BgtSeatMaster.jsx — FINAL
 *
 * SUMMARY
 * -------
 * - API returns ~21k rows at once.
 * - We offload filtering, full-text search, sorting, pagination, and distinct-list building
 *   to a Web Worker thread to avoid UI freezes.
 * - We maintain TWO filter states:
 *    1) uiFilters (pending, edited in dropdown)
 *    2) appliedFilters (committed; the worker uses only this)
 * - Clicking Apply commits only that column's values -> sets page=1 -> worker re-queries.
 * - Clicking Reset clears only that column -> sets page=1 -> worker re-queries.
 *
 * This prevents the “blank table / one step behind / checkbox uncheck” issues.
 */

// import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
// import { Space, Table, Row, Input, Tooltip, Button, Col, message } from 'antd'
// import { ExportOutlined, UploadOutlined, FilterFilled } from '@ant-design/icons'
// import { ToastContainer } from 'react-toastify'
// import { useDispatch, useSelector } from 'react-redux'
// import { fetchBgtSeatMaster } from '../../services/Services'
// import { set } from '../../redux/uiSlice'
// import BgtSeatUploader from './BgtSeatUploader'
// import Pageheading from '../../components/shared/Pageheading'
// import { useActionsMap } from '../../utils/useActionsMap'
// import axiosInstance from '../../services/axiosInstance'

// const { Search } = Input

// /* -------------------------------------------------------------------------- */
// /*                              Debounce helper                               */
// /* -------------------------------------------------------------------------- */
// function useDebouncedValue(value, delay = 300) {
//   const [debounced, setDebounced] = useState(value)
//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(value), delay)
//     return () => clearTimeout(t)
//   }, [value, delay])
//   return debounced
// }

// /* -------------------------------------------------------------------------- */
// /*                       Controlled Filter Dropdown (UI)                      */
// /* -------------------------------------------------------------------------- */
// /**
//  * Controlled FilterDropdown (UI-only)
//  * - `selectedValues` comes from uiFilters (pending values).
//  * - `onChange(nextValues)` updates uiFilters for this column only.
//  * - `onApply()` commits uiFilters[key] into appliedFilters[key] (done by parent).
//  * - `onReset()` clears both uiFilters[key] and appliedFilters[key] (done by parent).
//  * - We stop event bubbling so clicking checkboxes doesn't close the popover.
//  */
// const FilterDropdown = ({
//   title,
//   dataList,
//   selectedValues,
//   onChange,
//   onApply,
//   onReset,
//   confirm,
// }) => {
//   const [searchText, setSearchText] = useState('')

//   const filteredOptions = useMemo(() => {
//     const q = searchText.toLowerCase()
//     return (dataList || []).filter((item) => String(item).toLowerCase().includes(q))
//   }, [dataList, searchText])

//   return (
//     <div
//       style={{ padding: 8, width: 240 }}
//       onMouseDown={(e) => e.stopPropagation()}
//       onClick={(e) => e.stopPropagation()}
//       onKeyDown={(e) => e.stopPropagation()}
//     >
//       <Input
//         placeholder={`Search ${title}`}
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         style={{ marginBottom: 8, display: 'block' }}
//       />

//       <div style={{ maxHeight: 180, overflowY: 'auto', paddingRight: 8 }}>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           {(filteredOptions || []).map((value) => (
//             <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <input
//                 type="checkbox"
//                 checked={selectedValues.includes(value)}
//                 onChange={(e) => {
//                   if (e.target.checked) onChange([...selectedValues, value])
//                   else onChange(selectedValues.filter((x) => x !== value))
//                 }}
//               />
//               <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <Space style={{ marginTop: 10 }}>
//         <Button
//           type="primary"
//           size="small"
//           onClick={() => {
//             onApply() // parent: commit uiFilters[key] -> appliedFilters[key], set page=1
//             confirm() // close popover
//           }}
//         >
//           Apply
//         </Button>
//         <Button
//           size="small"
//           onClick={() => {
//             onReset() // parent: clear both uiFilters[key] & appliedFilters[key], set page=1
//             setSearchText('')
//             confirm()
//           }}
//         >
//           Reset
//         </Button>
//       </Space>
//     </div>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                               Web Worker Code                              */
// /* -------------------------------------------------------------------------- */
// const WORKER_CODE = `
// self.onmessage = (e) => {
//   const { type, payload } = e.data;

//   const n = (v) => (v === null || v === undefined) ? '' : String(v).trim().toLowerCase();
//   const textIncludes = (value, q) => n(value).includes(q);

//   // record must match every non-empty list in filters
//   const passFilters = (rec, filters) => {
//     for (const key of Object.keys(filters)) {
//       const vals = filters[key] || [];
//       if (vals.length === 0) continue;
//       const rv = rec[key];
//       const rvn = n(rv);
//       let hit = false;
//       for (let i=0;i<vals.length;i++) {
//         if (rvn === n(vals[i])) { hit = true; break; }
//       }
//       if (!hit) return false;
//     }
//     return true;
//   };

//   const sortData = (arr, sortField, sortOrder) => {
//     if (!sortField || !sortOrder) return arr;
//     const dir = sortOrder === 'ascend' ? 1 : -1;
//     return arr.slice().sort((a,b) => {
//       const av = a?.[sortField];
//       const bv = b?.[sortField];
//       const an = Number(av), bn = Number(bv);
//       const bothNumeric = !isNaN(an) && !isNaN(bn);
//       if (bothNumeric) return (an - bn) * dir;
//       const as = n(av);
//       const bs = n(bv);
//       if (as < bs) return -1 * dir;
//       if (as > bs) return  1 * dir;
//       return 0;
//     });
//   };

//   const distinctsFor = (rows, fields, cap = 2000) => {
//     const out = {};
//     for (const f of fields) {
//       const set = new Set();
//       for (let i=0;i<rows.length;i++) {
//         const v = rows[i]?.[f];
//         const s = String(v ?? '');
//         if (s !== '') set.add(s);
//         if (set.size >= cap) break;
//       }
//       out[f] = Array.from(set).sort((a,b) => a.localeCompare(b));
//     }
//     return out;
//   };

//   if (type === 'BOOT') {
//     const { rows, distinctFields } = payload;
//     self.rows = rows;
//     const distincts = distinctsFor(rows, distinctFields);
//     self.postMessage({ type: 'BOOT_OK', payload: { total: rows.length, distincts } });
//     return;
//   }

//   if (type === 'QUERY') {
//     const { search, filters, sorter, page, pageSize } = payload;
//     const q = String(search || '').trim().toLowerCase();
//     const hasQ = q.length > 0;

//     const src = self.rows || [];
//     const filtered = [];
//     for (let i=0;i<src.length;i++) {
//       const rec = src[i];
//       if (!passFilters(rec, filters)) continue;
//       if (hasQ) {
//         let hit = false;
//         for (const k of Object.keys(rec)) {
//           if (textIncludes(rec[k], q)) { hit = true; break; }
//         }
//         if (!hit) continue;
//       }
//       filtered.push(rec);
//     }

//     const sorted = sortData(filtered, sorter?.field, sorter?.order);

//     const total = sorted.length;
//     const p = Math.max(1, page || 1);
//     const sz = Math.max(1, pageSize || 50);
//     const start = (p - 1) * sz;
//     const pageRows = sorted.slice(start, start + sz);

//     self.postMessage({ type: 'QUERY_OK', payload: { total, rows: pageRows } });
//   }
// };
// `
// const workerURL = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'application/javascript' }))

// /* -------------------------------------------------------------------------- */
// /*                                Main Component                              */
// /* -------------------------------------------------------------------------- */

// const BgtSeatMaster = () => {
//   // Worker-managed data
//   const [pageRows, setPageRows] = useState([])
//   const [totalCount, setTotalCount] = useState(0)

//   // Table state
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(50)
//   const [sorter, setSorter] = useState({ field: null, order: null })

//   // Search (debounced before sending to worker)
//   const [search, setSearch] = useState('')
//   const debouncedSearch = useDebouncedValue(search, 350)

//   // *** TWO filter states ***
//   // 1) Pending UI values (edited in dropdowns)
//   const [uiFilters, setUiFilters] = useState({
//     stCode: [],
//     designationName: [],
//     departmentName: [],
//     seatOrStatus: [],
//     salarY_BGT: [],
//     actualSalary: [],
//     ecode: [],
//     fullName: [],
//   })
//   // 2) Applied values (used by the worker)
//   const [appliedFilters, setAppliedFilters] = useState({
//     stCode: [],
//     designationName: [],
//     departmentName: [],
//     seatOrStatus: [],
//     salarY_BGT: [],
//     actualSalary: [],
//     ecode: [],
//     fullName: [],
//   })

//   // Distinct lists for dropdowns (from worker)
//   const [distincts, setDistincts] = useState({
//     stCode: [],
//     designationName: [],
//     departmentName: [],
//     seatOrStatus: [],
//     salarY_BGT: [],
//     actualSalary: [],
//     ecode: [],
//     fullName: [],
//   })

//   const workerRef = useRef(null)
//   const dispatch = useDispatch()
//   const { loading, theme } = useSelector((state) => state.ui)
//   const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
//   const actionsMap = useActionsMap(filteredSideMenu)
//   const [lodingLocal, setlodingLocal] = useState(false)
//   const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

//   /* -------------------------------- Worker IO ------------------------------- */
//   const runQuery = useCallback(() => {
//     if (!workerRef.current) return
//     workerRef.current.postMessage({
//       type: 'QUERY',
//       payload: {
//         search: debouncedSearch,
//         filters: appliedFilters, // ONLY applied filters, not UI/pending ones
//         sorter,
//         page: currentPage,
//         pageSize,
//       },
//     })
//   }, [debouncedSearch, appliedFilters, sorter, currentPage, pageSize])

//   /* --------------------------- Fetch & Worker boot -------------------------- */
//   const fetchData = async () => {
//     dispatch(set({ loading: true }))
//     try {
//       const response = await fetchBgtSeatMaster({})
//       if (response?.status === 200) {
//         const rows = response?.data?.data || response?.data || []
//         const w = workerRef.current
//         if (w) {
//           w.postMessage({
//             type: 'BOOT',
//             payload: {
//               rows,
//               distinctFields: Object.keys(appliedFilters),
//             },
//           })
//         }
//       } else {
//         message.error('Unexpected API response')
//       }
//     } catch (err) {
//       message.error('Failed to load data')
//     } finally {
//       dispatch(set({ loading: false }))
//     }
//   }

//   useEffect(() => {
//     const w = new Worker(workerURL)
//     workerRef.current = w
//     w.onmessage = (e) => {
//       const { type, payload } = e.data
//       if (type === 'BOOT_OK') {
//         setTotalCount(payload.total ?? 0)
//         setDistincts((d) => ({ ...d, ...payload.distincts }))
//         runQuery() // initial render
//       } else if (type === 'QUERY_OK') {
//         setTotalCount(payload.total)
//         setPageRows(payload.rows)
//       }
//     }
//     return () => w.terminate()
//   }, [runQuery])

//   useEffect(() => {
//     fetchData()
//   }, [])

//   // Whenever applied filters / search / sort / page changes → query worker
//   useEffect(() => {
//     runQuery()
//   }, [runQuery])

//   /* ------------------------------ Event handlers ---------------------------- */
//   const handleTableChange = (pagination, _ignored, sorterArg) => {
//     setCurrentPage(pagination?.current || 1)
//     setPageSize(pagination?.pageSize || 50)
//     setSorter({
//       field: sorterArg?.field || null,
//       order: sorterArg?.order || null,
//     })
//   }

//   const onSearchChange = (e) => {
//     setCurrentPage(1)
//     setSearch(e.target.value)
//   }

//   // Dropdown wiring helpers
//   const setUiFor = (key, vals) => setUiFilters((p) => ({ ...p, [key]: vals }))
//   const applyFor = (key) => {
//     setAppliedFilters((p) => ({ ...p, [key]: uiFilters[key] })) // commit UI->applied for this column
//     setCurrentPage(1)
//   }
//   const resetFor = (key) => {
//     setUiFilters((p) => ({ ...p, [key]: [] }))
//     setAppliedFilters((p) => ({ ...p, [key]: [] }))
//     setCurrentPage(1)
//   }

//   /* --------------------------------- Columns -------------------------------- */
//   /**
//    * We DO NOT use AntD's onFilter or filters array to actually filter rows.
//    * We only show "filtered chips" by binding `filteredValue` to **applied** filters,
//    * so the header visually indicates which columns are active.
//    */
//   const makeFilterCol = (title, key, width = 150) => ({
//     title,
//     dataIndex: key,
//     key,
//     width,
//     ellipsis: true,
//     filteredValue: appliedFilters[key], // show active chips based on APPLIED filters
//     filterDropdown: ({ confirm }) => (
//       <FilterDropdown
//         title={title}
//         dataList={distincts[key]}
//         selectedValues={uiFilters[key]} // UI/pending values
//         onChange={(vals) => setUiFor(key, vals)} // update UI state only
//         onApply={() => applyFor(key)} // commit UI->applied for this col
//         onReset={() => resetFor(key)} // clear both UI & applied
//         confirm={confirm}
//       />
//     ),
//     filterIcon: (active) => <FilterFilled style={{ color: active ? '#1677ff' : undefined }} />,
//     sorter: true, // sorter captured then executed inside worker
//   })

//   const columns = [
//     makeFilterCol('Loc Code', 'stCode', 120),
//     {
//       title: 'Desg No.',
//       dataIndex: 'designationId',
//       key: 'designationId',
//       width: 100,
//       ellipsis: true,
//       sorter: true,
//     },
//     makeFilterCol('Desg Name', 'designationName'),
//     {
//       title: 'Dept No.',
//       dataIndex: 'departmentId',
//       key: 'departmentId',
//       width: 100,
//       ellipsis: true,
//       sorter: true,
//     },
//     makeFilterCol('Dept Name', 'departmentName'),
//     makeFilterCol('Seat Master No.', 'seatOrStatus', 120),
//     makeFilterCol('Salary Bgt', 'salarY_BGT', 100),
//     makeFilterCol('Salary Act.', 'actualSalary', 100),
//     makeFilterCol('Emp Code', 'ecode', 100),
//     makeFilterCol('Emp Name', 'fullName'),
//     {
//       title: 'Report Head Code',
//       dataIndex: 'reportEcode',
//       key: 'reportEcode',
//       width: 100,
//       ellipsis: true,
//       sorter: true,
//     },
//     {
//       title: 'Report Head Name',
//       dataIndex: 'reportFullName',
//       key: 'reportFullName',
//       width: 150,
//       ellipsis: true,
//       sorter: true,
//     },
//     {
//       title: 'Report Mngr. Desg.',
//       dataIndex: 'bgtReportingDesig',
//       key: 'bgtReportingDesig',
//       width: 150,
//       ellipsis: true,
//       sorter: true,
//     },
//     {
//       title: 'Report Mngr. Desg Act',
//       dataIndex: 'actualReportingDesig',
//       key: 'actualReportingDesig',
//       width: 150,
//       ellipsis: true,
//       sorter: true,
//     },
//     {
//       title: 'Active',
//       dataIndex: 'active',
//       key: 'active',
//       width: 80,
//       ellipsis: true,
//       render: (v) => (v ? 'Yes' : 'No'),
//       sorter: true,
//     },
//   ]

//   const totalWidth = useMemo(() => columns.reduce((sum, col) => sum + (col.width || 150), 0), [])

//   /* --------------------------------- Export --------------------------------- */
//   const exportExcel = async () => {
//     try {
//       setlodingLocal(true)
//       const response = await axiosInstance.get(`/api/BgtSeatMaster/GetAll?isExcel=true`, {
//         responseType: 'blob',
//       })
//       const blob = new Blob([response?.data], {
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       })
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `BgtSeatMaster_${new Date().toISOString()}.xlsx`
//       document.body.appendChild(a)
//       a.click()
//       a.remove()
//       window.URL.revokeObjectURL(url)
//     } catch (e) {
//       message.error('Export failed')
//     } finally {
//       setlodingLocal(false)
//     }
//   }

//   /* ----------------------------------- UI ----------------------------------- */
//   return (
//     <>
//       <Pageheading title="Bgt Seat Master Uploader" />
//       <ToastContainer
//         position="top-right"
//         autoClose={2000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />

//       <div className="def" style={{ paddingBottom: 10 }}>
//         <TopBar
//           totalRecords={totalCount}
//           handleSearch={(e) => {
//             setCurrentPage(1)
//             setSearch(e.target.value)
//           }}
//           search={search}
//           lodingLocal={lodingLocal}
//           setIsEmpUploadVisible={setIsEmpUploadVisible}
//           exportExcel={exportExcel}
//           actionsMap={actionsMap}
//           theme={theme}
//         />

//         <Table
//           rowKey="storeBudgetId" // change if your unique field is different (e.g., "id")
//           columns={columns}
//           dataSource={pageRows}
//           loading={loading}
//           onChange={handleTableChange}
//           pagination={{
//             current: currentPage,
//             total: totalCount,
//             pageSize,
//             showSizeChanger: true,
//             pageSizeOptions: [10, 20, 50, 100, 200],
//           }}
//           bordered
//           scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
//           style={{ whiteSpace: 'nowrap' }}
//           className={theme === 'dark' ? 'dark-theme' : ''}
//         />
//       </div>

//       {isEmpUploadVisible && (
//         <BgtSeatUploader
//           isVisible={isEmpUploadVisible}
//           setIsVisible={setIsEmpUploadVisible}
//           refreshData={fetchData}
//         />
//       )}
//     </>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                                   Top Bar                                  */
// /* -------------------------------------------------------------------------- */
// const TopBar = ({
//   totalRecords,
//   handleSearch,
//   search,
//   lodingLocal,
//   setIsEmpUploadVisible,
//   exportExcel,
//   actionsMap,
//   theme,
// }) => (
//   <div
//     style={{ padding: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
//     className={theme === 'dark' ? 'dark-theme' : ''}
//   >
//     <Space>
//       <div style={{ border: '2px solid #ccc', padding: 3, borderRadius: 10 }}>
//         <span style={{ fontSize: 12, padding: '0 8px' }}>{totalRecords} Total Rows</span>
//       </div>
//     </Space>

//     <Row gutter={8} wrap={false} align="middle">
//       <Col>
//         {actionsMap?.upload?.actionStatus && (
//           <Tooltip title="Upload Bgt Seat Master">
//             <Button onClick={() => setIsEmpUploadVisible(true)}>
//               <UploadOutlined />
//             </Button>
//           </Tooltip>
//         )}
//       </Col>
//       <Col>
//         {actionsMap?.export?.actionStatus && (
//           <Tooltip title="Export">
//             <Button loading={lodingLocal} onClick={exportExcel}>
//               <ExportOutlined />
//             </Button>
//           </Tooltip>
//         )}
//       </Col>
//       <Col>
//         <Search
//           placeholder="Search in table..."
//           allowClear
//           onChange={handleSearch}
//           style={{ width: 300 }}
//           value={search}
//         />
//       </Col>
//     </Row>
//   </div>
// )

// export default BgtSeatMaster
