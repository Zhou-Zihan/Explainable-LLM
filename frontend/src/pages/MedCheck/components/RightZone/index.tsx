import React, { FC, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import * as d3 from 'd3'
import { useStore } from '@/store/'
import Card from '@/components/Card'
import './index.less'
import { Collapse } from 'antd'
import CollapseCotent from '@/components/CollapseCard'
import DrawSvgContainer from '@/components/DrawSvgContainer'

const { Panel } = Collapse

// const testRedInfoList = [
//   {
//     id: 0,
//     type: 'Symptom',
//     content: 'Fever',
//     definitions:
//       'A fever is a temporary increase in your body temperature, often due to an illness. Having a fever is a sign that something out of the ordinary is going on in your body.',
//     relationship: {
//       clinically_associated_with: ['Fever', 'Respiratory Infection']
//     }
//   },
//   {
//     id: 1,
//     type: 'Symptom',
//     content: 'Dry Cough',
//     definitions: 'A dry cough is a cough where no phlegm or mucus is produced.',
//     relationship: {
//       clinically_associated_with: ['Fever', 'Respiratory Infection']
//     }
//   },
//   {
//     id: 2,
//     type: 'Symptom',
//     content: 'Shortness of Breath',
//     definitions: 'Shortness of breath is a feeling of not being able to get enough air.',
//     relationship: {
//       clinically_associated_with: ['Fever', 'Respiratory Infection']
//     }
//   },
//   {
//     id: 3,
//     type: 'Diagnosis',
//     content: 'Respiratory Infection',
//     definitions:
//       'Respiratory infection is an infection that affects the nose, throat, and airways.',
//     relationship: {
//       may_be_treated_by: ['Levofloxcin', 'Azithromycin']
//     }
//   },
//   {
//     id: 4,
//     type: 'Complication',
//     content: 'Gastrointestinal Symptoms',
//     definitions: 'Gastrointestinal symptoms are common in COVID-19 patients.'
//   },
//   {
//     id: 5,
//     type: 'Treatment',
//     content: 'Levofloxcin and Azithromycin',
//     definitions:
//       'Levofloxcin and Azithromycin are antibiotics used to treat respiratory infections.',
//     Indication:
//       'For the treatment of Human immunovirus (HIV) infections in conjunction with other antivirals.',
//     Related_Product: 'Cophylac Drops(Normethadone + Oxilofrine)',
//     Adverse_Effects: '....',
//     Food_Interaction: '...',
//     Drug_Interaction: [
//       { drug_inter: 'increase activity', drug_name: 'XXX', detail_info: '...' },
//       { drug_inter: 'decrease activity', drug_name: 'XXX', detail_info: '...' },
//       { drug_inter: 'increasing risk of combined use', drug_name: 'XXX', detail_info: '...' }
//     ]
//   }
// ]

const RightZone: FC = () => {
  const { curNodeIDList, curRefInfoList } = useStore()

  return (
    <div className="right-zone">
      <Card title="Reference View">
        <div className="card-container">
          <Collapse expandIconPosition="end" ghost={true}>
            {curRefInfoList &&
              curRefInfoList.length > 0 &&
              curRefInfoList.map((refInfo, index) => {
            {/* {testRedInfoList &&
              testRedInfoList.length > 0 &&
              curNodeIDList.map((id) => {
                const refInfo = testRedInfoList.find((ref) => ref.id === id) */}
                return (
                  <Panel header={refInfo.type + ': ' + refInfo.content} key={refInfo.id}>
                    <CollapseCotent refInfo={refInfo} />
                    <DrawSvgContainer refInfo={refInfo}/>
                  </Panel>
                )
              })}
          </Collapse>
        </div>
      </Card>
    </div>
  )
}

export default observer(RightZone)
