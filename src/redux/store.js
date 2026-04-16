import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import uiReducer from './uiSlice';
import dataReducer from './dataSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    dropdown:dataReducer,
  },
});

export default store;
