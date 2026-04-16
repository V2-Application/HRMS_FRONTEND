import React, { useEffect, useState } from 'react'
import { Space, Table, Tag, Col, Row, Input, Tooltip, Button, Modal, Popover } from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UserSwitchOutlined,
  StepForwardOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  MailOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import RemarksContent from '../../../components/Interviewer/RemarksContent'
import { toast, ToastContainer } from 'react-toastify'
import { Link } from 'react-router-dom'
import TextArea from 'antd/es/input/TextArea'
import ActionPopover from '../../../components/Interviewer/ActionPopover'
import ReviewModal from '../../../components/Interviewer/ReviewModal'
import ExcelImportModal from '../../../components/modals/ExcelimportModal'

const { Search } = Input

const InterviewsList = () => {
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')
  const [selectionType, setSelectionType] = useState('checkbox')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setloading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [searchTerm, setSerachTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [openResponsive, setOpenResponsive] = useState(false)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const columns = [
    {
      title: 'Application Id',
      dataIndex: 'applicationId',
      key: 'applicationId',
      width: 150,
    },
    {
      title: 'Applicant Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Previous Designation',
      dataIndex: 'previousDesignation',
      key: 'previousDesignation',
      width: 150,
    },
    {
      title: 'Position Applied For',
      dataIndex: 'positionAppliedFor',
      key: 'positionAppliedFor',
      width: 200,
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      width: 120,
    },
    {
      title: 'Résumé',
      dataIndex: 'resume',
      key: 'resume',
      render: (text) => (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1890ff',
            fontWeight: 'bold',
            textDecoration: 'underline',
            padding: '0 4px',
            fontSize: '18px',
          }}
        >
          <FilePdfOutlined />
        </a>
      ),
      width: 100,
    },
    {
      title: 'Go to Meeting',
      dataIndex: 'meeting',
      key: 'meeting',
      render: (text) => (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1890ff',
            fontWeight: 'bold',
            textDecoration: 'underline',
            padding: '0 4px',
            fontSize: '18px',
          }}
        >
          <VideoCameraOutlined />
        </a>
      ),
      width: 100,
    },
    {
      title: 'Action',
      key: 'action',
      // render: () => <ActionPopover />,
      render: () => (
        <Link>
          <StepForwardOutlined
            style={{ fontSize: '18px' }}
            onClick={() => setOpenResponsive(true)}
          />
        </Link>
      ),
      width: 100,
    },
  ]

  let totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  const data = [
    {
      key: 1,
      applicationId: 'APP-001',
      fullName: 'John Doe',
      mobile: '1234567890', // Mobile
      email: 'john.doe@example.com', // Email
      previousDesignation: 'Junior Developer',
      positionAppliedFor: 'Senior Developer',
      experience: '5 years',
      resume: '/RohitKhatri_Attendance_March.pdf',
      meeting: 'https://www.google.com/',
    },
    {
      key: 2,
      applicationId: 'APP-002',
      fullName: 'Alice Smith',
      mobile: '9876543210', // Mobile
      email: 'alice.smith@example.com', // Email
      previousDesignation: 'Associate Developer',
      positionAppliedFor: 'Developer',
      experience: '3 years',
      resume: '/RohitKhatri_Attendance_March.pdf',
      meeting: 'https://www.google.com/',
    },
    {
      key: 3,
      applicationId: 'APP-003',
      fullName: 'Robert Johnson',
      mobile: '5551234567', // Mobile
      email: 'robert.johnson@example.com', // Email
      previousDesignation: 'Intern',
      positionAppliedFor: 'Junior Developer',
      experience: '1 year',
      resume: '/RohitKhatri_Attendance_March.pdf',
      meeting: 'https://www.google.com/',
    },
    {
      key: 4,
      applicationId: 'APP-004',
      fullName: 'Maria Garcia',
      mobile: '4449876543', // Mobile
      email: 'maria.garcia@example.com', // Email
      previousDesignation: 'Software Engineer',
      positionAppliedFor: 'Senior Software Engineer',
      experience: '6 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
    {
      key: 5,
      applicationId: 'APP-005',
      fullName: 'James Brown',
      mobile: '3337654321', // Mobile
      email: 'james.brown@example.com', // Email
      previousDesignation: 'IT Support Specialist',
      positionAppliedFor: 'Network Administrator',
      experience: '4 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
    {
      key: 6,
      applicationId: 'APP-006',
      fullName: 'Patricia Miller',
      mobile: '2226543210', // Mobile
      email: 'patricia.miller@example.com', // Email
      previousDesignation: 'QA Tester',
      positionAppliedFor: 'QA Engineer',
      experience: '3 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
    {
      key: 7,
      applicationId: 'APP-007',
      fullName: 'Michael Davis',
      mobile: '1119876543', // Mobile
      email: 'michael.davis@example.com', // Email
      previousDesignation: 'Business Analyst',
      positionAppliedFor: 'Product Manager',
      experience: '5 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
    {
      key: 8,
      applicationId: 'APP-008',
      fullName: 'Linda Martinez',
      mobile: '6661230987', // Mobile
      email: 'linda.martinez@example.com', // Email
      previousDesignation: 'System Administrator',
      positionAppliedFor: 'DevOps Engineer',
      experience: '4 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
    {
      key: 9,
      applicationId: 'APP-009',
      fullName: 'William Wilson',
      mobile: '7773216540', // Mobile
      email: 'william.wilson@example.com', // Email
      previousDesignation: 'Support Engineer',
      positionAppliedFor: 'Customer Success Manager',
      experience: '2 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
    {
      key: 10,
      applicationId: 'APP-010',
      fullName: 'Elizabeth Taylor',
      mobile: '8884561230', // Mobile
      email: 'elizabeth.taylor@example.com', // Email
      previousDesignation: 'Marketing Executive',
      positionAppliedFor: 'Digital Marketing Manager',
      experience: '7 years',
      resume: '/RohitKhatri_Attendance_March',
      meeting: 'https://www.google.com/',
    },
  ]

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  }

  const statusSummary = [
    { label: 'Scheduled Interviews', count: 20, color: 'gray' },
    { label: 'Missed Interviews', count: 20, color: 'black' },
    { label: 'Rejected', count: 12, color: 'Red' },
    { label: 'Approved', count: 19, color: 'green' },
  ]

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

  const applyFilters = (search) => {
    let filtered = employeesListData.filter((item) => {
      let searchMatch = true

      if (search && search?.trim() !== '') {
        searchMatch = Object.keys(item).some((key) => {
          let value = item[key]
          if (typeof value !== 'string') {
            value = String(value)
          }

          return value.toLowerCase().includes(search.toLowerCase())
        })
      }

      return searchMatch
    })

    setFilteredData(filtered)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSerachTerm(value)
    applyFilters(value)
  }

  const handleSearch = (e) => {
    // const a = e.target.value
    // if(a.length>0){
    //   const searchText = a;
    // console.log("search text", searchText);
    // const filteredData = currentTabData.filter((val) =>
    //   val.firstName.toLowerCase().includes(searchText.toLowerCase())
    // );
    // setcurrentTabData(filteredData)
    // }
  }

  useEffect(() => {
    const interview_search = sessionStorage.getItem('')
  }, [])

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

      <ReviewModal openResponsive={openResponsive} setOpenResponsive={setOpenResponsive} />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          setimportExelModal={setimportExelModal}
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
        />
        <Table
          rowSelection={{
            type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          //   pagination={{
          //     current: currentPage,
          //     position: ['bottomRight'],
          //     total: totalCount,
          //     pageSize: pageSize, // Set the number of items per page
          //     showSizeChanger: true, // Allow users to change page size
          //     pageSizeOptions: ['10', '15', '20', '50', '100'],
          //     onChange: handleTableChange,
          //   }}
          dataSource={data}
          bordered={true}
          scroll={{ y: '70vh', x: totalWidth }}

          //   loading={loading}
        />
      </div>
      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      />
    </>
  )
}

const TableBulkActionIcons = ({
  setimportExelModal,
  totalRecords,
  selectedRowKeys,
  handleSearch,
}) => {
  // console.log('>>>>>>>>>selectedRowKeys', selectedRowKeys)

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
      {
        name: 'Selected Rows',
        label: 'Rejected',
        count: selectedRowKeys.length,
        color: 'blue',
        id: [7],
      },
    ])
  }, [selectedRowKeys, totalRecords])

  return (
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
      </Space>
      <Row>
        <Col>
          <Tooltip placement="top" title={'Send Email'} style={{ marginLeft: 5 }}>
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
          </Tooltip>

          <Tooltip placement="top" title={'Import'}>
            <Button style={{ marginLeft: 5 }} onClick={() => setimportExelModal(true)}>
              <ImportOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Export'}>
            <Button style={{ marginLeft: 5 }}>
              <ExportOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Approval Action'}>
            <Button disabled={false} style={{ marginLeft: 5 }}>
              <UserSwitchOutlined />
            </Button>
          </Tooltip>
        </Col>
        <Search
          //   placeholder="Search by name, role, or tags"
          placeholder="Search in table..."
          allowClear
          onChange={handleSearch}
          onBlur={(e) => sessionStorage.setItem('interview-search', e.target.value)}
          style={{ width: 300, marginLeft: 5 }}
        />
      </Row>
    </div>
  )
}

export default InterviewsList
