import React from 'react'
import { Modal } from 'antd'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'

// Helper function to generate a random HEX color (for the icon circle)
const getRandomColor = () => {
  return (
    '#' +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')
  )
}

const CallHistoryTimeline = ({ isCallLogModalOpen, setIsCallLogModalOpen, logs = [] }) => {
  return (
    <Modal
      title="Call Logs"
      open={isCallLogModalOpen}
      onOk={() => setIsCallLogModalOpen(false)}
      onCancel={() => setIsCallLogModalOpen(false)}
      footer={null}
      // Adjust modal width/height as needed:
      style={{ minWidth: '70vw' }}
      bodyStyle={{ maxHeight: '60vh', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.1)' }}
    >
      <VerticalTimeline layout="2-columns" animate={true} lineColor="white">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <VerticalTimelineElement
              key={index}
              date={log.callDate}
              //   iconStyle={{
              //     background: getRandomColor(),
              //     color: '#fff',
              //   }}
              iconStyle={{
                background: getRandomColor(),
                color: '#fff',
                width: '40px',
                height: '40px',
                fontSize: '14px',
                top: '10px',
              }}
              // The "box" style for the timeline card:
              contentStyle={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                padding: '20px',
                // Try a gradient background if you want something more elaborate:
                // background: 'linear-gradient(135deg, #fefcea, #f1da36)',
              }}
              // The arrow pointing to the icon:
              contentArrowStyle={{
                borderRight: '7px solid #e0e0e0', // match border or background
              }}
            >
              <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
                HR: {log.hrName}
              </div>
              <div style={{ marginBottom: '4px', fontSize: '14px' }}>
                <strong>Call Time:</strong> {`${log.callStartTime} - ${log.callEndTime}`}
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>Remarks:</strong> {log.callResponse}
              </div>
            </VerticalTimelineElement>
          ))
        ) : (
          <div style={{ textAlign: 'left', padding: '20px' }}>
            <p>No call logs available</p>
          </div>
        )}
      </VerticalTimeline>
    </Modal>
  )
}

export default CallHistoryTimeline
