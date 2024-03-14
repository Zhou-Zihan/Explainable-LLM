import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '@/store/'
import DataSelection from '@/components/DataSelection'
import DataOverview from '@/components/DataOverview'
import Card from '@/components/Card'
import './index.less'

const MiddleZone: FC = () => {
  return (
    <div className="middle-zone">
      <Card title="Data Selection Panel">
        <div className="rounded-div">
          <DataSelection />
          <DataOverview />
        </div>
      </Card>
    </div>
  )
}

export default observer(MiddleZone)
