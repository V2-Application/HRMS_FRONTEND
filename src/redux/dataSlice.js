import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getDropdownLocDesDep } from '../services/Services'
import { set } from 'lodash'

export const fetchDropDown = createAsyncThunk('dropdown/fetchDropDown', async (payload) => {
  const response = await getDropdownLocDesDep(payload)
  return response?.data
})

const dataSlice = createSlice({
  name: 'dropdown',
  initialState: {
    response: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearResponse: (state) => {
      state.response = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDropDown.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchDropDown.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.response = action.payload
      })
      .addCase(fetchDropDown.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { clearResponse } = dataSlice.actions
export default dataSlice.reducer
