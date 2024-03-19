import React, { FC } from 'react'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import './index.less'

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
}

const CollapseCotent_Symptom: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <p>Definitions: {refInfo.definitions}</p>
      <p>
        Relationship View: edge means {refInfo.content} is clinically associated with B(Diagnosis
        Type).
      </p>
    </div>
  )
}

const CollapseCotent_Diagnosis: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <p>Definitions: {refInfo.definitions}</p>
      <p>
        Relationship View: edge means A(Symptom Type) is clinically associated with{' '}
        {refInfo.content}, or {refInfo.content} may be treated by B(Drug Type).
      </p>
    </div>
  )
}

const CollapseCotent_Complication: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <p>Definitions: {refInfo.definitions}</p>
      <p>Relationship View:</p>
    </div>
  )
}

const CollapseCotent_Treatment: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <p>Definitions: {refInfo.definitions}</p>
      <p>Indication: {refInfo.Indication}</p>
      <p>⚠️ 🍴 Notice: {refInfo.Food_Interaction}</p>

      <p>Related Products: {refInfo.Related_Product}</p>
      <p>Adverse Effects: {refInfo.Adverse_Effects}</p>
      {/* <p>Contradictions: {refInfo.contradictions}</p> */}

      <p>Relationship View: edge means A(Diagnosis Type) may be treated by {refInfo.content}.</p>
    </div>
  )
}

const CollapseCotent: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  console.log('refInfo', refInfo)
  switch (refInfo.type) {
    case 'Symptom':
      return <CollapseCotent_Symptom refInfo={refInfo} />
    case 'Diagnosis':
      return <CollapseCotent_Diagnosis refInfo={refInfo} />
    case 'Complication':
      return <CollapseCotent_Complication refInfo={refInfo} />
    case 'Treatment':
      return <CollapseCotent_Treatment refInfo={refInfo} />
    default:
      return <p>ERROR</p>
  }
}

export default observer(CollapseCotent)
