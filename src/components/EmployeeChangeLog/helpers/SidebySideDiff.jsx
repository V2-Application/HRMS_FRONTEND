import computeDiff from './computeDiff'
import { Typography } from 'antd'

const { Text } = Typography

export default function SideBySideDiff({ oldValue, newValue }) {
  const { changed, oldChunks, newChunks } = computeDiff(oldValue, newValue)

  function renderChunks(chunks = []) {
    return chunks.map((c, index) => {
      let style = {}

      if (c?.type === 'added') {
        style = {
          background: 'rgba(82, 196, 26, 0.15)',
          padding: '0 2px',
          borderRadius: 2,
        }
      } else if (c?.type === 'removed') {
        style = {
          background: 'rgba(255, 77, 79, 0.1)',
          padding: '0 2px',
          borderRadius: 2,
          textDecoration: 'line-through',
        }
      }

      return (
        <span key={index} style={style}>
          {c?.text}
        </span>
      )
    })
  }

  return (
    <div className="side-by-side-diff" style={{ display: 'grid', gap: 16, marginTop: 8 }}>
      <div>
        <Text type="secondary">Old</Text>

        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            maxHeight: 140,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {changed ? (
            renderChunks(oldChunks)
          ) : (
            <Text type="secondary">{oldValue === '' ? '(empty)' : oldValue}</Text>
          )}
        </div>
      </div>

      <div>
        <Text type="secondary">New</Text>

        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 6,
            padding: 8,
            marginTop: 4,
            maxHeight: 140,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {changed ? (
            renderChunks(newChunks)
          ) : (
            <Text>{newValue === '' ? <Text type="secondary">(empty)</Text> : newValue}</Text>
          )}
        </div>
      </div>
    </div>
  )
}
