import React, { FC, useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '@/store/'
import Card from '@/components/Card'
import * as d3 from 'd3'
import './index.less'

import { Glyph } from '@/assets'
import { fetchNodeInfo } from '@/api'

const testReasoningTuples = [
  {
    Symptom: ['Fever', 'Dry Cough', 'Shortness of Breath'],
    Diagnosis: 'Respiratory Infection'
  },
  {
    Symptom: ['Fever', 'Dry Cough', 'Shortness of Breath'],
    Diagnosis: 'Respiratory Infection',
    Complication: 'Gastrointestinal Symptoms'
  },
  {
    Symptom: ['Fever', 'Dry Cough', 'Shortness of Breath'],
    Diagnosis: 'Respiratory Infection',
    Treatment: 'Levofloxacin and ticarcillin'
  }
]

const middlePosition = 360
const nodeWidth = 220
const nodeHeight = 40
const xMap = {
  Symptom: 20,
  Diagnosis: 290,
  Complication: 560,
  Treatment: 560
}

const roundRectPath = (x_init, y, width, height, r, type) => {
  const x = x_init + xMap[type]
  return `M ${x + r} ${y}
          L ${x + width - r} ${y}
          Q ${x + width} ${y} ${x + width} ${y + r}
          L ${x + width} ${y + height - r}
          Q ${x + width} ${y + height} ${x + width - r} ${y + height}
          L ${x + r} ${y + height}
          Q ${x} ${y + height} ${x} ${y + height - r}
          L ${x} ${y + r}
          Q ${x} ${y} ${x + r} ${y}`
}

const generateYTransform = (n, index) => {
  const spacing = 100

  if (n % 2 === 0) {
    return spacing * (index - n / 2 + 0.5)
  } else {
    return spacing * (index - Math.floor(n / 2))
  }
}

const generateLinkPath = (sourceCoors, targetCoors) => {
  return `M ${sourceCoors.x + nodeWidth / 2} ${sourceCoors.y}
          Q ${sourceCoors.x + nodeWidth / 2 + (targetCoors.x - nodeWidth - sourceCoors.x) / 4} ${sourceCoors.y} ${(sourceCoors.x + targetCoors.x) / 2} ${(sourceCoors.y + targetCoors.y) / 2}
          M ${(sourceCoors.x + targetCoors.x) / 2} ${(sourceCoors.y + targetCoors.y) / 2}
          Q ${targetCoors.x - nodeWidth / 2 - (targetCoors.x - nodeWidth - sourceCoors.x) / 4} ${targetCoors.y} ${targetCoors.x - nodeWidth / 2} ${targetCoors.y}`
}

const rectFillColor = (type: string) => {
  const colorMap = {
    Symptom: '#F7C97E',
    Diagnosis: '#CFAFD4',
    Complication: '#74AED4',
    Treatment: '#D3E3B7'
  }
  return colorMap[type]
}

const MiddleZone: FC = () => {
  const svgContainer = useRef(null)
  const { curReasoningTuples, curNodeIDList, setCurNodeIDList, curTopNodeIID, setCurTopNodeIID } =
    useStore()

  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [nodeCoors, setNodeCoors] = useState<any[]>([])

  const handleClickedNode = (selected_node: Node) => {
    console.log('clicked node:', selected_node)
    setCurTopNodeIID(selected_node.id)
    // move the clicked node to the top
    const remainingNodeIDs = curNodeIDList.filter((id) => id !== selected_node.id)
    remainingNodeIDs.unshift(selected_node.id)
    setCurNodeIDList(remainingNodeIDs)

    fetchNodeInfo({ type: selected_node.type, content: selected_node.content }).then((res) => {
      // TODO: api call to get the node infomation
      // 收到数据后给加上id, type, content, definitions,
      console.log('node info:', res.data)
    })
  }

  const draw = () => {
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

    // draw nodes
    svg.selectAll('.nodes').remove()
    const nodes_group = svg.append('g').attr('class', 'nodes')
    const nodes_type_count = [[], [], []]

    nodes.forEach((node, idx) => {
      nodes_group
        .append('path')
        .attr(
          'd',
          roundRectPath(0, middlePosition - nodeHeight / 2, nodeWidth, nodeHeight, 10, node.type)
        )
        .attr('fill', rectFillColor(node.type))
        .attr('fill-opacity', 0.8)
        .attr('stroke', rectFillColor(node.type))
        .attr('stroke-width', 2)
        .attr('id', `node-rect-${node.id}`)
        .on('click', () => handleClickedNode(node))

      nodes_group
        .append('text')
        .attr('x', xMap[node.type] + nodeWidth / 2)
        .attr('y', middlePosition)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-family', 'Inria Sans')
        .text(node.content)
        .attr('id', `node-text-${node.id}`)
        .on('click', () => handleClickedNode(node))

      if (node.type === 'Symptom') {
        nodes_type_count[0].push(node)
      } else if (node.type === 'Diagnosis') {
        nodes_type_count[1].push(node)
      } else {
        nodes_type_count[2].push(node)
      }
    })

    // node y-transfer
    nodes_type_count.forEach((nodes, idx) => {
      nodes.forEach((node, idx) => {
        const y = generateYTransform(nodes.length, idx)
        d3.selectAll(`#node-rect-${node.id}`).attr('transform', `translate(0, ${y})`)
        d3.selectAll(`#node-text-${node.id}`).attr('transform', `translate(0, ${y})`)
        nodeCoors.push({ id: node.id, x: xMap[node.type] + nodeWidth / 2, y: middlePosition + y })
      })
    })

    //draw links
    svg.selectAll('.links').remove()
    const links_group = svg.append('g').attr('class', 'links')

    links.forEach((link) => {
      const sourceCoors = nodeCoors.find((node) => node.id === link.sourceID)
      const targetCoors = nodeCoors.find((node) => node.id === link.targetID)

      links_group
        .append('path')
        .attr('d', generateLinkPath(sourceCoors, targetCoors))
        .attr('fill', 'none')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)
        // .attr('marker-end', 'url(#arrowhead)')
        .attr('id', `link-path-${link.sourceID}-${link.targetID}`)

      links_group
        .append('circle')
        .attr('cx', sourceCoors.x + nodeWidth / 2)
        .attr('cy', sourceCoors.y)
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)

      links_group
        .append('circle')
        .attr('cx', targetCoors.x - nodeWidth / 2)
        .attr('cy', targetCoors.y)
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)
    })
  }

  // node&link detect
  // TODO: Change testReasoningTuples to curReasoningTuples after api is ready
  useEffect(() => {
    let id = 0
    const contentSet = new Set()
    const node_list = testReasoningTuples.reduce(
      (acc, obj) => {
        Object.entries(obj).forEach(([type, contents]) => {
          if (Array.isArray(contents)) {
            contents.forEach((content) => {
              const entry = { type, content }
              const key = JSON.stringify(entry)
              if (!contentSet.has(key)) {
                contentSet.add(key)
                acc.push({ id, type, content })
                id++
              }
            })
          } else {
            const entry = { type, content: contents }
            const key = JSON.stringify(entry)
            if (!contentSet.has(key)) {
              contentSet.add(key)
              acc.push({ id, type, content: contents })
              id++
            }
          }
        })
        return acc
      },
      [] as Array<{ id: number; type: string; content: string }>
    )
    setNodes(node_list as Node[])
    setCurNodeIDList(node_list.map((node) => node.id))
    setCurTopNodeIID(node_list[0].id)

    const link_list = []
    testReasoningTuples.forEach(
      (obj) => {
        const keys = Object.keys(obj)

        for (let i = 0; i < keys.length - 1; i++) {
          const source = obj[keys[i]]
          const target = obj[keys[i + 1]]

          if (Array.isArray(source)) {
            if (Array.isArray(target)) {
              source.forEach((s) => {
                target.forEach((t) => {
                  link_list.push({
                    sourceID: node_list.find((node) => node.type === keys[i] && node.content === s)
                      .id,
                    targetID: node_list.find(
                      (node) => node.type === keys[i + 1] && node.content === t
                    ).id
                  })
                })
              })
            } else {
              const targetid = node_list.find(
                (node) => node.type === keys[i + 1] && node.content === target
              ).id
              source.forEach((s) => {
                link_list.push({
                  sourceID: node_list.find((node) => node.type === keys[i] && node.content === s)
                    .id,
                  targetID: targetid
                })
              })
            }
          } else {
            const sourceid = node_list.find(
              (node) => node.type === keys[i] && node.content === source
            ).id
            if (Array.isArray(target)) {
              target.forEach((t) => {
                link_list.push({
                  sourceID: sourceid,
                  targetID: node_list.find(
                    (node) => node.type === keys[i + 1] && node.content === t
                  ).id
                })
              })
            } else {
              link_list.push({
                sourceID: sourceid,
                targetID: node_list.find(
                  (node) => node.type === keys[i + 1] && node.content === target
                ).id
              })
            }
          }
        }
      },
      [] as Array<{ source: number; target: number }>
    )
    const unique_link_list = Array.from(new Set(link_list.map((link) => JSON.stringify(link)))).map(
      (link) => JSON.parse(link as string)
    )
    console.log('node list:', node_list, 'link list:', unique_link_list)
    setLinks(unique_link_list)
  }, [testReasoningTuples])

  useEffect(() => {
    draw()
  }, [nodes, links])

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
