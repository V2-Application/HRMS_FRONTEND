import React, { useEffect, useState, useCallback } from 'react'
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  Switch,
  message,
  Dropdown,
  Checkbox,
  DatePicker,
  Modal,
  Grid,
} from 'antd'
import {
  ExportOutlined,
  EditOutlined,
  UploadOutlined,
  EyeOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SaveOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { Link } from 'react-router-dom'
import {
  exportEmployeeMaster,
  getAbscondingReasonList,
  getBlacklistReasonList,
  getEmployeeList,
  markEmployeeActiveStatus,
  salaryRecalculate,
} from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import Card from '../../components/payroll/Summary/Card'
import Pageheading from '../../components/shared/Pageheading'
import { IoIosRefresh } from 'react-icons/io'
import axiosInstance from '../../services/axiosInstance'
import EmployeesUploadModal from '../../employees/EmployeesUploadModal'
import ExcelImportModal from '../modals/ExcelimportModal'
import { set } from '../../redux/uiSlice'
import EmployeeInactiveModal from '../modals/EmployeeInactiveModal'
import EmployeeActiveInactiveModal from '../modals/EmployeeActiveInactiveModal'
import { useActionsMap } from '../../utils/useActionsMap'
import useMediaQuery from '../../hooks/useMediaQuery'
import SalaryRecalculateUploader from './SalaryRecalculateUploader'

const { Search } = Input
const { useBreakpoint } = Grid

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

  const filteredOptions = dataList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleChange = (checkedValues) => {
    setSelectedOptions(checkedValues)
  }

  const handleFilter = () => {
    setFilterValues(selectedOptions)
    confirm()
  }

  const handleReset = () => {
    setSelectedOptions([])
    setFilterValues([])
    setSearchText('')
    confirm()
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
          value={selectedOptions}
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

const SalaryRecalculate = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  const [selectionType, setSelectionType] = useState('checkbox')
  const [isEmployeeInactiveModalOpen, setIsEmployeeInactiveModalOpen] = useState(false)
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [selectedEmpName, setSelectedEmpName] = useState('')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('500')
  const [searchTerm, setSerachTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { ecode, locationList } = useSelector((state) => state.auth.data)
  const { theme } = useSelector((state) => state.ui)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [lodingLocal, setlodingLocal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedEmployeeName, setselectedEmployeeName] = useState({})
  const [ecodeFilterValues, setEcodeFilterValues] = useState([])
  const [fullnameFilterValues, setFullNameFilterValues] = useState([])
  const [departmentNameFilterValues, setDepartmentNameFilterValues] = useState([])
  const [designationNameFilterValues, setDesignationNameFilterValues] = useState([])
  const [reportHeadEcodeFilterValues, setReportHeadEcodeFilterValues] = useState([])
  const [storeCodeFilterValues, setStoreCodeFilterValues] = useState([])
  const [locationNameFilterValues, setLocationNameFilterValues] = useState([])
  const [abscondingList, setabscondingList] = useState([])
  const [blackList, setblackList] = useState([])
  const [cardData, setCardData] = useState([
    { label: 'Total Employees', value: 0 },
    { label: 'Active Employees', value: 0 },
    { label: 'Inactive Employees', value: 0 },
  ])
  const [bulkSalaryRecalculateStatus, setbulkSalaryRecalculateStatus] = useState(false)
  const [dateYearForSalary, setdateYearForSalary] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ✅ Mobile state
  const [expandedCards, setExpandedCards] = useState({})

  const { data: empData } = useSelector((state) => state?.auth)
  const { storeCode, role } = useSelector((state) => state?.auth?.data)

  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)
  // console.log('employeesListData:', employeesListData)

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // ✅ Mobile expanded row render
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Row 1: Department, Designation, RM Code, St Loc - 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Department
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 9,
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: '1.2',
            }}
          >
            {record.departmentName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Designation
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 9,
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: '1.2',
            }}
          >
            {record.designationName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            RM Code
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            {record.reportHeadEcode || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            St Loc
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 9,
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: '1.2',
            }}
          >
            {record.locationName || '-'}
          </div>
        </div>
      </div>
    </div>
  )

  // ✅ Mobile columns
  const getMobileColumns = (showAction) => {
    const base = [
      {
        title: 'E-Code',
        dataIndex: 'locBasedECode',
        width: 70,
        render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
      },
      {
        title: 'Name',
        dataIndex: 'fullName',
        width: 120,
        render: (text) => (
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {text || '-'}
          </div>
        ),
      },
    ]

    const actionColumn = {
      title: 'Month',
      width: 90,
      render: (_, record) => (
        <DatePicker
          picker="month"
          format="MMM-YY"
          onChange={(date, dateString) => {
            setdateYearForSalary(dateString)
          }}
          disabledDate={(current) => {
            return current && current >= dayjs().startOf('month')
          }}
          size="small"
          style={{ width: '100%', fontSize: 10 }}
        />
      ),
    }

    const recalColumn = {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.ecode || `row_${index}`
        return (
          <div style={{ display: 'flex', gap: 4 }}>
            <Tooltip placement="top" title="Recalculate">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined style={{ fontSize: 12 }} />}
                onClick={(e) => {
                  e.stopPropagation()
                  getRecalulatedSalaryData(record)
                }}
                style={{ padding: '4px' }}
              />
            </Tooltip>
            <Button
              type="text"
              size="small"
              icon={
                expandedCards[uniqueKey] ? (
                  <MinusOutlined style={{ fontSize: 12 }} />
                ) : (
                  <PlusOutlined style={{ fontSize: 12 }} />
                )
              }
              onClick={(e) => {
                e.stopPropagation()
                handleToggleCard(uniqueKey)
              }}
              style={{ padding: '4px' }}
            />
          </div>
        )
      },
    }

    return showAction ? [...base, actionColumn, recalColumn] : base
  }

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      let response = await getEmployeeList({ currentPage, pageSize, search })

      if (response) {
        const storeFilterData = response?.employees?.filter(
          (item) => item?.stCode?.trim() === storeCode?.trim(),
        )

        let updatedData = (await response?.employees?.filter((emp) => emp?.isActive === true)) || []

        if (Array.isArray(locationList) && locationList.length > 0) {
          const getStCodesFromLocationList = locationList.map((item) =>
            item?.stCode?.trim()?.toLowerCase(),
          )

          const filteredEmployees = updatedData?.filter((item) =>
            getStCodesFromLocationList.includes(item?.stCode?.trim()?.toLowerCase()),
          )

          setEmployeesListData(filteredEmployees)
          setTotalCount(filteredEmployees.length || 0)
        } else {
          role === 'StoreHR'
            ? setTotalCount(storeFilterData?.length || 0)
            : setTotalCount(response?.totalCount)

          role === 'StoreHR'
            ? setEmployeesListData(storeFilterData)
            : setEmployeesListData(updatedData)
        }

        const keyToMap = {
          totalCount: 'Total Employees',
          activeCount: 'Active Employees',
          inactiveCount: 'Inactive Employees',
        }

        const cards = response?.cards || {}
        const cardsData = Object.entries(cards)
          .filter(([key]) => keyToMap.hasOwnProperty(key))
          .map(([key, val]) => ({
            label: keyToMap[key],
            value: val,
          }))

        setCardData(cardsData)
      }

      const absList = await getAbscondingReasonList()
      const blackList = await getBlacklistReasonList()
      setabscondingList(absList)
      setblackList(blackList)
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      sessionStorage.setItem('applicant-search', search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const handleToggle = async (
    id,
    leavingDate,
    remarks,
    status,
    employeeName,
    index,
    attachments = [],
    reasonid,
    abscondingReasonId,
    blackListReasonId,
  ) => {
    const newFormData = new FormData()
    newFormData.append('id', id)
    newFormData.append('isactive', status === 'true' ? true : false)
    newFormData.append('remarks', remarks)
    newFormData.append('leavingDate', leavingDate)
    newFormData.append('lastUpdatedBy', ecode)
    if (reasonid) {
      newFormData.append('reasonid', reasonid)
    }
    if (abscondingReasonId) {
      newFormData.append('abscondingReasonId', abscondingReasonId)
      newFormData.append('resignationTypeId', 10)
    }
    if (blackListReasonId) {
      newFormData.append('blackListReasonId', blackListReasonId)
      newFormData.append('resignationTypeId', 10)
    }

    if (attachments.length > 0) {
      attachments.forEach((att) => {
        newFormData.append('inactiveattachment', att?.originFileObj)
      })
    }

    try {
      await markEmployeeActiveStatus(newFormData)
      await fetchData()
      setSearch('')
      message.success('Employee Status Updated')
    } catch (error) {
      console.error('Employee Status Update Failed', error)
      message.error('Employee Status Update Failed')
    }
  }

  const title_fields = [
    {
      label: 'First Name',
      key: 'firstName',
      alternateMatches: ['FIRST NAME'],
      fieldType: { type: 'input' },
      example: 'John',
      validations: [{ rule: 'required', errorMessage: 'First Name is required' }],
    },
    {
      label: 'Middle Name',
      key: 'middleName',
      alternateMatches: ['MIDDLE NAME'],
      fieldType: { type: 'input' },
      example: 'Alan',
    },
    {
      label: 'Last Name',
      key: 'lastName',
      alternateMatches: ['LAST NAME'],
      fieldType: { type: 'input' },
      example: 'Doe',
      validations: [{ rule: 'required', errorMessage: 'Last Name is required' }],
    },
    {
      label: 'Email',
      key: 'email',
      alternateMatches: ['EMAIL ADDRESS'],
      fieldType: { type: 'input' },
      example: 'john@example.com',
      validations: [
        { rule: 'required', errorMessage: 'Email is required' },
        { rule: 'email', errorMessage: 'Invalid email format' },
      ],
    },
    {
      label: 'Mobile',
      key: 'mobile',
      alternateMatches: ['MOBILE'],
      fieldType: { type: 'input' },
      example: '9876543210',
      validations: [{ rule: 'required', errorMessage: 'Mobile number is required' }],
    },
    {
      label: 'Date of Birth',
      key: 'dob',
      alternateMatches: ['DOB'],
      fieldType: { type: 'date' },
      example: '1990-01-01',
    },
    {
      label: 'Gender',
      key: 'gender',
      fieldType: { type: 'select', options: ['Male', 'Female', 'Other'] },
      example: 'Male',
    },
    {
      label: 'Designation',
      key: 'designation',
      fieldType: { type: 'input' },
      example: 'Software Engineer',
    },
    {
      label: 'Department',
      key: 'department',
      fieldType: { type: 'input' },
      example: 'Engineering',
    },
    {
      label: 'Joining Date',
      key: 'joiningDate',
      fieldType: { type: 'date' },
      example: '2023-08-15',
    },
    {
      label: 'Gross Salary',
      key: 'grossSalary',
      fieldType: { type: 'input' },
      example: '50000.00',
    },
    {
      label: 'PAN Number',
      key: 'panNumber',
      fieldType: { type: 'input' },
      example: 'ABCDE1234F',
    },
    {
      label: 'Aadhar Number',
      key: 'aadharNumber',
      fieldType: { type: 'input' },
      example: '123412341234',
    },
    {
      label: 'Marital Status',
      key: 'maritalStatus',
      alternateMatches: ['MARITIAL STATUS'],
      fieldType: { type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
      example: 'Single',
    },
    {
      label: 'Nationality',
      key: 'nationality',
      fieldType: { type: 'input' },
      example: 'Indian',
    },
  ]

  const getRecalulatedSalaryData = async (record) => {
    console.log('console')
    let date_month = null
    if (record) {
      const { ecode } = record
      date_month = ecode
    } else {
      const str_selectedkey = selectedRowKeys.join(',')
      date_month = str_selectedkey
    }

    const payload = {
      eCodes: date_month,
      // month: dateYearForSalary,
      month: currentMonth.format('MMM-YY'),
    }

    // console.log('payload:', payload)
    // console.log('filtered length:', filteredData.length)
    // console.log('selected length:', selectedRowKeys.length)

    try {
      dispatch(set({ loading: true }))

      const payload = {
        eCodes: date_month,
        // month: dateYearForSalary,
        month: currentMonth.format('MMM-YY'),
      }
      const res = await salaryRecalculate(payload)

      if (res.status === 200) {
        messageApi.success(res.data?.message || 'Salary Recalculated Successfully')
      }
    } catch (error) {
      console.error('error in Salary Recalculate: ', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const desktopColumns = (showAction) => {
    const base = [
      {
        title: 'Loc Emp Code',
        dataIndex: 'locBasedECode',
        key: 'locBasedECode',
        width: 200,
      },
      {
        title: 'Emp Code',
        dataIndex: 'ecode',
        key: 'ecode',
        width: 200,
      },
      {
        title: 'Emp Name',
        dataIndex: 'fullName',
        key: 'fullName',
        width: 225,
      },
      {
        title: 'Department',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: 200,
        filteredValue: departmentNameFilterValues.length ? departmentNameFilterValues : null,
        onFilter: (value, record) => departmentNameFilterValues.includes(record.departmentName),
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Department"
            dataIndex="departmentName"
            dataList={[...new Set(employeesListData.map((item) => item.departmentName))]}
            filterValues={departmentNameFilterValues}
            setFilterValues={setDepartmentNameFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'Designation',
        dataIndex: 'designationName',
        key: 'designationName',
        width: 250,
        filteredValue: designationNameFilterValues.length ? designationNameFilterValues : null,
        onFilter: (value, record) => designationNameFilterValues.includes(record.designationName),
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Designation"
            dataIndex="designationName"
            dataList={[...new Set(employeesListData.map((item) => item.designationName))]}
            filterValues={designationNameFilterValues}
            setFilterValues={setDesignationNameFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'St Code',
        dataIndex: 'storeCode',
        key: 'storeCode',
        width: 200,
        filteredValue: storeCodeFilterValues.length ? storeCodeFilterValues : null,
        onFilter: (value, record) => storeCodeFilterValues.includes(record.storeCode),
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="St Code"
            dataIndex="storeCode"
            dataList={[...new Set(employeesListData.map((item) => item.storeCode))]}
            filterValues={storeCodeFilterValues}
            setFilterValues={setStoreCodeFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'St Loc',
        dataIndex: 'locationName',
        key: 'locationName',
        width: 200,
        filteredValue: locationNameFilterValues.length ? locationNameFilterValues : null,
        onFilter: (value, record) => locationNameFilterValues.includes(record.locationName),
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="St Loc"
            dataIndex="locationName"
            dataList={[...new Set(employeesListData.map((item) => item.locationName))]}
            filterValues={locationNameFilterValues}
            setFilterValues={setLocationNameFilterValues}
            confirm={confirm}
          />
        ),
      },
    ]

    const actionCol = {
      title: 'Action',
      fixed: 'right',
      key: 'id',
      render: (_, record, index) => (
        <Space size="middle">
          <DatePicker
            picker="month"
            format="MMM-YY"
            onChange={(date, dateString) => {
              setdateYearForSalary(dateString)
            }}
            disabledDate={(current) => {
              return current && current >= dayjs().startOf('month')
            }}
            style={{ width: 150 }}
          />

          <Tooltip placement="top" title={'Recalculate Salary'}>
            <ReloadOutlined
              style={{ fontSize: 18 }}
              onClick={() => {
                getRecalulatedSalaryData(record)
              }}
            />
          </Tooltip>
        </Space>
      ),
      width: 80,
    }

    return showAction ? [...base, actionCol] : base
  }

  // const columns = isMobile ? getMobileColumns() : desktopColumns
  const columns = React.useMemo(() => {
    const showAction = selectedRowKeys.length === 0 // hide if any selection
    return isMobile ? getMobileColumns(showAction) : desktopColumns(showAction)
  }, [isMobile, selectedRowKeys, employeesListData]) // include deps you use inside columns if needed

  const totalWidth = React.useMemo(() => {
    const built = desktopColumns(selectedRowKeys.length === 0)
    return built.reduce((sum, col) => sum + (col.width || 200), 0)
  }, [selectedRowKeys])

  const applyFilters = (search) => {
    if (!search || search.trim() === '') {
      setFilteredData(employeesListData)
      setTotalCount(employeesListData.length)
      return
    }

    const filtered = employeesListData.filter((item) => {
      return Object.keys(item).some((key) => {
        let value = item[key]
        if (typeof value !== 'string') {
          value = String(value)
        }
        return value.toLowerCase().includes(search.toLowerCase())
      })
    })

    setFilteredData(filtered)
    setTotalCount(filtered.length)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSerachTerm(value)
    applyFilters(value)
  }

  useEffect(() => {
    setFilteredData(employeesListData)
  }, [employeesListData])

  useEffect(() => {
    // console.log('selectedRowKeys changed: ', selectedRowKeys)
  }, [selectedRowKeys])

  const handleSubmitMultipleRecalculateRows = async () => {
    try {
      const result = await getRecalulatedSalaryData()
    } catch (error) {
      console.error()
    } finally {
      setIsModalOpen(false)
    }
  }
  const handleCancel = () => setIsModalOpen(false)

  //   const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (newSelectedRowKeys) => {
  //     setSelectedRowKeys(newSelectedRowKeys)
  //   },
  // }

  // make row keys stable (always strings)
  const getRowKey = useCallback((row) => String(row.ecode), [])

  // keep selection in one controlled place + preserve
  const rowSelection = React.useMemo(
    () => ({
      type: selectionType,
      selectedRowKeys,
      onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
      preserveSelectedRowKeys: true,
    }),
    [selectionType, selectedRowKeys],
  )

  return (
    <>
      {contextHolder}
      <SalaryRecalculateUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />
      <Pageheading title="Salary Recalculate" />
      <ToastContainer position="top-right" autoClose={2000} />

      <EmployeeInactiveModal
        isModalOpen={isEmployeeInactiveModalOpen}
        setIsModalOpen={setIsEmployeeInactiveModalOpen}
        empID={selectedEmpId}
        empName={selectedEmpName}
        fetchData={fetchData}
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          setimportExelModal={setimportExelModal}
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearchChange}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          empData={empData}
          search={searchTerm}
          cardsData={cardData}
          bulkSalaryRecalculateStatus={bulkSalaryRecalculateStatus}
          getRecalulatedSalaryData={getRecalulatedSalaryData}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setdateYearForSalary={setdateYearForSalary}
          actionsMap={actionsMap}
          isMobile={isMobile}
          setIsUploaderOpen={setIsUploaderOpen}
          updateSalary={handleSubmitMultipleRecalculateRows}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />

        {isMobile ? (
          // ✅ Mobile view with expansion
          <Table
            rowKey="ecode"
            rowSelection={{ type: selectionType, ...rowSelection }}
            columns={columns}
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
            expandable={{
              expandedRowKeys: Object.keys(expandedCards)
                .filter((key) => expandedCards[key])
                .map((key) => (isNaN(key) ? key : parseInt(key))),
              expandedRowRender: expandedRowRender,
              showExpandColumn: false,
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        ) : (
          // ✅ Desktop view
          <Table
            rowKey="ecode"
            rowSelection={{ type: selectionType, ...rowSelection }}
            columns={columns}
            dataSource={filteredData}
            bordered
            scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              // total: totalCount,
              total: filteredData?.length,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '500'],
              onChange: handleTableChange,
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        )}
      </div>

      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      />

      <EmployeeActiveInactiveModal
        selectedEmployeeName={selectedEmployeeName}
        abscondingList={abscondingList}
        blackList={blackList}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(data) => {
          handleToggle(
            data.id,
            data.leavingDate,
            data.remarks,
            data.status,
            data.employeeName,
            data.index,
            data?.attachments,
            data?.reason,
            data?.abscondingReasonId,
            data?.blackListReasonId,
          )
          setModalVisible(false)
        }}
      />
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  empData,
  cardsData,
  bulkSalaryRecalculateStatus,
  getRecalulatedSalaryData,
  setIsModalOpen,
  isModalOpen,
  setdateYearForSalary,
  actionsMap,
  isMobile,
  setIsUploaderOpen,
  updateSalary,
  currentMonth,
  setCurrentMonth,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const [isAllRecalculating, setIsAllRecalculating] = useState(false)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'ActiveEmployees',
      label: 'Active Employees',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
    { name: 'InactiveEmployees', label: 'Inactive Employees', count: 0, color: 'blue', id: [7] },
    { name: 'TotalEmployees', label: 'Total Employees', count: 0, color: 'blue', id: [7] },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Active Employees',
        label: 'Active Employees',
        count: cardsData.find((item) => item.label === 'Active Employees')?.value || 0,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
      {
        name: 'Inactive Employees',
        label: 'Inactive Employees',
        count: cardsData.find((item) => item.label === 'Inactive Employees')?.value || 0,
        color: 'blue',
        id: [7],
      },
      {
        name: 'Total Employees',
        label: 'Total Employees',
        count: cardsData.find((item) => item.label === 'Total Employees')?.value || 0,
        color: 'blue',
        id: [7],
      },
    ])
  }, [selectedRowKeys, totalRecords])

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
      console.error('api error', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  const handleCalculateByMonth = async () => {
    const reqestBody = {
      month: currentMonth.format('MMM-YY'),
    }

    try {
      setIsAllRecalculating(true)
      const response = await axiosInstance.post(
        // '/api/SalaryRecalculate/recalculate-by-month',
        '/api/SalaryRecalculate/recalculate-by-month-new',
        reqestBody,
      )
      message.success(response?.data?.message || 'Recalculation successful')
      console.log('recalculate-by-month response:', response)
    } catch (error) {
      console.error('Error in recalculate-by-month:', error)
      message.error(error?.response?.data?.message || 'Recalculation failed')
    } finally {
      setIsAllRecalculating(false)
    }
  }

  return (
    <>
      {isEmpUploadVisible && (
        <EmployeesUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}
      <div
        style={{
          padding: 6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            flex: isMobile ? '1 1 100%' : '0 1 auto',
          }}
        >
          {statusSummary.map(({ name, label, count, color, id }, index) => (
            <div
              key={index}
              style={{
                border: '2px solid #ccc',
                padding: 4,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
                minWidth: 120,
                maxWidth: 160,
              }}
              className={theme === 'dark' ? 'dark-theme' : ''}
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
                    padding: '0 8px',
                    textAlign: 'center',
                  }}
                >
                  {count} {name}
                </span>
              </Tooltip>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            flex: isMobile ? '1 1 100%' : '0 1 auto',
          }}
        >
          {!isMobile && (
            <>
              <DatePicker
                picker="month"
                value={currentMonth}
                onChange={(val) => setCurrentMonth(val)}
                size={isMobile ? 'small' : 'middle'}
                disabled={selectedRowKeys.length < 1}
              />

              <Tooltip placement="top" title="Bulk Salary Recalculate">
                <Button
                  onClick={updateSalary}
                  loading={bulkSalaryRecalculateStatus}
                  disabled={selectedRowKeys.length < 1}
                >
                  <ReloadOutlined />
                </Button>
              </Tooltip>
            </>
          )}

          <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)}>
            Upload
          </Button>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? '100%' : 300 }}
            value={search}
          />
        </div>
      </div>
    </>
  )
}

export default SalaryRecalculate
