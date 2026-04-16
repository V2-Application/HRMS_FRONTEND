import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
* Export JSON data to Excel with validation

* @param {Array} columns - [{ header: "Name", key: "value" }]
* @param {Array} data - array of objects
* @param {String} fileName - example: "users.xlsx" {".xlsx" will be appended if missing}
* @param {Object} options - { sheetName: "Sheet1" }
* @returns {{ success: boolean, message: string }}
*/

export const exportExcelFromFrontend = (
  columns = [],
  data = [],
  fileName = 'data.xlsx',
  options = { sheetName: 'Sheet1' },
) => {
  try {
    if (!Array.isArray(columns) || columns.length === 0) {
      return { success: false, message: 'No columns provided.' }
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: 'No data found to export' }
    }

    // validate column objects and keep only valid ones
    const validColumns = columns.filter(
      (c) =>
        typeof c === 'object' &&
        typeof c?.header === 'string' &&
        c?.header?.trim() !== '' &&
        typeof c?.key === 'string' &&
        c?.key?.trim() !== '',
    )

    if (validColumns.length === 0) {
      return { success: false, message: 'Columns format is invalid' }
    }

    // ensure filename ends with .xlsx
    if (typeof fileName !== 'string' || fileName.trim() === '') {
      fileName = 'data.xlsx'
    } else if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName = `${fileName}.xlsx`
    }

    // format data according to validColumns (preserve column order)
    const formattedData = data.map((row) => {
      const obj = {}
      validColumns.forEach((col) => {
        // convert undefined -> empty string so sheets look clean
        const val = row === null ? '' : row[col?.key]
        obj[col?.header] = val === undefined || val === null ? '' : val
      })

      return obj
    })

    // if all rows are empty for the chosen, abort
    const allEmpty = formattedData.every((r) =>
      Object.values(r).every((v) => v === '' || v === null || v === undefined),
    )

    if (allEmpty) {
      return {
        success: false,
        message: 'No data matches the provided columns (all selected fields are empty)',
      }
    }

    // create worksheet with explicit header order
    const headerOrder = validColumns.map((c) => c?.header)
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headerOrder })

    // build workbook and append
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, options?.sheetName || 'Sheet1')

    // Write and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, fileName)

    return { success: true, message: `${fileName} downloaded.` }
  } catch (error) {
    return { success: false, message: `Export failed: ${err?.message || err}` }
  }
}
