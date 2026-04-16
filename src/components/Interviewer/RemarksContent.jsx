import React, { useState } from 'react'
import { Button, Input } from 'antd'
const { TextArea } = Input

const RemarksContent = ({ onSubmit }) => {
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!remarks.trim()) {
      setError('Remarks is mandatory!')
    } else {
      setError('')
      onSubmit(remarks)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
      <TextArea
        rows={4}
        placeholder="Enter remarks here"
        value={remarks}
        onChange={(e) => {
          setRemarks(e.target.value)
          setError('')
        }}
        style={{ borderColor: error ? 'red' : '' }}
      />

      {error && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <Button type="primary" onClick={handleSubmit} style={{ fontSize: '13px' }}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default RemarksContent
