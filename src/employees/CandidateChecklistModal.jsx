import { Checkbox, Modal, Table, Tag, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import './employees.css'

const { Text } = Typography

const columns = [
  {
    title: 'Checklist Item',
    dataIndex: 'item',
    key: 'item',
    render: (_, record) => {
      if (record.section) {
        return {
          children: (
            <Text
              strong
              style={{
                //   background: '#f0f5ff',
                background: 'rgb(207 223 255)',
                padding: '6px 12px',
                display: 'inline-block',
                width: '100%',
              }}
            >
              {record.section}
            </Text>
          ),
          props: {
            colSpan: 2, // 👈 Span both columns
          },
        }
      }
      return {
        children: record?.item,
        props: {},
      }
    },
  },
  {
    title: 'Attachment',
    dataIndex: 'attachment',
    key: 'attachment',
    align: 'center',
    render: (value, record) =>
      record.item ? <Checkbox checked={value} onClick={(e) => e.preventDefault()} /> : null,
  },
  // {
  //   title: 'Details',
  //   dataIndex: 'details',
  //   key: 'details',
  //   align: 'center',
  //   render: (value, record) =>
  //     record.item ? <Checkbox checked={value} onClick={(e) => e.preventDefault()} /> : null,
  // },
]

const CandidateChecklistModal = ({ isModalOpen, setIsModalOpen, candidateId }) => {
  const [checklistData, setChecklistData] = useState([])

  const fetchChecklist = async (candidateId) => {
    try {
      const response = await axiosInstance(`/api/Candidate/checklist/${candidateId}`)
      // console.log('checklist api res: ', response)

      if (response.status === 200) {
        const d = response.data?.data
        const data = []

        // section 1: Checklist for joining
        data.push({ section: 'Checklist for the joining' })
        data.push({ item: 'RESUME', attachment: d.isResumeUploaded })
        data.push({
          item: 'ADHAR CARD -FRONT/BACK',
          attachment: d.isAadharAttachmentUploaded,
          // details: false,
        })
        data.push({ item: 'PAN CARD', attachment: d.isPanAttachmentUploaded })
        data.push({ item: 'PASSPORT PHOTO', attachment: d.isPassportPhotoUploaded })
        data.push({
          item: 'BANK PASSBOOK',
          attachment: d.isBankPassbookAttachmentUpoaded,
          // details: false,
        })
        data.push({
          item: 'EDUCATIONAL DOCUMENTS',
          attachment: d.isEducationAttachmentUploaded,
          // details: false,
        })
        data.push({
          item: 'EVALUATION FORM',
          attachment: d.isEvaluationAttachmentUploaded,
          // details: false,
        })
        data.push({
          item: 'OFFER LETTER',
          attachment: d.isOfferLetterAttachmentUploaded,
          // details: false,
        })
        data.push({
          item: 'INTERVIEW VIDEO',
          attachment: d.isInterviewVideoUploaded,
          // details: false,
        })

        // Section 2: Professional
        data.push({ section: 'Professional' })
        data.push({
          item: '3 MONTHS SALARY SLIPS',
          attachment: d.isSalarySlipUploaded,
          // details: false,
        })
        data.push({
          item: '3 MONTHS BANK STATEMENT',
          attachment: d.isBankStatementUploaded,
          // details: false,
        })
        data.push({
          item: 'PREVIOUS OFFER LETTER',
          attachment: d.isPrevOfferLetterUploaded,
          // details: false,
        })

        // Section 3: Joining Day
        // data.push({ section: 'Joining Day' })
        // data.push({ item: 'BIOMETRIC', attachment: false, details: false })
        // data.push({ item: 'SYSTEM-USER ID', attachment: false, details: false })

        // Section 4: After Joining
        // data.push({ section: 'After Joining' })
        // data.push({ item: 'CURRENT COMPANY VERIFICATION', attachment: false, details: false })

        // Assign unique keys to avoid React warnings
        const dataWithKeys = data.map((row, index) => ({ ...row, key: index + 1 }))
        setChecklistData(dataWithKeys)
      }
    } catch (error) {
      console.error('Error fetching checklist api: ', error)
    }
  }

  useEffect(() => {
    if (candidateId !== null) fetchChecklist(candidateId)
  }, [candidateId])

  return (
    <Modal
      title="Checklist for Joining"
      centered
      open={isModalOpen}
      footer={null}
      onCancel={() => setIsModalOpen(false)}
      width={'50vw'}
      styles={{ body: { maxHeight: '80vh', overflow: 'scroll', overflowX: 'hidden' } }}
    >
      <Table
        dataSource={checklistData}
        columns={columns}
        pagination={false}
        bordered
        size="small"
        rowClassName={(record) => (record.section ? 'section-row' : '')}
      />
    </Modal>
  )
}

export default CandidateChecklistModal
