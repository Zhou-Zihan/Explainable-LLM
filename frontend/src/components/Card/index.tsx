import React, { FC, ReactNode } from 'react'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import './index.less'
import { menu } from '@/assets'

interface Props {
  title: string
  className?: string
  children: ReactNode
  extra?: ReactNode
}

const Card: FC<Props> = (props) => {
  return (
    <div className={classnames('card', props.className)}>
      <div className="card-title">
        <img src={menu} className="card-title-icon" alt="" />
        <span>{props.title}</span>
        {props.extra ? <span className="card-extra">{props.extra}</span> : null}
      </div>
      <div className="card-content">{props.children}</div>
    </div>
  )
}

export default observer(Card)
