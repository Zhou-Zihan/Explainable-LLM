import React, { FC, useRef, useEffect,useState } from 'react';
import { observer } from 'mobx-react';
import * as d3 from 'd3';
import './index.less';
import { useStore } from '@/store/'
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

interface RefInfo {
  id: number
  type: string
  content: string
  definitions: string
  relationship?: { [key: string]: string[] }
  Indication?: string
  Drug_Interaction?: DrugInteraction[]
  Related_Product?: string
  Adverse_Effects?: string
  Food_Interaction?: string
}//api之后再改，先用假数据

const middlePosition = 120//?
const nodeWidth = 200
const nodeHeight = 40
const xLeft=10
const xRight=320


const generateYTransform = (n, index) => {
  const spacing = 50

  if (n % 2 === 0) {
    return spacing * (index - n / 2 + 0.5)
  } else {
    return spacing * (index - Math.floor(n / 2))
  }
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
const generateLinkPath = (sourceCoors, targetCoors) => {
  return `M ${sourceCoors.x + nodeWidth / 2} ${sourceCoors.y}
          Q ${sourceCoors.x + nodeWidth / 2 + (targetCoors.x - nodeWidth - sourceCoors.x) / 4} ${sourceCoors.y} ${(sourceCoors.x + targetCoors.x) / 2} ${(sourceCoors.y + targetCoors.y) / 2}
          M ${(sourceCoors.x + targetCoors.x) / 2} ${(sourceCoors.y + targetCoors.y) / 2}
          Q ${targetCoors.x - nodeWidth / 2 - (targetCoors.x - nodeWidth - sourceCoors.x) / 4} ${targetCoors.y} ${targetCoors.x - nodeWidth / 2} ${targetCoors.y}`
}
const roundRectPath = (x_init, y, width, height, r, type, mainType) => {
  const x = x_init + generateX(type , mainType)
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
const generateX =(type,mainType)=>{
  let x
  if(type==mainType){
    x = xLeft
  }else{
    x = xRight
  }
  return x
}


const DrawSvgContainer: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  console.log('refInfo', refInfo)

  const mysvgContainer = useRef(null);
  const [mynodes, setNodes] = useState<Node[]>([])
  const [mylinks, setLinks] = useState<any[]>([])
  const [nodeCoors, setNodeCoors] = useState<any[]>([])
  const [nodesnew, setNodesnew] = useState<Node[]>([])
  const [translateY, settranslateY] = useState<any[]>([])

  const mainType=refInfo.type
  const mainContent=refInfo.content
  const mainId=refInfo.id

  const mydraw = () => {
    const svg = d3
      .select(mysvgContainer.current)
      .attr('viewBox', [0, 0, 540, 240])//高会变
      .style('display', 'block')

    // draw node
    svg.selectAll('.mynodes').remove()
    const mynodes_group = svg.append('g').attr('class', 'mynodes')


    nodesnew.forEach((node, idx) => {
      mynodes_group
        .append('path')
        .attr(
          'd',
          roundRectPath(0, middlePosition - nodeHeight / 2, nodeWidth, nodeHeight, 10, node.type,mainType)
        )
        .attr('fill', rectFillColor(node.type))
        .attr('fill-opacity', 0.8)
        .attr('stroke', rectFillColor(node.type))
        .attr('stroke-width', 2)
        .attr('id', `mynode-rect-${node.id}`)

      mynodes_group
        .append('text')
        .attr('x', generateX(node.type,mainType) + nodeWidth / 2)//需要更改
        .attr('y', middlePosition)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-family', 'Inria Sans')
        .text(node.content)
        .attr('id', `mynode-text-${node.id}`)

      let y
      translateY.forEach((position,idx)=>{
        if(node.id==position.id)
        y=position.yposition
      })
      if(y){
        d3.selectAll(`#mynode-rect-${node.id}`).attr('transform', `translate(0, ${y})`)
        d3.selectAll(`#mynode-text-${node.id}`).attr('transform', `translate(0, ${y})`)
      }

      nodeCoors.push({ id: node.id, x: generateX(node.type,mainType) + nodeWidth / 2, y: middlePosition + y })
    })


    //draw links
    svg.selectAll('.mylinks').remove()
    const mylinks_group = svg.append('g').attr('class', 'mylinks')
    const markerright = svg.append("defs")
        .append("marker")
        .attr("id", "arrowright")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 9)
        .attr("refY", 3)
        .attr("orient", "auto");
    markerright.append("path")
    .attr("d", "M0,0 L0,6 L9,3 z")
    .style("fill", "#113366");

    const markerleft = svg.append("defs")
        .append("marker")
        .attr("id", "arrowleft")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 9)
        .attr("refY", 3)
        .attr("orient", "auto-start-reverse");
    markerleft.append("path")
    .attr("d", "M0,0 L9,3 L0,6 z")
    .style("fill", "#113366");


    mylinks.forEach((link) => {
      const sourceCoors = nodeCoors.find((node) => node.id === link.sourceID)
      const targetCoors = nodeCoors.find((node) => node.id === link.targetID)

      if(sourceCoors&&sourceCoors.id==mainId){
        mylinks_group
        .append('circle')
        .attr('cx', sourceCoors.x + nodeWidth / 2)
        .attr('cy', sourceCoors.y)
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)

        // mylinks_group//箭头
        // .append('circle')
        // .attr('cx', targetCoors.x - nodeWidth / 2)
        // .attr('cy', targetCoors.y)
        // .attr('r', 3)
        // .attr('fill', 'white')
        // .attr('stroke', '#113366')
        // .attr('stroke-width', 2)



        mylinks_group
        .append('path')
        .attr('d', generateLinkPath(sourceCoors, targetCoors))
        .attr('fill', 'none')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowright)')
        .attr('id', `link-path-${link.sourceID}-${link.targetID}`)

      }else if(targetCoors&&targetCoors.id==mainId){
        mylinks_group
        .append('circle')
        .attr('cx', sourceCoors.x - nodeWidth / 2)
        .attr('cy', sourceCoors.y)
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)

        // mylinks_group//箭头
        // .append('circle')
        // .attr('cx', targetCoors.x + nodeWidth / 2)
        // .attr('cy', targetCoors.y)
        // .attr('r', 3)
        // .attr('fill', 'white')
        // .attr('stroke', '#113366')
        // .attr('stroke-width', 2)

        mylinks_group
        .append('path')
        .attr('d', generateLinkPath(targetCoors, sourceCoors))
        .attr('fill', 'none')
        .attr('stroke', '#113366')
        .attr('stroke-width', 2)
        .attr('marker-start', 'url(#arrowleft)')
        .attr('id', `link-path-${link.sourceID}-${link.targetID}`)
      }
    })


  }

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
    mynodes.forEach((node, idx) => {
      if (node.id==mainId){
        nodesnew.push(node)
      }else{
        mylinks.forEach((link)=>{
          if(link.sourceID==mainId&&link.targetID==node.id){
            nodesnew.push(node)
          }else if(link.targetID==mainId&&link.sourceID==node.id){
            nodesnew.push(node)
          }
        })
      }
    })

    const mynodes_type_count = [[], []]
    nodesnew.forEach((node, idx) => {
      if (node.type === mainType) {
        mynodes_type_count[0].push(node)
      }else{
        mynodes_type_count[1].push(node)
      }
    })
    mynodes_type_count.forEach((nodes, idx) => {
      nodes.forEach((node, idx) => {
      const tempy = generateYTransform(nodes.length, idx)
      addNodePosition(node.id,tempy)
      })
      // console.log("translateY:",translateY)
    })
    // mydraw()
  }, [mynodes, mylinks])

  const addNodePosition = (nodeId: number, tempy: number) => {
    settranslateY(prevState => [
      ...prevState,
      { id: nodeId, yposition: tempy }
    ]);
  };

  useEffect(() => {
    mydraw()
  },[translateY])

  console.log("translateY:",translateY)
  return (
    <div className="relationship-view">
      <svg className="relationship-view-svg" ref={mysvgContainer} />
    </div>
  )
};


export default observer(DrawSvgContainer);
