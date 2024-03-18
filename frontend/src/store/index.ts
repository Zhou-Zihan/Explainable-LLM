import React from 'react'
import store from './store'
// 导出store
export const storeContext = React.createContext(store)
export const useStore = () => React.useContext(storeContext)
