import { message } from 'antd'
import { month_num_to_name, presets } from './constants'

export const showFirstValidationError = (error) => {
  const errors = error?.errorFields || []
  if (Array.isArray(errors) && errors.length > 0) {
    message.error(errors[0]?.errors?.[0] || 'Some required field is empty')
    return true
  }
  message.error('Please fix validation errors')
  return true
}

export const validateFieldsOrShow = async (form, fieldNames = []) => {
  try {
    if (!fieldNames?.length) return true // nothing to validate
    await form.validateFields(fieldNames)
    return true
  } catch (error) {
    showFirstValidationError(error)
    return false
  }
}

export const normalizeString = (value) => {
  if (typeof value === 'number' && value === 0) return 0
  if (typeof value !== 'string') return value
  if (value === null || value === undefined || value.trim() === '') return ''
  return value.trim()
}

export const normalizeStringToUpper = (value) => {
  const trimmedValue = normalizeString(value)
  return String(trimmedValue).toUpperCase()
}

export const normalizeStringWithLower = (val) => {
  return String(val).trim().toLowerCase()
}

export const filterBySearch = (search = '', data = []) => {
  const value = normalizeStringWithLower(search)

  if (!value) return data

  return data.filter((item) =>
    Object.values(item).some((val) => normalizeStringWithLower(val).includes(value)),
  )
}

export const getRandomColorForTag = () => presets[Math.floor(Math.random() * presets.length)]

export const getApiError = (error, consoleMsg) => {
  console.error(`${consoleMsg}`, error)

  const responseData = error?.response?.data
  const errors = responseData?.errors
  let errMsg = responseData?.message || responseData?.title || consoleMsg

  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0]
    const firstErrorArray = errors[firstKey]

    if (Array.isArray(firstErrorArray) && firstErrorArray.length > 0) {
      errMsg = firstErrorArray[0]
    }
  }

  return errMsg
}

export const downloadAttachment = (row) => {
  const url = normalizeFileUrl(row?.challanPdfPath)
  if (!url) {
    message.warning('No attachment found for this row')
    return
  }
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.download = row?.attachmentName || 'PF_Attachment'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const formatDateInDDMMMYYYY = (value = '') => {
  if (value === null || value === undefined) return '-'

  const trimmedDate = String(value || '').trim()

  if (trimmedDate.length === 0) return '-'

  const dateWithout_T = trimmedDate.split('T')[0]
  const [year, month, date] = dateWithout_T.split('-')
  const month_name = month_num_to_name[month]

  const formattedDate = `${date}-${month_name}-${year}`

  return formattedDate
}
