// import { createSlice } from '@reduxjs/toolkit'

// const uiSlice = createSlice({
//   name: 'ui',
//   initialState: {
//     unfoldable: false,
//     sidebarShow: true,
//     theme: 'light',
//     loading: false,
//   },
//   reducers: {
//     set: (state, action) => {
//       return { ...state, ...action.payload }
//     },
//   },
// })

// export const { set } = uiSlice.actions
// export default uiSlice.reducer


import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    unfoldable: false,
    sidebarShow: true,
    theme: 'light', // always light
    loading: false,
  },
  reducers: {
    set: (state, action) => {
      const payload = action.payload || {}
      const { theme, ...rest } = payload

      // merge other keys normally
      Object.assign(state, rest)

      // if anyone tries to change theme, force it to 'light'
      if (theme !== undefined) {
        state.theme = 'light'
      }
    },
  },
})

export const { set } = uiSlice.actions
export default uiSlice.reducer
