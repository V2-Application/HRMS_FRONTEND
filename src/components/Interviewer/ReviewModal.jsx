import { StarFilled, StarOutlined } from '@ant-design/icons'
import { Modal, Row, Col, Space, Typography, Input, Checkbox, message } from 'antd'
import React, { useState } from 'react'
import StarRating from '../shared/StarRating'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import { f } from 'html2pdf.js'



const { Title, Text } = Typography
const { TextArea } = Input

const ReviewModal = ({ openResponsive, setOpenResponsive, onSubmit }) => {
  const data = [
    {
      category: 'Personality',
      subCategory: 'General Behavior, Manners, Grooming, Maturity',
      rating: '',
      remarks: '',
    },
    {
      category: 'Communication',
      subCategory: 'Can express himself/herself effectively, speaking, listening and expression',
      rating: '',
      remarks: '',
    },
    {
      category: 'Intelligence/Education',
      subCategory: 'Mental alertness and capability, clarity of thoughts, academic achievements',
      rating: '',
      remarks: '',
    },
    {
      category: 'Job related knowledge',
      subCategory:
        'Exhibits the good understanding of the functional competencies as they relate to the requirements of the position',
      rating: '',
      remarks: '',
    },
    {
      category: 'Attitude',
      subCategory:
        'Positive mental outlook and disposition in relating to people, responsibilities, situation, pursuance of the goals etc.',
      rating: '',
      remarks: '',
    },
    {
      category: 'Self Motivation',
      subCategory: 'Self starter and has drive towards excellence',
      rating: '',
      remarks: '',
    },
    {
      category: 'Team Work',
      subCategory:
        'Exhibits ability and comfort in working and collaborating with other and building and maintaining constructive constructive partnerships. Can inflence others for common objectives.',
      rating: '',
      remarks: '',
    },
    {
      category: 'Job Fit',
      subCategory: 'Suitable for the position in its fullness.',
      rating: '',
      remarks: '',
    },
  ]

  const [ratings, setRatings] = useState(Array(data.length).fill(0))
  const [remarks, setRemarks] = useState(Array(data.length).fill(''))
  const [finalRemarks, setFinalRemarks] = useState('')
  const [decision, setDecision] = useState('') // approve / reject
  const { loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()

  function resetModal() {
    setRatings(Array(data.length).fill(0));
    setRemarks(Array(data.length).fill(''));
  }

  const handleSubmit = async () => {
    await dispatch(set({ loading: true }))
    if (!decision) {
      message.error('Please select Approve or Reject')
      await dispatch(set({ loading: false }));
      return
    }

    if (ratings.some(r => r === 0)) {
      message.error('Please rate all categories')
      await dispatch(set({ loading: false }));
      return
    }

    if (remarks.some(r => r.trim() === '')) {
      message.error('Please fill in all remarks')
      await dispatch(set({ loading: false }));
      return
    }

    if (finalRemarks.trim() === '') {
      message.error('Please fill in Final Remarks')
      await dispatch(set({ loading: false }));
      return
    }

    try {
      const reviewData = data.map((item, idx) => ({
        category: item.category,
        subCategory: item.subCategory,
        rating: ratings[idx],
        remarks: remarks[idx],
      }))

      const payload = {
        decision, // 'approve' or 'reject'
        reviews: reviewData,
        finalRemarks,
      }
      // console.log('Submitting review:', payload);
      await onSubmit(payload);
      resetModal();
    } catch (error) {
      await dispatch(set({ loading: false }));
      console.error('Error submitting review:', error)
      message.error('Failed to submit review')  
    } finally {
      await dispatch(set({ loading: false }))
      setOpenResponsive(false)
      resetModal();
    } 

    // try {
    //   const res = await fetch('/api/submit-review', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload),
    //   })

    //   if (!res.ok) throw new Error('Failed to submit review')

    //   const result = await res.json()
    //   message.success('Review submitted successfully')
    //   setOpenResponsive(false)
    // } catch (err) {
    //   console.error(err)
    //   message.error('Failed to submit review')
    // }
  }

  return (
    <Modal
      title={
        <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
          Fill Review Form
        </Title>
      }
      centered
      open={openResponsive}
      onOk={handleSubmit}
      onCancel={() => setOpenResponsive(false)}
      width={1000}
      style={{ maxHeight: '80vh', overflow: 'auto' }}
      confirmLoading={loading}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row>
          <Checkbox
            checked={decision === 'Qualified'}
            onChange={() => setDecision('Qualified')}
          >
            Approve
          </Checkbox>
          <Checkbox
            checked={decision === 'Rejected'}
            onChange={() => setDecision('Rejected')}
            style={{ marginLeft: 10 }}
          >
            Reject
          </Checkbox>
        </Row>

        {data.map((dt, idx) => (
          <Space
            key={idx}
            direction="vertical"
            size="small"
            style={{
              width: '100%',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgb(203 197 197)',
            }}
          >
            <Row>
              <Col span={24}>
                <Text strong>{`${idx + 1}. ${dt.category}`}</Text>
                <br />
                <Text style={{ fontSize: '0.75rem' }}>[{dt.subCategory}]</Text>
              </Col>
            </Row>

            <Row>
              <Col>
                <div style={{ display: 'flex', gap: '5px', fontSize: '1.1rem' }}>
                  <StarRating
                    value={ratings[idx]}
                    onChange={(val) => {
                      const updated = [...ratings]
                      updated[idx] = val
                      setRatings(updated)
                    }}
                  />
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <TextArea
                  rows={1}
                  placeholder="Remarks..."
                  value={remarks[idx]}
                  onChange={(e) => {
                    const updated = [...remarks]
                    updated[idx] = e.target.value
                    setRemarks(updated)
                  }}
                />
              </Col>
            </Row>
          </Space>
        ))}

        <Row>
          <Col span={24}>
            <Text strong>Final Remarks</Text>
            <TextArea
              rows={2}
              value={finalRemarks}
              onChange={(e) => setFinalRemarks(e.target.value)}
              placeholder="Write your final remarks here..."
            />
          </Col>
        </Row>
      </Space>
    </Modal>
  )
}

export default ReviewModal
