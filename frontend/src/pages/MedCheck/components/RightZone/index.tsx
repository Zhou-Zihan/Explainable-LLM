import React, { FC, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import * as d3 from 'd3'
import { useStore } from '@/store/'
import Card from '@/components/Card'
import './index.less'

const RightZone: FC = () => {
  return (
    <div className="right-zone">
      <Card title="Reference View" className="chart-view-card">
        <div className="chart-view"></div>
      </Card>
    </div>
  )
}

export default observer(RightZone)
