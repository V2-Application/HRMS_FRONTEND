import React, { useEffect, useState } from 'react'
import {
  Radio,
  Space,
  Table,
  Tag,
  Checkbox,
  Row,
  Input,
  Tooltip,
  Button,
  Modal,
  message,
  theme,
  Tabs,
  Col,
  Form,
  Select,
} from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UserSwitchOutlined,
  EditOutlined,
  StepForwardOutlined,
  PlusOutlined,
} from '@ant-design/icons'
// import ProductListModel from './ProductListModel';
// import OrderTrack from './OrderTrack';
// import OrderTrackModel from './OrderTrackModel';
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TextArea from 'antd/es/input/TextArea'
import { toast, ToastContainer } from 'react-toastify'

// import { getBagData } from '../../redux/Cart/action';
const { Search } = Input

const Openings = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setloading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalRecords, setTotalRecords] = useState(0)

  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    setloading(true)
    try {
      const token = localStorage.getItem('token') // Retrieve token from localStorage

      const response = await axios.get(
        `https://v2parivar.v2retail.com:9987/api/StoreLocations?pageNumber=${currentPage}&pageSize=${pageSize}`, // Replace with actual endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Passing token in Authorization header
            accept: '*/*',
          },
        },
      )
      // console.log('locations api res:', response)
      if (response?.status === 200) {
        setTotalRecords(Number(response?.data?.data?.data?.length))
        let updatedData = response?.data?.data?.data?.filter(
          (dt) => dt?.name_of_Employee?.toLowerCase() === 'vacant',
        )
        setLocations(updatedData)
      } else {
        navigate('/candidate/form_list')
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      setloading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize])

  const columns = [
    {
      title: 'Vacants',
      dataIndex: 'name_of_Employee',
      key: 'name_of_Employee',
      render: (text) => <a>{text}</a>,
      // width: '10%',
    },
    // {
    //   title: 'Employee Code',
    //   dataIndex: 'emp_Code',
    //   key: 'emp_Code',
    //   // width: '5%',
    // },
    // {
    //   title: 'Employee Email id',
    //   dataIndex: 'e_MAIL_ID',
    //   key: 'e_MAIL_ID',
    //   // width: '10%',
    // },
    // {
    //   title: 'Date Of Joining',
    //   dataIndex: 'd_O_J_',
    //   key: 'd_O_J_',
    //   render: (d_O_J_) => <span>{d_O_J_?.split('T')[0]}</span>,
    //   // width: '10%',
    // },
    {
      title: 'Designation',
      dataIndex: 'desG_',
      key: 'desG_',
      // width: '10%',
    },
    {
      title: 'Department',
      dataIndex: 'deptsno',
      key: 'deptsno',
      // width: '10%',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      //   width: 100,
    },
    {
      title: 'Location',
      dataIndex: 'loc',
      key: 'loc',
      //   width: 150,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      //   width: 130,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      //   width: 70,
    },
    // {
    //   title: 'Mobile',
    //   dataIndex: 'contacT_NO',
    //   key: 'contacT_NO',
    //   // width: '10%',
    // },
    // {
    //   title: 'Reporting Mng Name',
    //   dataIndex: 'reportinG_MANAGER_NM',
    //   key: 'reportinG_MANAGER_NM',
    //   // width: '10%',
    // },
    // {
    //   title: 'Reporting Mng Email',
    //   dataIndex: 'reportinG_MANAGER_MAIL_ID',
    //   key: 'reportinG_MANAGER_MAIL_ID',
    //   // width: '10%',
    // },
    // {
    //   title: 'Reporting Mng Mobile',
    //   dataIndex: 'reportinG_MANAGER_CONTACT_NO',
    //   key: 'reportinG_MANAGER_CONTACT_NO',
    //   // width: '10%',
    // },
    // {
    //   title: 'Reporting Mng Desg',
    //   dataIndex: 'reporting_MANAGER_DESG',
    //   key: 'reporting_MANAGER_DESG',
    //   // width: '5%',
    // },
    {
      title: 'JD Form',
      key: 'action',
      render: (_, record) => (
        <Link to="">
          <StepForwardOutlined style={{ fontSize: 18 }} />
        </Link>
      ),
    },
  ]

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
      <div className="def" style={{ paddingBottom: 10 }}>
        <div
          style={{
            padding: 5,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Row style={{ gap: 10 }}>
            {/* <Link to={'/employee/add_new'}>
              <Tooltip placement="top" title={'Add Candidate'}>
                <Button>
                  <PlusOutlined />
                </Button>
              </Tooltip>
            </Link>
            <Tooltip placement="top" title={'Import'}>
              <Button>
                <ImportOutlined />
              </Button>
            </Tooltip>
            <Tooltip placement="top" title={'Export'}>
              <Button>
                <ExportOutlined />
              </Button>
            </Tooltip>
            <Tooltip placement="top" title={'Approval Action'}>
              <Button disabled={false}>
                <UserSwitchOutlined />
              </Button>
            </Tooltip> */}
            <Search placeholder="Search in table..." allowClear style={{ width: 300 }} />
          </Row>
        </div>

        <Table
          //   rowSelection={{
          //     type: selectionType,
          //     ...rowSelection,
          //   }}
          tableLayout="fixed"
          columns={columns}
          pagination={{
            current: currentPage,
            total: totalRecords,
            position: ['bottomRight'],
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '35', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={locations}
          bordered={true}
          loading={loading}
          // scroll={{ y: 400 }}
          scroll={{ y: 500 }}
        />
      </div>
    </>
  )
}
export default Openings
