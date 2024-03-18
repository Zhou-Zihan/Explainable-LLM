import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '@/store/'
import Card from '@/components/Card'
import './index.less'

const MiddleZone: FC = () => {
  return (
    <div className="middle-zone">
      <Card title="Illustration View" className="chart-view-card">
        <div className="chart-view"></div>
      </Card>
    </div>
  )
}

export default observer(MiddleZone)
