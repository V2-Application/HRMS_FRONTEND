import React from 'react'
import { UploadOutlined, VideoCameraOutlined, FileOutlined } from '@ant-design/icons'

/**
 * Horizontal scroll carousel for attachments.
 * Shows image preview for images, video icon for video, and file icon for others.
 * @param {{ uid: string, name: string, url?: string, thumbUrl?: string }[]} files
 */
export default function AttachmentCarousel({ files = [] }) {
  if (!files.length) return null

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        padding: '8px 0',
        borderTop: '1px solid #f0f0f0',
        marginTop: 16,
      }}
    >
      {files.map((file) => {
        const href = file.url || file.thumbUrl
        const name = file.name
        const isImage = /\.(jpe?g|png|gif)$/i.test(href)
        const isVideo = /\.(mp4|webm|ogg)$/i.test(href)

        let content = null
        if (isImage) {
          content = (
            <img src={href} alt={name} style={{ maxWidth: 24, maxHeight: 24, marginBottom: 4 }} />
          )
        } else if (isVideo) {
          content = <VideoCameraOutlined style={{ fontSize: 24, marginBottom: 4 }} />
        } else {
          content = <FileOutlined style={{ fontSize: 24, marginBottom: 4 }} />
        }

        return (
          <div
            key={file.uid}
            onClick={() => window.open(href, '_blank')}
            style={{
              minWidth: 100,
              padding: 8,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {content}
            <div
              style={{
                fontSize: 12,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
