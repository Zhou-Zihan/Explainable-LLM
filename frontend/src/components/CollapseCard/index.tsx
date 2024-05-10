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
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Definitions:</p>
        <p> {refInfo.definitions}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">clinically_associated_with:</p>
        <p> {refInfo.relationship?.clinically_associated_with?.join(" ; ")}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Relationship View:</p>
        <p> edge means {refInfo.content} is clinically associated with B(Diagnosis
        Type).</p>
      </div>
    </div>
  )
}

const CollapseCotent_Diagnosis: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Definitions:</p>
        <p> {refInfo.definitions}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">may_be_treated_by:</p>
        <p> {refInfo.relationship?.may_be_treated_by?.join(" ; ")}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Relationship View:</p>
        <p> edge means A(Symptom Type) is clinically associated with{' '}
        {refInfo.content}, or {refInfo.content} may be treated by B(Drug Type).</p>
      </div>
    </div>
  )
}

const CollapseCotent_Complication: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Definitions:</p>
        <p> {refInfo.definitions}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Relationship View:</p>
      </div>
    </div>
  )
}

const CollapseCotent_Treatment: FC<{ refInfo: RefInfo }> = ({ refInfo }) => {
  return (
    <div className="refInfo" key={refInfo.id}>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Definitions:</p>
        <p> {refInfo.definitions}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Indication:</p>
        <p> {refInfo.Indication}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">⚠️ 🍴 Notice:</p>
        <p> {refInfo.Food_Interaction}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Related Products:</p>
        <p> {refInfo.Related_Product}</p>
      </div>
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Adverse Effects:</p>
        <p> {refInfo.Adverse_Effects}</p>
      </div>
      {/* <p>Contradictions: {refInfo.contradictions}</p> */}
      <div className="CollapseCotent_description">
        <p className="CollapseCotent_title">Relationship View:</p>
        <p> edge means A(Diagnosis Type) may be treated by {refInfo.content}.</p>
      </div>

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
