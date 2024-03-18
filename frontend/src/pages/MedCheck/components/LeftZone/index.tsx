import React, { FC } from 'react'
import { observer } from 'mobx-react'
import './index.less'
import ChatContainer from '@/components/Chat/ChatContainer'

const LeftZone: FC = () => {
  return (
    <div className="left-zone">
      <ChatContainer />
    </div>
  )
}

export default observer(LeftZone)
