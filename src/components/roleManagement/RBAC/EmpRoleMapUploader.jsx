import React, { useState } from 'react'
import { Modal, Button, Upload, Typography, message } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axiosInstance from '../../../services/axiosInstance'
import * as XLSX from 'xlsx'
import { postEmpRoleMap } from '../../../services/Services'

const { Paragraph, Text, Title } = Typography

export default function EmpRoleMapUploader({ isVisible, setIsVisible }) {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [validatedData, setValidatedData] = useState([])

  /*
   * REQUIREMENT IMPLEMENTATION: EXCEL FILE VALIDATION FUNCTION
   * This function handles all 4 below specified requirements
   * 1. Headers length must be 2.
   * 2. Headers must be "EmpCode" and "RoleName".
   * 3. No empty cells allowed.
   * 4. Create array of objects from valid data.
   */

  //   excel validation function
  const validateExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          // read excel file using XLSX library
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          // get first worksheet from the excel file
          const worksheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[worksheetName]

          // convert worksheet to JSON array (each row as array)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          // basic check: ensure file is not empty
          if (jsonData.length === 0) {
            reject('Excel file is empty')
            return false
          }

          // get headers from first row
          const headers = jsonData[0]

          // REQUIREMENT 1:  headers length must be exactly 2
          if (headers.length !== 2) {
            reject(`Invalid number of headers. Expected 2, got ${headers.length}`)
            return false
          }

          // REQUIREMENT 2: headers must be 'EmpCode' and 'RoleName'
          const expectedHeaders = ['EmpCode', 'RoleName']
          const normalizedHeaders = headers.map((h) => String(h).trim())

          // check if both expected header exist (case-insensitive)
          const hasValidHeaders = expectedHeaders.every((expectedHeader) =>
            normalizedHeaders.some(
              (header) => String(header).toLowerCase() === String(expectedHeader).toLowerCase(),
            ),
          )

          if (!hasValidHeaders) {
            reject(
              `Invalid headers. Expected: ${expectedHeaders.join(', ')}. Got: ${Array(normalizedHeaders).join(', ')}`,
            )
            return false
          }

          // get data rows (expecting header row)
          const dataRows = jsonData.slice(1)

          if (dataRows.length === 0) {
            reject('No data rows found in Excel file')
            return false
          }

          // REQUIREMENT 3: Validate each row for empty cells
          const validatedRows = []
          const errors = []

          dataRows.forEach((row, index) => {
            const rowNumber = index + 2 // +2 because Excel rows start from 1 and we skip header
            // ensure row has exactly 2 columns
            if (row.length !== 2) {
              errors.push(`Row ${rowNumber}: Expected 2 columns, got ${row.length}`)
              return false
            }

            const empCode = row[0] // first column: EmpCode
            const roleName = row[1] // second column: RoleName

            // check for empty EmpCode cell
            if (!empCode || String(empCode).trim() === '') {
              errors.push(`Row ${rowNumber}: EmpCode is empty`)
              return false
            }

            // check for empty RoleName cell
            if (!roleName || String(roleName).trim() === '') {
              errors.push(`Row ${rowNumber}: RoleName is empty`)
              return false
            }

            // REQUIREMENT 4: create object for valid row and add to array
            validatedRows.push({
              ecode: String(empCode).trim(),
              roleName: String(roleName).trim(),
            })
          })

          // if any validation errors found, reject with detailed error messages
          if (errors.length > 0) {
            reject(`Validation errors found:\n${errors.join('\n')}`)
            return false
          }

          // ensure we have at least one valid row
          if (validatedRows.length === 0) {
            reject('No valid data rows found after validation')
            return false
          }

          // REQUIREMENT 4: return array of objects [{ EmpCode: 'value', RoleName: 'value' }, ...]
          resolve(validatedRows)
        } catch (error) {
          reject(`Error reading Excel file: ${error?.message}`)
        }
      }
      reader.onerror = () => {
        reject('Error reading file')
      }

      // read file as array buffer for XLSX processing
      reader.readAsArrayBuffer(file)
    })
  }

  /*
   * File selection handler with validation.
   * Thsi runs when user selects a file, BEFORE UPLOAD
   */
  const beforeUpload = async (file) => {
    // check file type (only .xlsx allowed)
    const isXLSX =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.toLowerCase().endsWith('.xlsx')

    if (!isXLSX) {
      message.error('You can only upload .xlsx file!')
      return Upload.LIST_IGNORE // prevent file from being added to list
    }

    // clear any previous validation errors
    setUploadError('')

    try {
      // MAIN VALIDATION: run all 4 requirements checks
      const validData = await validateExcelFile(file)

      // store validated data for upload processing
      setValidatedData(validData)

      // show success message with record cound
      //   message.success(
      //     `Excel file validated successfully! Found ${validData?.length} valid records.`,
      //   )
    } catch (error) {
      // show validation errors to user
      setUploadError(error)
      message.error('Excel validation failed!')
      return Upload.LIST_IGNORE // prevent invalid file from being added
    }

    // return false to prevent auto-upload (we handle upload manually)
    return false
  }

  // handle file list changes (when files are added/removed)
  const onChange = ({ fileList: newList }) => {
    setFileList(newList.slice(-1)) // keep only the last selected file

    // clear validated data if no file selected
    if (newList?.length === 0) {
      setValidatedData([])
    }
  }

  /*
   * Handle manual upload process
   * Only runs if file passed all validations
   */
  const handleUpload = async () => {
    // check if file is selected
    if (fileList.length === 0) {
      message.warning('Please choose an .xlsx file first.')
      return false
    }

    // check if validation passed (should have valid data)
    if (validatedData.length === 0) {
      message.warning('No valid data to upload. Please check your excel file.')
      return false
    }

    setIsUploading(true)

    const requestBody = {
      employeeRoles: validatedData,
    }
    const response = await postEmpRoleMap(requestBody)
    console.log('emp role mapping api res: ', response)

    if (response?.status === 200) {
      // assume success if 2xx
      message.success(response?.data?.message || 'File uploaded successfully!')
      setFileList([]) // clear selection
      setIsVisible(false)
    } else {
      message.error(response?.response?.data?.message || 'Error in submitting data')
    }

    setIsUploading(false)
  }

  setTimeout(() => {
    setUploadError('')
  }, 5000)

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Bulk Upload
          </Title>
          <Paragraph style={{ margin: 0, fontSize: 12 }}>
            Upload Excel Sheet at once using this feature.
          </Paragraph>
        </div>
      }
      visible={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      centered
      width={700}
    >
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <a href="/EmpRoleMapUploader.xlsx" download>
            <Button icon={<DownloadOutlined />} type="primary">
              Download Sample Sheet
            </Button>
          </a>

          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
            * Download, fill out, then upload the sample Excel file.
          </Paragraph>

          {uploadError && (
            <Paragraph type="danger" style={{ color: 'red' }}>
              * {uploadError}
            </Paragraph>
          )}

          <Upload
            multiple={false}
            accept=".xlsx"
            beforeUpload={beforeUpload}
            onChange={onChange}
            fileList={fileList}
            onRemove={() => setFileList([])}
            showUploadList={{ showRemoveIcon: true }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Choose File</Button>
          </Upload>

          <div style={{ marginTop: 20 }}>
            <Button type="primary" loading={isUploading} onClick={handleUpload}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Text strong>Note:</Text>
          <Paragraph style={{ marginBottom: 4 }}>1. Only .xlsx files are supported.</Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>2. Download the sample sheet above.</Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>
            3. Fill out the downloaded sheet and then upload it here.
          </Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>
            4. Must have exactly 2 columns: EmpCode and RoleName.
          </Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>
            5. No empty cells allowed in either column.
          </Paragraph>
        </div>
      </div>
    </Modal>
  )
}
