import { configureStore } from '@reduxjs/toolkit'

// Import slices
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import productReducer from './slices/productSlice'
import categoryReducer from './slices/categorySlice'
import roleReducer from './slices/roleSlice'
import permissionReducer from './slices/permissionSlice'
import orderReducer from './slices/orderSlice'
import voucherReducer from './slices/voucherSlice'

// import contactReducer from './slices/contactSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    categories: categoryReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    orders: orderReducer,
    vouchers: voucherReducer

    // contacts: contactReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (for async thunks)
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
