import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '@/store/'
import './index.less'

const LeftZone: FC = () => {
  return (
    <div className="left-zone">
      {/* <Card title="Data Selection Panel">
        <div className="rounded-div">
          <DataSelection />
          <DataOverview />
        </div>
      </Card> */}
    </div>
  )
}

export default observer(LeftZone)
