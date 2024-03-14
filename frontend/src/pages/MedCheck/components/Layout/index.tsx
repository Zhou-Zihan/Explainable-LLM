import React, { FC } from 'react'
import { observer } from 'mobx-react'
import LeftZone from '../LeftZone'
import MiddleZone from '../MiddleZone'
import RightZone from '../RightZone'
import './index.less'
import { headerSVG } from '@/assets'

const Layout: FC = () => {
  return (
    <div className="layout">
      <header className="header">
        <img src={headerSVG} className="card-title-icon" alt="" />
        <span className="header-title">LOAD CASES</span>
      </header>
      <div className="main">
        <LeftZone />
        <MiddleZone />
        <RightZone />
      </div>
    </div>
  )
}

export default observer(Layout)
