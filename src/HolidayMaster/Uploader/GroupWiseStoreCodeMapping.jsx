import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
  StepForwardOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Space, Table, Input, Button, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import Uploader from './Uploader'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createEditNewGroupStore,
  createNewGroup,
  getGroupWiseStoreCodeMapping,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../services/axiosInstance'
import { useActionsMap } from '../../utils/useActionsMap'

const { Search } = Input

const GroupWiseStoreCodeMapping = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()
  const location = useLocation()

  const { groupId } = params
  const {
    state: { actionsMap = [] },
  } = location

  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentEditRow, setCurrentEditRow] = useState({})
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(null)
  const deletePopupRef = useRef(null)
  const [shouldUploadShow, setShouldUploadShow] = useState(false)
  const [shouldDeleteShow, setShouldDeleteShow] = useState(false)

  useEffect(() => {
    if (Array.isArray(actionsMap) && actionsMap.length > 0) {
      actionsMap.forEach((actions) => {
        if (actions?.actionFurtherPartName?.toLowerCase() === 'delete') {
          setShouldDeleteShow(actions?.furtherPartStatus)
        }

        if (actions?.actionFurtherPartName?.toLowerCase() === 'upload') {
          setShouldUploadShow(actions?.furtherPartStatus)
        }
      })
    }
  }, [actionsMap])

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(null)
  }

  const handleDeleteClick = (row) => {
    setDeleteConfirmationOpen(row.id)
  }

  const filterTableData = () => {
    if (search?.trim() === '') {
      setFilteredData(data)
    } else {
      const filtered = data?.filter((dt) =>
        Object.values(dt)?.some((d) =>
          String(d)?.toLowerCase().includes(String(search).toLowerCase()),
        ),
      )

      setFilteredData(filtered)
    }
  }
  useEffect(() => {
    filterTableData()
  }, [search, data])

  const handleCurrentRowSelect = (row) => {
    const currentRowId = row?.id || 0

    if (currentRowId === 0) {
      message.error('Invalid row selection')
      return false
    } else {
      setCurrentEditRow((prev) => {
        const prevData = { ...prev }

        if (prevData[currentRowId]) delete prevData[currentRowId]
        else prevData[currentRowId] = true

        return prevData
      })
    }
  }

  const handleCancelEdit = (row) => {
    const rowId = row?.id
    setCurrentEditRow((prev) => {
      const copy = { ...prev }
      delete copy[rowId]
      return copy
    })
  }

  const fetchData = async () => {
    try {
      // dispatch(set({ loading: true }))
      const response = await getGroupWiseStoreCodeMapping(groupId)
      // console.log('response: ', response)

      if (response?.status === 200) {
        const items = (response?.data?.data || []).map((item, idx) => ({
          ...item,
          key: item?.id ?? `row-${idx}`,
        }))

        setData(items || [])
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching GroupWiseStoreCodeMapping data: ', error)
    }
    // finally {
    //   dispatch(set({ loading: false }))
    // }
  }
  useEffect(() => {
    fetchData()
  }, [groupId])

  // when user clicks tick: read value from input and call createNewGroup
  const handleSaveRow = async (row) => {
    const rowId = row?.id
    const groupId = row?.groupId

    if (!rowId || rowId == 0) {
      message.error('Invalid row selection')
      return false
    }

    // Input element has id `group-edit-${rowId}`
    const el = document.getElementById(`group-edit-${rowId}`)
    const newValue = el?.value ?? ''

    // validate newValue
    if (!newValue?.trim()) {
      message.error('Group name cannot be empty')
      return false
    }
    try {
      const response = await createEditNewGroupStore(rowId, groupId, newValue)
      // console.log('response submitting row group name: ', response)

      if (response?.status === 200) {
        // message.success(response?.data?.message || 'Upserted successfully')
        fetchData()
        setCurrentEditRow((prev) => {
          const copy = { ...prev }
          delete copy[rowId]
          return copy
        })
      }
    } catch (error) {
      message.error(error?.response?.data || error?.response?.data?.message || 'Some error occured')
      console.error('Error submitting row store name: ', error)
    }
  }

  const handleDeleteRow = async (row) => {
    try {
      const response = await axiosInstance.get(
        `/api/GroupWiseStoreCodeMapping/DeleteMapping?id=${row?.id}`,
      )
      console.log('response: ', response)

      if (response?.status === 200) {
        // message.success(response?.data?.message || 'Deleted successfully')
        fetchData()
      } else {
        message.error(response?.response?.data?.message || 'Error deleting group name')
      }
    } catch (error) {
      console.error('error deleting group: ', error)
      message.error(error?.response?.data?.message || 'Error deleting group name')
    }
  }

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 250,
    },
    {
      title: 'Store Code',
      dataIndex: 'sT_CD',
      key: 'sT_CD',
      width: 500,
      render: (sT_CD, row) => {
        const rowId = row?.id

        // if edit icon is click for row
        if (currentEditRow[rowId]) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Input id={`group-edit-${rowId}`} defaultValue={sT_CD} style={{ width: '80%' }} />

              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleSaveRow(row)}
                title="Save"
              />

              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => handleCancelEdit(row)}
                title="Cancel"
              />
            </div>
          )
        }

        // not editing -> show plain value
        return sT_CD

        // console.log('row: ', row)
        // return currentEditRow[row?.id] ? <Input value={currentEditRowValue[row?.id]} onChange={e => handleRowGroupNameChange(e, row)} /> : groupName
      },
    },
    {
      title: 'Created On',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: (date) => (date === null ? null : String(date).split('T')[0]),
    },
  ]

  shouldDeleteShow &&
    columns.push({
      title: 'Action',
      key: 'action',
      width: 150,
      render: (row) => {
        const isDeleteConfirmOpen = deleteConfirmationOpen === row?.id

        return (
          <Space style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }} ref={isDeleteConfirmOpen ? deletePopupRef : null}>
              <Button
                icon={<DeleteOutlined />}
                title="Delete Group"
                // onClick={() => handleDeleteRow(row)}
                onClick={() => handleDeleteClick(row)}
              />

              {isDeleteConfirmOpen && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: '0px',
                    right: '45px', // Position to the left of the delete button
                    backgroundColor: '#ffffff',
                    padding: '8px',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e5e7eb',
                    minWidth: '80px',
                  }}
                >
                  <span style={{ fontSize: '15px', color: '#595959', whiteSpace: 'nowrap' }}>
                    Delete?
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleDeleteRow(row)}
                    style={{
                      color: '#52c41a',
                      padding: '2px 4px',
                      minWidth: '24px',
                      height: '24px',
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={handleDeleteCancel}
                    style={{
                      color: '#ff4d4f',
                      padding: '2px 4px',
                      minWidth: '24px',
                      height: '24px',
                    }}
                  />
                </div>
              )}
            </div>

            {/* <Button icon={<EditOutlined />} onClick={() => handleCurrentRowSelect(row)}></Button> */}
          </Space>
        )
      },
    })

  return (
    <>
      <Uploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />
      <div>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => navigate('/holiday-master/groups')}
            type="primary"
          />
          <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
            {shouldUploadShow && (
              <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)} />
            )}
            <Search
              allowClear
              placeholder="Search in table..."
              style={{ width: '250px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Space>
        <Table dataSource={filteredData} columns={columns} />
      </div>
    </>
  )
}

export default GroupWiseStoreCodeMapping
