import { Space, Table, Input, message, Button } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import AddNewGroup from './AddNewGroup'
import { createNewGroup, getGroupList } from '../../services/Services'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  StepForwardOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import { Link } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useActionsMap } from '../../utils/useActionsMap'

const { Search } = Input

const GroupList = () => {
  const dispatch = useDispatch()
  const [groupsList, setGroupsList] = useState([])
  const [currentEditRow, setCurrentEditRow] = useState({})
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(null)
  const deletePopupRef = useRef(null)

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('>>>actionsMap grouplist:', actionsMap)

  const onSearch = (value, _e, info) => console.log(info?.source, value)

  // --- NORMAL FUNCTIONS ---
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

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(null)
  }

  const handleDeleteClick = (row) => {
    setDeleteConfirmationOpen(row?.id)
  }

  // --- APIS CALLING ---
  const fetchGroupData = async () => {
    try {
      dispatch(set({ loading: true }))
      const response = await getGroupList()

      const items = (response?.data?.data || []).map((item, idx) => ({
        ...item,
        key: item.id ?? item._id ?? `row-${idx}`,
      }))

      if (response.status === 200) {
        setGroupsList(items || [])
        // message.success(response?.data?.message || 'Fetched successfully')
      } else {
        setGroupsList([])
      }
    } catch (error) {
      console.error('fetch err: ', error)
      message.error(
        error?.response?.data || error?.response?.data?.message || 'Error in fetching data',
      )
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // when user clicks tick: read value from input and call createNewGroup
  const handleSaveRow = async (row) => {
    const rowId = row?.id
    if (!rowId || rowId == 0) {
      message.error('Invalid row selection')
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
      const response = await createNewGroup(rowId, newValue)
      console.log('response submitting row group name: ', response)

      if (response?.status === 200) {
        // message.success(response?.data?.message || 'Upserted successfully')
        fetchGroupData()
        setCurrentEditRow((prev) => {
          const copy = { ...prev }
          delete copy[rowId]
          return copy
        })
      }
    } catch (error) {
      message.error(error?.response?.data || error?.response?.data?.message || 'Some error occured')
      console.error('Error submitting row group name: ', error)
    }
  }

  // delete row
  const handleDeleteRow = async (row) => {
    try {
      const response = await axiosInstance.get(`/api/Group/DeleteGroup?id=${row?.id}`)
      console.log('response: ', response)

      if (response?.status === 200) {
        // message.success(response?.data?.message || 'Deleted successfully')
        fetchGroupData()
      }
    } catch (error) {
      console.error('error deleting group: ', error)
      message.error(error?.response?.data?.message || 'Error deleting group name')
    }
  }

  useEffect(() => {
    fetchGroupData()
  }, [])

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 200,
      render: (groupName, row) => {
        const rowId = row?.id

        // if edit icon is click for row
        if (currentEditRow[rowId]) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Input id={`group-edit-${rowId}`} defaultValue={groupName} style={{ width: '80%' }} />

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
        return groupName

        // console.log('row: ', row)
        // return currentEditRow[row?.id] ? <Input value={currentEditRowValue[row?.id]} onChange={e => handleRowGroupNameChange(e, row)} /> : groupName
      },
    },
    {
      title: 'Created On',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 150,
      render: (date) => (date === null ? null : String(date).split('T')[0]),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (row) => {
        const isDeleteConfirmOpen = deleteConfirmationOpen === row?.id

        return (
          <Space style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }} ref={isDeleteConfirmOpen ? deletePopupRef : null}>
              {actionsMap?.delete?.actionStatus && (
                <Button
                  icon={<DeleteOutlined />}
                  title="Delete Group"
                  // onClick={() => handleDeleteRow(row)}
                  onClick={() => handleDeleteClick(row)}
                />
              )}

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

            {actionsMap?.edit?.actionStatus && (
              <Button icon={<EditOutlined />} onClick={() => handleCurrentRowSelect(row)} />
            )}

            {actionsMap?.view?.actionStatus && (
              <Link
                to={`/holiday-master/groups/groupwisestorecodemapping/${row?.id}`}
                state={{ actionsMap: actionsMap?.view?.furtherParts }}
              >
                <Button icon={<StepForwardOutlined />}></Button>
              </Link>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <Space style={{ display: 'flex', justifyContent: 'end', gap: '0.8rem' }}>
        <AddNewGroup refresh={fetchGroupData} actionsMap={actionsMap} />
        {/* <Search placeholder="input search text" allowClear onSearch={onSearch} /> */}
      </Space>
      <Table dataSource={groupsList} columns={columns} />
    </div>
  )
}

export default GroupList
