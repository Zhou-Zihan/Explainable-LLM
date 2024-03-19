import React, { FC, useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '@/store/'
import Card from '@/components/Card'
import * as d3 from 'd3'
import './index.less'

import { Glyph } from '@/assets'

const MiddleZone: FC = () => {
  const svgContainer = useRef(null)

  useEffect(() => {
    const svg = d3
      .select(svgContainer.current)
      .attr('viewBox', [0, 0, 800, 930])
      .style('display', 'block')

    // draw glyph
    svg
      .append('image')
      .attr('xlink:href', Glyph)
      .attr('width', 230)
      .attr('height', 60)
      .attr('x', 560)
      .attr('y', 5)
  }, [])

  return (
    <div className="middle-zone">
      <Card title="Illustration View" className="chart-view-card">
        <div className="svg-view">
          <svg className="reasoning-tuples-svg" ref={svgContainer} />
        </div>
      </Card>
    </div>
  )
}

export default observer(MiddleZone)
