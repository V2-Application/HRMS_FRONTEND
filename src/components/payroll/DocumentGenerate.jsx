import { useEffect, useState, useCallback } from 'react'
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  message,
  DatePicker,
  Modal,
  Select,
} from 'antd'
import {
  ExceptionOutlined,
  KubernetesOutlined,
  PlusOutlined,
  MinusOutlined,
  SolutionOutlined,
  RiseOutlined,
  FileDoneOutlined,
} from '@ant-design/icons'
import { salaryRecalculate, getEmployeeById, getEmployeeList_DC } from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'

import dayjs from 'dayjs'
import Pageheading from '../../components/shared/Pageheading'
import { set } from '../../redux/uiSlice'
import OfferLetterModal from '../modals/OfferLetterModal'
import AppointmentLetterModal from '../modals/AppointmentLetterModal'

import useMediaQuery from '../../hooks/useMediaQuery'
import { useActionsMap } from '../../utils/useActionsMap'
import ExpLetterModal from '../../shared/ExpLetter/ExpLetterModal'
import IncrementLetterModal from '../../shared/IncrementLetter/IncrementLetterModal'
import RelievingModalTemplate from '../../shared/RelievingModal/RelievingModalTemplate'
import RelievingModal from '../../shared/RelievingModal/RelievingModal'

const { Search } = Input

const DocumentGenerate = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [isEmpLoading, setIsEmpLoading] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('10')
  const [searchTerm, setSerachTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [dateYearForSalary, setdateYearForSalary] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [offerLetterModels, setofferLetterModels] = useState(false)
  const [appointmentModal, setappointmentModal] = useState(false)
  const [defaultModelData, setdefaultModelData] = useState()
  const [defaultModelData_appointment, setdefaultModelData_appointment] = useState({
    id: 34905,
    firstName: 'RAHUL',
    middleName: '',
    lastName: 'CHOWDHURY',
    phone: '7896373069',
    email: 'rahulchowdhury7896@gmail.com',
    designation: '96',
    dob: '2003-01-05T00:00:00',
    statusId: 11,
    designationName: 'LOBM',
    positionHeldInPreviousCompany: null,
    applicantCode: 'NA',
    isApplicant: true,
    locationName: 'HN40-GOALPARA',
    resumeLink:
      '34905_rahulchowdhury7896@gmail.com\\Resume\\010820252025570598_Rahul.cv.docx (1).docx',
    offerLetterLink: '',
    interviewRounds: '',
    type: '',
    currentRound: 0,
    lastInterviewDateTime: '',
    lastScheduleId: 0,
    finalResult: '',
    isStatus: false,
  })

  const [isExpModalOpen, setIsExpModalOpen] = useState(false)
  const [expModalDetails, setExpModalDetails] = useState(null)

  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false)
  const [incModalDetails, setIncModalDetails] = useState(null)

  const [isRelievingModalOpen, setIsRelievingModalOpen] = useState(false)
  const [relievingModalDetails, setRelievingModalDetails] = useState(null)

  const [selectedMode, setSelectedMode] = useState('all')

  const hasData = employeesListData.length > 0

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    setIsEmpLoading(true)
    try {
      let response = await getEmployeeList_DC({ currentPage, pageSize, search, mode: selectedMode })
      if (response) {
        const data = response?.employees || []
        setEmployeesListData(data)
        setTotalCount(response?.totalCount)
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      setIsEmpLoading(false)
    }
  }

  const getEmployeeDataById = async (id) => {
    try {
      const result = await getEmployeeById(id)
      const fin_result = result?.data?.data?.candidateInfo
      const data = {
        id: fin_result?.id,
        firstName: fin_result?.firstName,
        middleName: fin_result?.middleName,
        lastName: fin_result?.lastName,
        phone: fin_result?.mobile,
        email: fin_result?.emailAddress,
        department: fin_result?.department,
        designation: fin_result?.designation,
        designationName: fin_result?.designationName,
        isApplicant: true,
        locationName: fin_result?.location,
        grossSalary: fin_result?.grossSalary,
        joiningDate: fin_result?.joiningDate,
      }

      setdefaultModelData(data)
      setofferLetterModels(true)
    } catch (error) {}
  }

  const getEmployeeDataById_appointment = async (id) => {
    try {
      const result = await getEmployeeById(id)
      const fin_result = result?.data?.data?.candidateInfo
      const data = {
        id: fin_result?.id,
        firstName: fin_result?.firstName,
        middleName: fin_result?.middleName,
        lastName: fin_result?.lastName,
        phone: fin_result?.mobile,
        email: fin_result?.emailAddress,
        department: fin_result?.department,
        designation: fin_result?.designation,
        designationName: fin_result?.designationName,
        isApplicant: true,
        locationName: fin_result?.location,
        grossSalary: fin_result?.grossSalary,
        joiningDate: fin_result?.joiningDate,
        eCode: fin_result?.empCode,
      }

      setdefaultModelData_appointment(data)
      setappointmentModal(true)
    } catch (error) {}
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, currentPage, selectedMode])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      sessionStorage.setItem('applicant-search', search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const getRecalulatedSalaryData = async (record) => {
    let date_month = null
    if (record) {
      const { ecode } = record
      date_month = ecode
    } else {
      const str_selectedkey = selectedRowKeys.join(',')
      date_month = str_selectedkey
    }

    try {
      dispatch(set({ loading: true }))

      const payload = {
        eCodes: date_month,
        month: dateYearForSalary,
      }
      const res = await salaryRecalculate(payload)

      if (res.status === 200) {
        message.success(
          res.data?.message || 'Salary Recalculated Successfully for ',
          dateYearForSalary,
        )
      }
    } catch (error) {
      console.error('error in Salary Recalculate: ', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSerachTerm(value)
    setSearch(value)
  }

  useEffect(() => {
    setFilteredData(employeesListData)
  }, [employeesListData])

  const handleOk = async () => {
    try {
      await getRecalulatedSalaryData()
    } catch (error) {
      console.error()
    } finally {
      setIsModalOpen(false)
    }
  }

  const handleCancel = () => setIsModalOpen(false)

  const handleCloseExpModal = () => {
    setIsExpModalOpen(false)
  }

  const handleOpenExpModal = (rowData = {}) => {
    const details = {
      empCode: rowData?.ecode || '-',
      empName: rowData?.fullName || '-',
      department: rowData?.departmentName || '-',
      designation: rowData?.designationName || '-',
      joiningDate: rowData?.doj ? String(rowData?.doj || '').split('T')[0] : '-',
      lastWorkingDate: rowData?.dateOfLeft ? String(rowData?.dateOfLeft || '').split('T')[0] : '-',
    }

    setExpModalDetails(details)
    setIsExpModalOpen(true)
  }

  const handleCloseIncModal = () => {
    setIsIncrementModalOpen(false)
  }

  const handleOpenIncModal = (rowData = {}) => {
    const details = {
      empCode: rowData?.ecode || '-',
      empName: rowData?.fullName || '-',
      department: rowData?.departmentName || '-',
      designation: rowData?.designationName || '-',
    }

    setIncModalDetails(details)
    setIsIncrementModalOpen(true)
  }

  const handleOpenRelievingModal = (rowData = {}) => {
    const details = {
      empCode: rowData?.ecode || '-',
      empName: rowData?.fullName || '-',
      department: rowData?.departmentName || '-',
      designation: rowData?.designationName || '-',
    }

    setRelievingModalDetails(details)
    setIsRelievingModalOpen(true)
  }

  const handleCloseRelievingModal = () => {
    setRelievingModalDetails(null)
    setIsRelievingModalOpen(false)
  }

  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'locBasedECode',
      key: 'locBasedECode',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Emp Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'RM Code',
      dataIndex: 'reportHeadEcode',
      key: 'reportHeadEcode',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'St Code',
      dataIndex: 'storeCode',
      key: 'storeCode',
      width: 90,
      ellipsis: true,
    },
    {
      title: 'St Loc',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Action',
      fixed: 'right',
      key: 'id',
      render: (_, record, index) => (
        <Space size="middle">
          {actionsMap['generate offer letter']?.actionStatus && (
            <Tooltip placement="top" title={'Generate Offer Letter for Current employee'}>
              <ExceptionOutlined
                style={{ fontSize: 18 }}
                onClick={() => {
                  getEmployeeDataById(record.employeeId)
                }}
              />
            </Tooltip>
          )}

          {actionsMap['generate appointment letter']?.actionStatus && (
            <Tooltip placement="top" title={'Generate Appointment Letter'}>
              <KubernetesOutlined
                style={{ fontSize: 22 }}
                onClick={() => {
                  getEmployeeDataById_appointment(record.employeeId)
                }}
              />
            </Tooltip>
          )}

          {/* {selectedMode === 'inactive' && ( */}
          <Tooltip placement="top" title="Generate Experience Letter">
            <SolutionOutlined style={{ fontSize: 20 }} onClick={() => handleOpenExpModal(record)} />
          </Tooltip>
          {/* // )} */}

          {/* <Tooltip placement="top" title="Generate Increment Letter">
            <RiseOutlined style={{ fontSize: 21 }} onClick={() => handleOpenIncModal(record)} />
          </Tooltip> */}

          {/* {selectedMode === 'inactive' && ( */}
          <Tooltip placement="top" title="Generate Relieving Letter">
            <FileDoneOutlined
              style={{ fontSize: 20 }}
              onClick={() => handleOpenRelievingModal(record)}
            />
          </Tooltip>
          {/* )} */}
        </Space>
      ),
      width: 130,
    },
  ]

  const totalWidth = columns.reduce((sum, col) => sum + col.width || 150, 0)

  return (
    <>
      {/* Experience modal */}
      {isExpModalOpen && (
        <ExpLetterModal
          isModalOpen={isExpModalOpen}
          handleCancel={handleCloseExpModal}
          empDetails={expModalDetails}
          setIsExpModalOpen={setIsExpModalOpen}
        />
      )}

      {/* Increment modal */}
      {isIncrementModalOpen && (
        <IncrementLetterModal
          isModalOpen={isIncrementModalOpen}
          handleCancel={handleCloseIncModal}
          empDetails={incModalDetails}
          setIsIncrementModalOpen={setIsIncrementModalOpen}
        />
      )}

      {/* Relieving Modal */}
      {isRelievingModalOpen && (
        <RelievingModal
          isModalOpen={isRelievingModalOpen}
          handleCancel={handleCloseRelievingModal}
          empDetails={relievingModalDetails}
          setIsRelievingModalOpen={setIsRelievingModalOpen}
        />
      )}

      <Pageheading title="Generate Documents" />

      <div className="def" style={{ paddingBottom: 10 }}>
        <Space
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.6rem',
          }}
        >
          <Select
            placeholder="Select type"
            value={selectedMode}
            style={{ width: '10rem' }}
            onChange={(val) => setSelectedMode(val)}
          >
            <Select.Option value="all">All Employees</Select.Option>
            <Select.Option value="inactive">Inactive Employees</Select.Option>
            <Select.Option value="active">Active Employees</Select.Option>
          </Select>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearchChange}
            style={{ width: 300, marginLeft: 5 }}
            value={searchTerm}
          />
        </Space>

        {!isMobile ? (
          <Table
            rowKey="ecode"
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
            loading={isEmpLoading}
            bordered={true}
            scroll={hasData ? { x: totalWidth, y: 'calc(100vh - 160px)' } : undefined}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
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
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Emp Code
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Emp Name
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Department
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {filteredData
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((record) => {
                const isExpanded = expandedCards[record.ecode]

                return (
                  <div
                    key={record.ecode}
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
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                            {record.locBasedECode || '-'}
                          </td>
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
                            {record.fullName || '-'}
                          </td>
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
                            {record.departmentName || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              display: 'flex',
                              gap: 4,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {actionsMap['generate offer letter']?.actionStatus && (
                              <Tooltip title="Offer Letter">
                                <ExceptionOutlined
                                  style={{ fontSize: 14 }}
                                  onClick={() => getEmployeeDataById(record.employeeId)}
                                />
                              </Tooltip>
                            )}
                            {actionsMap['generate appointment letter']?.actionStatus && (
                              <Tooltip title="Appointment">
                                <KubernetesOutlined
                                  style={{ fontSize: 14 }}
                                  onClick={() => getEmployeeDataById_appointment(record.employeeId)}
                                />
                              </Tooltip>
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                              onClick={() => handleToggleCard(record.ecode)}
                              style={{ padding: '2px 4px', fontSize: 10 }}
                            />
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
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Designation
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                              }}
                            >
                              {record.designationName || '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              RM Code
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.reportHeadEcode || '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Location
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                              }}
                            >
                              {record.locationName || '-'}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                )
              })}

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                padding: 12,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: 12 }}>
                  Showing {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
                </div>
                <Space>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <Button
                    size="small"
                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>

      <Modal title="Pick a Month" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
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
      </Modal>

      <OfferLetterModal
        offerLetterModel={offerLetterModels}
        setofferLetterModel={setofferLetterModels}
        defaultModelData={defaultModelData}
        ApplicationListData={() => {}}
      />

      <AppointmentLetterModal
        offerLetterModel={appointmentModal}
        setofferLetterModel={setappointmentModal}
        defaultModelData={defaultModelData_appointment}
        ApplicationListData={() => {}}
      />
    </>
  )
}

export default DocumentGenerate
