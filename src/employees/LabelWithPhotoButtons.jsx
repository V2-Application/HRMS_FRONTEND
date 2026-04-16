// import React, { useRef, useState } from 'react'
// import { Button, Tooltip, Typography } from 'antd'
// import { UploadOutlined } from '@ant-design/icons'
// import axios from 'axios'
// import { set } from '../redux/uiSlice'
// import { useDispatch } from 'react-redux'

import { UploadOutlined } from '@ant-design/icons'
import { Button, Tooltip, Typography } from 'antd'
import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { set } from '../redux/uiSlice'
import axios from 'axios'

const { Text } = Typography

// const { Text } = Typography

// function LabelWithPhotoButtons({
//   label,
//   form,
//   fieldKey1 = 'Photo1',
//   fieldKey2 = 'Photo2',
//   name1 = 'Photo 1',
//   name2 = 'Photo 2',
//   setOcrData,
// }) {
//   const dispatch = useDispatch()
//   const fileRef1 = useRef(null)
//   const fileRef2 = useRef(null)

//   const initialUser = form.getFieldValue('user') || {}
//   const [preview1, setPreview1] = useState(initialUser[fieldKey1] || null)
//   const [preview2, setPreview2] = useState(initialUser[fieldKey2] || null)

//   const handleFile = async (e, key, setPreview) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     if (!file.type.startsWith('image/')) return

//     // Small validation example (optional)
//     const maxMB = 3
//     if (file.size > maxMB * 1024 * 1024) {
//       // show a notification or just return
//       console.warn(`File too large - max ${maxMB}MB`)
//       return
//     }

//     const reader = new FileReader()
//     reader.onload = () => {
//       const base64 = reader.result
//       const user = form.getFieldValue('user') || {}
//       // store preview under the key (base64)
//       user[key] = base64
//       form.setFieldsValue({ user })
//       setPreview(base64)

//       // --- Alternative: store actual File object instead (commented)
//       // user[`${key}File`] = file;
//       // form.setFieldsValue({ user });
//     }
//     reader.readAsDataURL(file)

//     const newFormData = new FormData()
//     newFormData.append('image', file)
//     newFormData.append('side', key)

//     try {
//       await dispatch(set({ loading: true }))
//       const response = await axios.post('http://192.168.151.77:8888/ocr', newFormData)
//       console.log('ocr response: ', response)

//       if (response.status === 200) {
//         setOcrData(response.data)
//       }
//     } catch (error) {
//       console.log('ocr api res: ', error)
//     } finally {
//       await dispatch(set({ loading: false }))
//     }
//   }

//   const tinyBtnStyle = {
//     padding: 0,
//     minWidth: 28,
//     height: 28,
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   }

//   return (
//     <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
//       <span>{label}</span>

//       {/* hidden file inputs */}
//       <input
//         ref={fileRef1}
//         type="file"
//         accept="image/*"
//         style={{ display: 'none' }}
//         onChange={(e) => handleFile(e, fieldKey1, setPreview1)}
//       />
//       <input
//         ref={fileRef2}
//         type="file"
//         accept="image/*"
//         style={{ display: 'none' }}
//         onChange={(e) => handleFile(e, fieldKey2, setPreview2)}
//       />

//       {/* uploader 1 */}
//       <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
//         <Tooltip title={`Upload ${name1}`}>
//           <Button
//             type="text"
//             size="small"
//             style={tinyBtnStyle}
//             icon={<UploadOutlined />}
//             onClick={() => fileRef1.current && fileRef1.current.click()}
//             aria-label={`Upload ${name1}`}
//           />
//         </Tooltip>

//         {/* tiny preview */}
//         {preview1 ? (
//           <img
//             src={preview1}
//             alt={name1}
//             style={{
//               width: 28,
//               height: 28,
//               objectFit: 'cover',
//               borderRadius: 4,
//               border: '1px solid #e8e8e8',
//             }}
//           />
//         ) : (
//           <div style={{ width: 28, height: 28 }} />
//         )}

//         {/* caption / name */}
//         <Text
//           style={{ fontSize: 10, lineHeight: '12px', textAlign: 'center', maxWidth: 72 }}
//           ellipsis
//         >
//           {name1}
//         </Text>
//       </div>

//       {/* uploader 2 */}
//       <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
//         <Tooltip title={`Upload ${name2}`}>
//           <Button
//             type="text"
//             size="small"
//             style={tinyBtnStyle}
//             icon={<UploadOutlined />}
//             onClick={() => fileRef2.current && fileRef2.current.click()}
//             aria-label={`Upload ${name2}`}
//           />
//         </Tooltip>

//         {preview2 ? (
//           <img
//             src={preview2}
//             alt={name2}
//             style={{
//               width: 28,
//               height: 28,
//               objectFit: 'cover',
//               borderRadius: 4,
//               border: '1px solid #e8e8e8',
//             }}
//           />
//         ) : (
//           <div style={{ width: 28, height: 28 }} />
//         )}

//         <Text
//           style={{ fontSize: 10, lineHeight: '12px', textAlign: 'center', maxWidth: 72 }}
//           ellipsis
//         >
//           {name2}
//         </Text>
//       </div>
//     </div>
//   )
// }

// export default LabelWithPhotoButtons

export default function LabelWithPhotoButtons({
  label,
  form,
  uploads = [], // [{ fieldKey: 'front', name: 'Aadhar Front' }, ...]
  setOcrData,
}) {
  const dispatch = useDispatch()
  const fileRefs = useRef({}) // store refs dynamically
  const [previews, setPreviews] = useState(() => {
    const initialUser = form.getFieldValue('user') || {}
    return uploads.reduce((acc, { fieldKey }) => {
      acc[fieldKey] = initialUser[fieldKey] || null
      return acc
    }, {})
  })

  const handleFile = async (e, key) => {
    // console.log('key: ', key)
    // return
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return

    if (file.size > 3 * 1024 * 1024) {
      console.warn('File too large - max 3MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      const user = form.getFieldValue('user') || {}
      user[key] = base64
      form.setFieldsValue({ user })
      setPreviews((prev) => ({ ...prev, [key]: base64 }))
    }
    reader.readAsDataURL(file)

    const newFormData = new FormData()

    if (key === 'aadhaarFront') {
      newFormData.append('aadhaar_front', file)
    }

    if (key === 'aadharBack') {
      newFormData.append('aadhaar_back', file)
    }

    if (key === 'pan') {
      newFormData.append('pan', file)
    }

    // for (const [key, value] of newFormData.entries()) {
    //   console.log('key: ', key, ' value: ', value)
    // }

    try {
      dispatch(set({ loading: true }))
      const response = await axios.post('http://103.29.220.152:8778/ocr/combined', newFormData)
      // console.log('ocr api res: ', response)
      if (response.status === 200) {
        setOcrData(response.data)
      }
    } catch (error) {
      console.error('OCR API error:', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const tinyBtnStyle = {
    padding: 0,
    minWidth: 28,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
      <span>{label}</span>

      {uploads.map(({ fieldKey, name }) => (
        <div key={fieldKey} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {/* Hidden file input */}
          <input
            ref={(el) => (fileRefs.current[fieldKey] = el)}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e, fieldKey)}
          />

          {/* Upload button */}
          <Tooltip title={`Upload ${name}`}>
            <Button
              type="text"
              size="small"
              style={tinyBtnStyle}
              icon={<UploadOutlined />}
              onClick={() => fileRefs.current[fieldKey]?.click()}
              aria-label={`Upload ${name}`}
            />
          </Tooltip>

          {/* Preview */}
          {previews[fieldKey] ? (
            <img
              src={previews[fieldKey]}
              alt={name}
              style={{
                width: 28,
                height: 28,
                objectFit: 'cover',
                borderRadius: 4,
                border: '1px solid #e8e8e8',
              }}
            />
          ) : (
            <div style={{ width: 28, height: 28 }} />
          )}

          {/* Label */}
          <Text
            style={{ fontSize: 10, lineHeight: '12px', textAlign: 'center', maxWidth: 72 }}
            ellipsis
          >
            {name}
          </Text>
        </div>
      ))}
    </div>
  )
}
