import { PlusOutlined } from '@ant-design/icons'
import { Button, Input, message, Modal } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import axiosInstance from '../../../services/axiosInstance'

const NewRole = ({ getRoles }) => {
  const modalRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addRole = async () => {
    if (String(roleName).trim() === '') {
      setIsError(true)
      return false
    } else {
      setIsError(false)
    }

    try {
      setIsLoading(true)
      const requestBody = {
        id: 0,
        roleName,
        description: '',
        createdBy: 'System',
      }

      const response = await axiosInstance.post('/api/RBAC/upsert-role', requestBody)
      console.log('response: ', response)

      if (response.status === 200) {
        message.success(response?.data?.message || 'Role created successfully')
        setRoleName('')
        setIsModalOpen(false)
        getRoles()
      }
    } catch (error) {
      console.error('error is adding role: ', error)
      message.success(error?.response?.data?.message || 'Error in creating role.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false)
        setIsError(false)
      }
    }

    if (isModalOpen) document.addEventListener('mousedown', handleClickOutside)
    else document.removeEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isModalOpen])

  return (
    <div style={{ position: 'relative' }} ref={modalRef}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen((prev) => !prev)}
      >
        Add Role
      </Button>

      {isModalOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            backgroundColor: 'white',
            width: '20rem',
            height: '4rem',
            top: '40px',
            right: '0px',
            boxShadow: '0px 0px 10px #938e8e',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '4px 8px',
            boxSizing: 'border-box',
          }}
        >
          <Input
            placeholder="Enter role"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            status={isError ? 'error' : ''}
            disabled={isLoading ? true : false}
          />
          <Button type="primary" onClick={addRole} loading={isLoading ? true : false}>
            Create
          </Button>
        </div>
      )}
    </div>
  )
}

export default NewRole
