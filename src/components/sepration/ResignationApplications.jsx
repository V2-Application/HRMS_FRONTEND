import React, { useEffect, useState } from 'react'
import { Space, Table, Tag, Row, Input, Tooltip, Button, message, Col, Card } from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UserSwitchOutlined,
  EditOutlined,
  StepForwardOutlined,
  PlusOutlined,
  MailOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ExcelImportModal from '../modals/ExcelimportModal'
import ApproveModel from '../modals/ApproveModel'
import {
  candidateApprove,
  employeeResignationApprove,
  getApplicantList,
  resignationLists,
} from '../../services/Services'
import offerletter from '../../assets/images/Jane Smith_OfferLetter.pdf'
import './ResignationApplications.css'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'

const { Search } = Input

const ResignationApplications = () => {
  const { employeeId } = useSelector((state) => state.auth.data)
  const [selectionType, setSelectionType] = useState('checkbox')
  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [allApplicationList, setAllApplicationList] = useState([])
  const [importExcelModal, setImportExcelModal] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [seprationid, setseprationid] = useState(null)
  const dispatch = useDispatch()

  const tempData = [
    {
      key: 98,
      firstName: 'John doe',
      email: 'alicAlicee@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 1,
      phone: '9876543210',
      statusId: 21,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      position: 'Frontend Developer',
      interviewRounds: [
        { round: 'HR Round', status: 'Completed', remark: 'Good communication' },
        { round: 'Technical Round', status: 'Completed', remark: 'Strong React skills' },
        { round: 'Manager Round', status: 'Pending', remark: '' },
      ],
      finalResult: 'Selected',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 99,
      firstName: 'Amir Khan',
      email: 'alicAlicee@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 1,
      phone: '9876543210',
      statusId: 21,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 100,
      firstName: 'JohnsonAlice',
      email: 'alicAlicee@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 1,
      phone: '9876543210',
      statusId: 21,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 101,
      firstName: 'Alice Johnson',
      email: 'alice@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 2,
      phone: '9876543210',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 102,
      firstName: 'Bob Smith',
      email: 'bob@example.com',
      dob: '1988-11-23T00:00:00Z',
      designation: 2,
      phone: '9123456780',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 103,
      firstName: 'Carol Williams',
      email: 'carol@example.com',
      dob: '1992-03-10T00:00:00Z',
      designation: 2,
      phone: '9988776655',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 104,
      firstName: 'David Brown',
      email: 'david@example.com',
      dob: '1995-07-08T00:00:00Z',
      designation: 1,
      phone: '9001122334',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 105,
      firstName: 'Eva Green',
      email: 'eva@example.com',
      dob: '1991-12-19T00:00:00Z',
      designation: 2,
      phone: '8112233445',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 106,
      firstName: 'Frank Martin',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 23,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 107,
      firstName: 'David Brown',
      email: 'david@example.com',
      dob: '1995-07-08T00:00:00Z',
      designation: 1,
      phone: '9001122334',
      statusId: 23,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 108,
      firstName: 'Eva Green',
      email: 'eva@example.com',
      dob: '1991-12-19T00:00:00Z',
      designation: 2,
      phone: '8112233445',
      statusId: 23,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 109,
      firstName: 'Frank Martin',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 23,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 110,
      firstName: 'David Brown',
      email: 'david@example.com',
      dob: '1995-07-08T00:00:00Z',
      designation: 1,
      phone: '9001122334',
      statusId: 23,
      offer_letter: '',
      cv: '',
      offer_letter_sent: 0,
      type: '7009988776',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 111,
      firstName: 'Eva Green',
      email: 'eva@example.com',
      dob: '1991-12-19T00:00:00Z',
      designation: 2,
      phone: '8112233445',
      statusId: 23,
      offer_letter: '',
      cv: offerletter,
      offer_letter_sent: 0,
      type: 'In-Office',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 112,
      firstName: 'Frank Martin_',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 23,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      type: 'https://meet.google.com/abc-mnop-xyz',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 116.1,
      firstName: 'Frank Martin_',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 20,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      type: 'https://meet.google.com/abc-mnop-xyz',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
  ]

  const fetchMasterData = async () => {
    // const res = await getApplicantList()
    // if (res?.status === 200) setAllApplicationList(res.data?.data)
    // setAllApplicationList(tempData)
    const res = await resignationLists(employeeId)

    if (res?.status === 200) {
      const final_res = res.data.resignations
      setAllApplicationList(final_res)
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
  }

  const handleSearch = (e) => {
    const searchText = e.target.value.toLowerCase()
    const filteredData = allApplicationList.filter((val) =>
      val.firstName.toLowerCase().includes(searchText),
    )
    setAllApplicationList(filteredData)
  }

  // const columns = [
  //   {
  //     title: 'Ecode',
  //     dataIndex: 'firstName',
  //     key: 'firstName',
  //     render: (text) => (
  //       <Tooltip title={text}>
  //         <a>V23389</a>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: 'Name',
  //     dataIndex: 'firstName',
  //     key: 'firstName',
  //     render: (text) => (
  //       <Tooltip title={text}>
  //         <a>{text}</a>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: 'Email',
  //     dataIndex: 'email',
  //     key: 'email',
  //     render: (email) => (
  //       <Tooltip title={email}>
  //         <span>{email}</span>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: 'Mobile',
  //     dataIndex: 'phone',
  //     key: 'phone',
  //     render: (phone) => (
  //       <Tooltip title={phone}>
  //         <span>{phone}</span>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: 'Last Day',
  //     dataIndex: 'phone',
  //     key: 'phone',
  //     render: (phone) => (
  //       <Tooltip title={phone}>
  //         <span>21 Mar 2025</span>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: 'R Head',
  //     dataIndex: 'r_head',
  //     key: 'r_head',
  //     render: (phone) => (
  //       <Tooltip title={phone}>
  //         <span>Nikhil </span>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: 'Status',
  //     dataIndex: 'statusId',
  //     key: 'statusId',
  //     render: (statusId) => (
  //       <Tag color={statusId === 21 ? 'gold' : statusId === 22 ? 'green' : 'red'}>
  //         {statusId === 21 ? 'Applied' : statusId === 22 ? 'Approved' : 'Revoked'}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: 'Action',
  //     key: 'action',
  //     render: (_, record) => (
  //       <Space size="middle">
  //         <Tooltip title="View/Edit">
  //           <Link to={`/employee/add_new/${record.id}`}>
  //             <EditOutlined style={{ fontSize: 18 }} />
  //           </Link>
  //         </Tooltip>
  //         <Tooltip title="Initiate Action">
  //           <Link to="" onClick={() => setInitiateModalOpen(true)}>
  //             <StepForwardOutlined style={{ fontSize: 18 }} />
  //           </Link>
  //         </Tooltip>
  //       </Space>
  //     ),
  //   },
  // ]
  const columns = [
    {
      title: 'Ecode',
      dataIndex: 'reportHeadEcode',
      key: 'reportHeadEcode',
      render: (text) => (
        <Tooltip title={text}>
          <a>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => (
        <Tooltip title={text}>
          <a>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Tooltip title={email}>
          <span>{email}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Resignation Type',
      dataIndex: 'resignationType',
      key: 'resignationType',
      render: (resignationType) => (
        <Tooltip title={resignationType}>
          <span>{resignationType}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Last Day',
      dataIndex: 'lastDay',
      key: 'lastDay',
      render: (lastDay) => (
        <Tooltip title={lastDay}>
          <span>{lastDay}</span>
        </Tooltip>
      ),
    },
    {
      title: 'R Head',
      dataIndex: 'reportHeadEcode',
      key: 'reportHeadEcode',
      render: (reportHeadEcode) => (
        <Tooltip title={reportHeadEcode}>
          <span>{reportHeadEcode}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      render: (statusId) => (
        <Tag color={statusId === 21 ? 'gold' : statusId === 22 ? 'green' : 'red'}>
          {statusId === 21 ? 'Applied' : statusId === 22 ? 'Approved' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View">
            <Link to={`/sepration/record_resignation`}>
              <EyeOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>
          <Tooltip title="Initiate Action">
            <Link
              to=""
              onClick={() => {
                setInitiateModalOpen(true)
                setseprationid(record.employeeSeprationId)
              }}
            >
              <StepForwardOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const handleInitializeCandidate = async (val) => {
    // console.log('approve data--------', val);
    const actionTypeMap = {
      1: 'Approve',
      2: 'Rejected',
      3: 'Revoke',
    }

    try {
      await dispatch(set({ loading: true }))
      const response = await employeeResignationApprove({
        employeeSeprationId: seprationid,
        actionType: actionTypeMap[val.selectedOption],
        userId: employeeId,
        remarks: val.remarks,
      })
      fetchMasterData()
      message.success('Action Completed Successfully')
    } catch (error) {
      console.error('Error', error)
      message.error('Action Failed')
    } finally {
      setInitiateModalOpen(false)
      dispatch(set({ loading: false }))
    }
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

      <div className="abc_vp" style={{ padding: 16 }}>
        {/* Manager Resignation Status */}
        {/* <div style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          border: '1px solid #ddd',
        }}>
          <h3 style={{ marginBottom: 8 }}>Your Resignation Status</h3>
          <p>
          
            You have submitted your resignation on <strong>2025-06-10</strong>. Current status: <strong>Pending Approval</strong>.
          </p>
        </div> */}

        <TableBulkActionIcons
          // setimportExelModal={setimportExelModal}
          totalRecords={totalRecords}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
        />

        <Table
          rowSelection={{ type: selectionType, ...rowSelection }}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize,
            onChange: handleTableChange,
          }}
          dataSource={allApplicationList}
          bordered
          loading={loading}
        />
      </div>

      {/* <ExcelImportModal
        importExcelModal={importExcelModal}
        setImportExcelModal={setImportExcelModal}
      /> */}
      <ApproveModel
        initiateModalOpen={initiateModalOpen}
        setInitiateModalOpen={setInitiateModalOpen}
        handleInitializeCandidate={handleInitializeCandidate}
        isRevoked={false}
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
        count: selectedRowKeys?.length,
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

          {/* <Tooltip placement="top" title={'Import'}>
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
          </Tooltip> */}
        </Col>
        <Search
          //   placeholder="Search by name, role, or tags"
          placeholder="Search in table..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300, marginLeft: 5 }}
        />
      </Row>
    </div>
  )
}

export default ResignationApplications
