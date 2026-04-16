// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Login_api, Logout_api } from '../services/Services'

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await Login_api(userData)
      return data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Login failed')
    }
  },
)

// Logout thunk
// export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
//   try {
//     const data = await Logout_api()
//     return data
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || error.message)
//   }
// })

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    // Simulating a successful response instead of making the actual API call
    const mockResponse = { message: 'Logout successful' }
    return mockResponse
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    filteredSideMenu: [],
    data: JSON.parse(localStorage.getItem('data')) || null,
    permissions: JSON.parse(localStorage.getItem('permissions')) || [],
    status: 'idle',
    error: null,
    selectedAttendanceEmpCode: null,
  },
  reducers: {
    setSelectedAttendanceEmpCode: (state, action) => {
      state.selectedAttendanceEmpCode = action.payload
    },
    setFilteredSideMenu: (state, action) => {
      state.filteredSideMenu = action.payload
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload
      localStorage.setItem('permissions', JSON.stringify(action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload.data
        // Store permissions if they exist in the response
        if (action.payload.data?.permissions) {
          state.permissions = action.payload.data.permissions
          localStorage.setItem('permissions', JSON.stringify(action.payload.data.permissions))
        }
        localStorage.setItem('data', JSON.stringify(action.payload.data))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.data = null
        state.token = null
        state.status = 'idle'
        state.error = null
        state.selectedAttendanceEmpCode = null
        state.filteredSideMenu = []
        state.permissions = []
        localStorage.removeItem('data')
        localStorage.removeItem('token')
        localStorage.removeItem('permissions')
        sessionStorage.removeItem('candidate-search')
        sessionStorage.removeItem('employee-search')
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { setSelectedAttendanceEmpCode, setFilteredSideMenu, setPermissions } = authSlice.actions
export default authSlice.reducer
