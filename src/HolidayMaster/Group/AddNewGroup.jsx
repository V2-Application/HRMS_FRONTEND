import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Input, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { createNewGroup } from '../../services/Services'

const AddNewGroup = ({ refresh, actionsMap }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const groupRef = useRef(null)
  const [groupName, setGroupName] = useState('')
  const [isGroupNameFilled, setIsGroupNameFilled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (groupRef.current && !groupRef.current.contains(event.target)) {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isModalOpen])

  const handleCreateNewGroup = async (id) => {
    if (String(groupName).length === 0 || String(groupName).trim() === '') {
      setIsGroupNameFilled(false)
      return false
    }

    try {
      setIsLoading(true)
      const response = await createNewGroup(id, groupName)
      console.log('response: ', response)

      if (response?.status === 200) {
        // message.success(response?.data?.message || 'Upserted Successfully')
        setGroupName('')
        setIsModalOpen(false)
        await refresh()
      } else {
        message.error(response?.response?.data?.message || 'Group name already exists')
      }
    } catch (error) {
      console.error('error creating form: ', error)
      message.error(
        error?.response?.data?.message || error?.response?.data || 'Group name already exists',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const modalStyles = {
    position: 'absolute',
    zIndex: 1000,
    top: '48px',
    right: '0px',
    backgroundColor: '#ffffff',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    width: '320px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    animation: isModalOpen ? 'slideIn 0.2s ease-out' : 'slideOut 0.2s ease-in',
    transformOrigin: 'top right',
  }

  const headerStyles = {
    padding: '16px 20px 12px 20px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  }

  const titleStyles = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#262626',
    lineHeight: '24px',
  }

  const closeButtonStyles = {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8c8c8c',
    transition: 'all 0.2s ease',
  }

  const contentStyles = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  const inputContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }

  const labelStyles = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#595959',
    marginBottom: '4px',
  }

  const actionStyles = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '8px',
  }

  const inputStyles = {
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    borderColor: isGroupNameFilled ? '#d9d9d9' : '#ff4d4f',
    boxShadow: isGroupNameFilled ? 'none' : '0 0 0 2px rgba(255, 77, 79, 0.2)',
  }

  const createButtonStyles = {
    borderRadius: '8px',
    height: '40px',
    fontWeight: 500,
    minWidth: '80px',
  }

  const cancelButtonStyles = {
    borderRadius: '8px',
    height: '40px',
    fontWeight: 500,
    minWidth: '70px',
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes slideOut {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
          }

          .close-button:hover {
            background-color: #f5f5f5 !important;
            color: #ff4d4f !important;
          }

          .input-focus:focus {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
          }

          .create-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
          }
        `}
      </style>

      <div style={{ position: 'relative' }} ref={groupRef}>
        {actionsMap?.addgroup?.actionStatus && (
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen((prev) => !prev)}
            style={{
              borderRadius: '8px',
              // height: '40px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Add Group
          </Button>
        )}

        {isModalOpen && (
          <div style={modalStyles}>
            {/* Header */}
            <div style={headerStyles}>
              <h4 style={titleStyles}>Create New Group</h4>
              <button
                className="close-button"
                style={closeButtonStyles}
                onClick={() => setIsModalOpen(false)}
              >
                <CloseOutlined style={{ fontSize: '14px' }} />
              </button>
            </div>

            {/* Content */}
            <div style={contentStyles}>
              <div style={inputContainerStyles}>
                <label style={labelStyles}>Group Name</label>
                <Input
                  className="input-focus"
                  allowClear
                  placeholder="Enter a unique group name"
                  value={groupName}
                  onChange={(event) => {
                    setIsGroupNameFilled(true)
                    setGroupName(event.target.value)
                  }}
                  style={inputStyles}
                  size="large"
                />
                {!isGroupNameFilled && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#ff4d4f',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ⚠ Group name is required
                  </span>
                )}
              </div>

              <div style={actionStyles}>
                <Button
                  style={cancelButtonStyles}
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="create-button"
                  type="primary"
                  loading={isLoading}
                  onClick={() => handleCreateNewGroup(0)}
                  style={createButtonStyles}
                >
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AddNewGroup
