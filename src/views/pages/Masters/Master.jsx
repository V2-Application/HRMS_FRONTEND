// import React, { useEffect, useState } from 'react'
// import { useLocation } from 'react-router-dom'
// import styled from 'styled-components'
// import MasterCard from '../../../components/Master/MasterCard'
// import MasterTable from '../../../components/Master/MasterTable'
// import { Button, Input, Row, Tooltip, Space, Input as AntInput, Checkbox, Col, message } from 'antd'
// import {
//   AppstoreOutlined,
//   PlusOutlined,
//   TableOutlined,
//   EditOutlined,
//   CheckOutlined,
//   CloseOutlined,
//   ExportOutlined,
// } from '@ant-design/icons'
// import { getMasterData } from '../../../services/Services'
// import { useSelector } from 'react-redux'
// import { exportExcelFromFrontend } from '../../../components/shared/ExportExceFromFrontend'
// import { useActionsMap } from '../../../utils/useActionsMap'

// const { Search } = Input

// const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
//   const [searchText, setSearchText] = useState('')

//   // const filteredOptions = dataList.filter((item) =>
//   //   item.toLowerCase().includes(searchText.toLowerCase()),
//   // )
//   const filteredOptions = dataList.filter((item) =>
//     String(item).toLowerCase().includes(searchText.toLowerCase()),
//   )

//   const handleChange = (checkedValues) => {
//     setFilterValues(checkedValues)
//   }

//   const handleReset = () => {
//     setFilterValues([])
//     setSearchText('')
//     confirm()
//   }

//   return (
//     <div style={{ padding: 8, width: 215 }}>
//       <Input
//         placeholder={`Search ${title}`}
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         style={{ marginBottom: 8, display: 'block' }}
//       />

//       <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
//         <Checkbox.Group
//           value={filterValues}
//           onChange={handleChange}
//           style={{ display: 'flex', flexDirection: 'column' }}
//         >
//           {filteredOptions.map((value) => (
//             <Checkbox key={value} value={value}>
//               {value}
//             </Checkbox>
//           ))}
//         </Checkbox.Group>
//       </div>

//       <Space style={{ marginTop: 8 }}>
//         <Button type="primary" size="small" onClick={() => confirm()}>
//           Filter
//         </Button>
//         <Button size="small" onClick={handleReset}>
//           Reset
//         </Button>
//       </Space>
//     </div>
//   )
// }

// // Styled wrapper for fade in/out
// const FadeInOut = styled.div`
//   transition: opacity 0.3s ease-in-out;
//   opacity: ${(props) => (props.show ? 1 : 0)};
//   display: ${(props) => (props.show ? 'block' : 'none')};
// `

// const Master = () => {
//   const { pathname } = useLocation()
//   const [view, setView] = useState('table')
//   const [data, setData] = useState([])
//   const [editingId, setEditingId] = useState(null)
//   const [editValue, setEditValue] = useState('')
//   const [idFilterValues, setIdFilterValues] = useState([])
//   const [nameFilterValues, setNameFilterValues] = useState([])
//   const [lodingLocal, setlodingLocal] = useState(false)
//   const [filteredData, setFilteredData] = useState([])
//   const [searchQuery, setSearchQuery] = useState('')

//   const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
//   const actionsMap = useActionsMap(filteredSideMenu)
//   console.log('actionsMap: ', actionsMap)

//   // Fetch master data based on current route
//   const fetchMasterData = async () => {
//     try {
//       const res = await getMasterData({ pathname })
//       console.log('res', res)
//       if (res.status === 200) {
//         const formatted = res.data?.data?.map((dt) => ({
//           id: pathname === '/master/designations' ? dt.designationId : dt.departmentId,
//           name: pathname === '/master/designations' ? dt.designationName : dt.departmentName,
//         }))
//         setData(formatted)
//       }
//     } catch (err) {
//       console.error('Error fetching master data:', err)
//     }
//   }

//   useEffect(() => {
//     fetchMasterData()
//   }, [pathname])

//   useEffect(() => {
//     const new_search = String(searchQuery).toLowerCase().trim()

//     if (new_search.length === 0) {
//       setFilteredData(data)
//     } else {
//       const filtered = data?.filter((dt) =>
//         Object.values(dt).some((d) => String(d).toLowerCase().trim().includes(new_search)),
//       )

//       setFilteredData(filtered)
//     }
//   }, [searchQuery, data, pathname])

//   // Handlers for edit, approve, reject
//   const handleEdit = (record) => {
//     setEditingId(record.id)
//     setEditValue(record.name)
//   }

//   const handleApprove = () => {
//     setData((prev) =>
//       prev.map((item) => (item.id === editingId ? { ...item, name: editValue } : item)),
//     )
//     setEditingId(null)
//     setEditValue('')
//   }

//   const handleReject = () => {
//     setEditingId(null)
//     setEditValue('')
//   }

//   // Table columns definition
//   const columns = [
//     {
//       title: 'ID',
//       dataIndex: 'id',
//       key: 'id',
//       width: '10%',
//       render: (_, value, index) => value?.id,
//       filteredValue: idFilterValues.length ? idFilterValues : null,
//       onFilter: (value, record) => idFilterValues.includes(record.id),
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="ID"
//           dataIndex="id"
//           dataList={[...new Set(data.map((item) => item.id))]}
//           filterValues={idFilterValues}
//           setFilterValues={setIdFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: pathname.includes('/designations') ? 'Designation' : 'Department',
//       dataIndex: 'name',
//       key: 'name',
//       width: '70%',
//       filteredValue: nameFilterValues.length ? nameFilterValues : null,
//       onFilter: (value, record) => nameFilterValues.includes(record.name),
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title={pathname.includes('/designations') ? 'Designation' : 'Department'}
//           dataIndex="name"
//           dataList={[...new Set(data.map((item) => item.name))]}
//           filterValues={nameFilterValues}
//           setFilterValues={setNameFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (text, record) => (
//         <>
//           <FadeInOut show={editingId !== record.id}>{record.name}</FadeInOut>
//           <FadeInOut show={editingId === record.id}>
//             <AntInput
//               value={editValue}
//               onChange={(e) => setEditValue(e.target.value)}
//               style={{ width: '100%' }}
//             />
//           </FadeInOut>
//         </>
//       ),
//     },

//     // {
//     //   title: 'Action',
//     //   key: 'action',
//     //   width: '20%',
//     //   render: (_, record) =>
//     //     editingId === record.id ? (
//     //       <Space>
//     //         <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove} size="small" />
//     //         <Button danger icon={<CloseOutlined />} onClick={handleReject} size="small" />
//     //       </Space>
//     //     ) : (
//     //       <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
//     //     ),
//     // },
//   ]

//   const downloadExcel = () => {
//     const name = pathname.includes('/designations')
//       ? 'Designation Name'
//       : pathname.includes('/departments')
//         ? 'Department Name'
//         : ''

//     const columns = [{ header: name, key: 'name' }]
//     const fileName = pathname.includes('/designations')
//       ? 'Designations'
//       : pathname.includes('/departments')
//         ? 'Departments'
//         : ''
//     try {
//       const response = exportExcelFromFrontend(columns, filteredData, fileName)

//       if (response.success) {
//         message.success(response.message)
//       } else {
//         message.error(response.success)
//       }
//     } catch (error) {
//       message.error(error?.message || 'Some error occured')
//     }
//   }

//   return (
//     <>
//       <div
//         style={{
//           padding: 5,
//           display: 'flex',
//           justifyContent: 'flex-end',
//           alignItems: 'center',
//         }}
//       >
//         <Row style={{ gap: 10 }}>
//           {actionsMap?.export?.actionStatus && (
//             <Col>
//               <Tooltip placement="top" title={'Export'}>
//                 <Button style={{ marginLeft: 5 }} loading={lodingLocal} onClick={downloadExcel}>
//                   <ExportOutlined />
//                 </Button>
//               </Tooltip>
//             </Col>
//           )}

//           <Search
//             placeholder="Search in table..."
//             allowClear
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             style={{ width: 300 }}
//           />
//         </Row>
//       </div>

//       {view === 'grid' ? (
//         <div
//           style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//             gap: '2rem 1.5rem',
//             justifyContent: 'center',
//             padding: '8px 0',
//           }}
//         >
//           {data.length ? (
//             data.map((dt) => <MasterCard name={dt.name} key={dt.id} />)
//           ) : (
//             <div style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem' }}>
//               No data available
//             </div>
//           )}
//         </div>
//       ) : (
//         <MasterTable
//           columns={columns}
//           dataSource={filteredData}
//           columnWidthsPercent={{ index: 10, name: 70, action: 20 }}
//         />
//       )}
//     </>
//   )
// }

// export default Master


import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import MasterCard from '../../../components/Master/MasterCard'
import MasterTable from '../../../components/Master/MasterTable'
import { Button, Input, Row, Tooltip, Space, Input as AntInput, Checkbox, Col, message } from 'antd'
import {
  AppstoreOutlined,
  PlusOutlined,
  TableOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import { getMasterData } from '../../../services/Services'
import { useSelector } from 'react-redux'
import { exportExcelFromFrontend } from '../../../components/shared/ExportExceFromFrontend'
import { useActionsMap } from '../../../utils/useActionsMap'

const { Search } = Input

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')

  // const filteredOptions = dataList.filter((item) =>
  //   item.toLowerCase().includes(searchText.toLowerCase()),
  // )
  const filteredOptions = dataList.filter((item) =>
    String(item).toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleChange = (checkedValues) => {
    setFilterValues(checkedValues)
  }

  const handleReset = () => {
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
          value={filterValues}
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
        <Button type="primary" size="small" onClick={() => confirm()}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

// Styled wrapper for fade in/out
const FadeInOut = styled.div`
  transition: opacity 0.3s ease-in-out;
  opacity: ${(props) => (props.show ? 1 : 0)};
  display: ${(props) => (props.show ? 'block' : 'none')};
`

const Master = () => {
  const { pathname } = useLocation()
  const [view, setView] = useState('table')
  const [data, setData] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [idFilterValues, setIdFilterValues] = useState([])
  const [nameFilterValues, setNameFilterValues] = useState([])
  const [lodingLocal, setlodingLocal] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100) // Set default page size to 100

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('actionsMap: ', actionsMap)

  // Fetch master data based on current route
  const fetchMasterData = async () => {
    try {
      const res = await getMasterData({ pathname })
      console.log('res', res)
      if (res.status === 200) {
        const formatted = res.data?.data?.map((dt) => ({
          id: pathname === '/master/designations' ? dt.designationId : dt.departmentId,
          name: pathname === '/master/designations' ? dt.designationName : dt.departmentName,
        }))
        setData(formatted)
      }
    } catch (err) {
      console.error('Error fetching master data:', err)
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [pathname])

  useEffect(() => {
    const new_search = String(searchQuery).toLowerCase().trim()

    if (new_search.length === 0) {
      setFilteredData(data)
    } else {
      const filtered = data?.filter((dt) =>
        Object.values(dt).some((d) => String(d).toLowerCase().trim().includes(new_search)),
      )

      setFilteredData(filtered)
    }
  }, [searchQuery, data, pathname])

  // Handlers for edit, approve, reject
  const handleEdit = (record) => {
    setEditingId(record.id)
    setEditValue(record.name)
  }

  const handleApprove = () => {
    setData((prev) =>
      prev.map((item) => (item.id === editingId ? { ...item, name: editValue } : item)),
    )
    setEditingId(null)
    setEditValue('')
  }

  const handleReject = () => {
    setEditingId(null)
    setEditValue('')
  }

  // Table columns definition
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      render: (_, value, index) => value?.id,
      filteredValue: idFilterValues.length ? idFilterValues : null,
      onFilter: (value, record) => idFilterValues.includes(record.id),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="ID"
          dataIndex="id"
          dataList={[...new Set(data.map((item) => item.id))]}
          filterValues={idFilterValues}
          setFilterValues={setIdFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: pathname.includes('/designations') ? 'Designation' : 'Department',
      dataIndex: 'name',
      key: 'name',
      width: '70%',
      filteredValue: nameFilterValues.length ? nameFilterValues : null,
      onFilter: (value, record) => nameFilterValues.includes(record.name),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={pathname.includes('/designations') ? 'Designation' : 'Department'}
          dataIndex="name"
          dataList={[...new Set(data.map((item) => item.name))]}
          filterValues={nameFilterValues}
          setFilterValues={setNameFilterValues}
          confirm={confirm}
        />
      ),
      render: (text, record) => (
        <>
          <FadeInOut show={editingId !== record.id}>{record.name}</FadeInOut>
          <FadeInOut show={editingId === record.id}>
            <AntInput
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{ width: '100%' }}
            />
          </FadeInOut>
        </>
      ),
    },

    // {
    //   title: 'Action',
    //   key: 'action',
    //   width: '20%',
    //   render: (_, record) =>
    //     editingId === record.id ? (
    //       <Space>
    //         <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove} size="small" />
    //         <Button danger icon={<CloseOutlined />} onClick={handleReject} size="small" />
    //       </Space>
    //     ) : (
    //       <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
    //     ),
    // },
  ]

  const downloadExcel = () => {
    const name = pathname.includes('/designations')
      ? 'Designation Name'
      : pathname.includes('/departments')
        ? 'Department Name'
        : ''

    const columns = [{ header: name, key: 'name' }]
    const fileName = pathname.includes('/designations')
      ? 'Designations'
      : pathname.includes('/departments')
        ? 'Departments'
        : ''
    try {
      const response = exportExcelFromFrontend(columns, filteredData, fileName)

      if (response.success) {
        message.success(response.message)
      } else {
        message.error(response.success)
      }
    } catch (error) {
      message.error(error?.message || 'Some error occured')
    }
  }

  return (
    <>
      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Row style={{ gap: 10 }}>
          {actionsMap?.export?.actionStatus && (
            <Col>
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal} onClick={downloadExcel}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            </Col>
          )}

          <Search
            placeholder="Search in table..."
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
        </Row>
      </div>

      {view === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem 1.5rem',
            justifyContent: 'center',
            padding: '8px 0',
          }}
        >
          {data.length ? (
            data.map((dt) => <MasterCard name={dt.name} key={dt.id} />)
          ) : (
            <div style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem' }}>
              No data available
            </div>
          )}
        </div>
      ) : (
        <MasterTable
          columns={columns}
          dataSource={filteredData}
          columnWidthsPercent={{ index: 10, name: 70, action: 20 }}
          pagination={{
            current: currentPage,
            total: filteredData.length,
            pageSize: pageSize,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      )}
    </>
  )
}

export default Master
