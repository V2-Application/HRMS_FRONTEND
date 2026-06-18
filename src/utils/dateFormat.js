// Central date/time display formatting for V2 Parivar.
// Standard DISPLAY formats (everywhere except the Attendance module):
//   - Date     : DD-MMM-YY            e.g. 17-Jun-26
//   - Time     : hh:mm A (Indian 12h) e.g. 05:30 PM
//   - DateTime : DD-MMM-YY, hh:mm A   e.g. 17-Jun-26, 05:30 PM
//
// IMPORTANT: use these ONLY for values shown to the user. For values SENT to the
// backend (API params/payloads) or used as keys/sorting, keep the ISO format via
// `toApiDate` / the original `YYYY-MM-DD` strings — do NOT swap those to display format.
import dayjs from 'dayjs'

export const DATE_FMT = 'DD-MMM-YY'
export const TIME_FMT = 'hh:mm A'
export const DATETIME_FMT = 'DD-MMM-YY, hh:mm A'

const toDayjs = (value) => {
  if (value === null || value === undefined || value === '') return null
  const d = dayjs(value)
  return d.isValid() ? d : null
}

/** Display a date as DD-MMM-YY (e.g. 17-Jun-26). Returns '' for empty/invalid. */
export const fmtDate = (value) => {
  const d = toDayjs(value)
  return d ? d.format(DATE_FMT) : ''
}

/** Display a date+time as DD-MMM-YY, hh:mm A (Indian 12-hour). */
export const fmtDateTime = (value) => {
  const d = toDayjs(value)
  return d ? d.format(DATETIME_FMT) : ''
}

/** Display a time as hh:mm A (Indian 12-hour). */
export const fmtTime = (value) => {
  const d = toDayjs(value)
  return d ? d.format(TIME_FMT) : ''
}

/** Backend/API date string (YYYY-MM-DD). Use for request params, NOT for display. */
export const toApiDate = (value) => {
  const d = toDayjs(value)
  return d ? d.format('YYYY-MM-DD') : ''
}
