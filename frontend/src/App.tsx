import React from 'react'
// import 'antd/dist/antd.css'
import './index.less'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MedCheck from './pages/MedCheck'

export default function () {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<MedCheck />}></Route>
        </Routes>
      </Router>
    </div>
  )
}
