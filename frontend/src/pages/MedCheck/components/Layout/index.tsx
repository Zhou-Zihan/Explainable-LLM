import React, { FC, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import LeftZone from '../LeftZone'
import MiddleZone from '../MiddleZone'
import RightZone from '../RightZone'
import './index.less'
import { headerSVG } from '@/assets'
import { Modal, Card, Table, Typography } from 'antd'
import { fetchUsmleData, fetchQustionData } from '@/api'
import { useStore } from '@/store/'

const { Paragraph } = Typography

const Layout: FC = () => {
  const [visible, setVisible] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { curDataset, setCurDataset, curQuestionID, setCurQuestionID,curQuestionData ,setCurQuestionData } =
    useStore()

  const rowSelection = {
    onChange: (selectedRowKey, selectedRows) => {
      console.log(`selectedRowKey: ${selectedRowKey}`, 'selectedRows: ', selectedRows)
      setCurQuestionID(selectedRows[0].key)
    },
    getCheckboxProps: (record) => ({
      disabled: record.disabled
    })
  }

  const testColumns = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'key'
    },
    {
      title: 'Question Stem',
      dataIndex: 'question_stem',
      key: 'question_stem',
      render: (text) => <Paragraph ellipsis={{ rows: 3, expandable: true }}>{text}</Paragraph>
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question'
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      render: (options) => options.join(',')
    }
  ]

  //init dataset - usmle

  useEffect(() => {
    if (!curDataset) {
      fetchUsmleData().then((res) => {
        console.log('load usmle2022.json', res)
        setCurDataset(res.data)
      })
    }
  }, [])

  // for Modal open/close
  const handleOk = () => {
    setConfirmLoading(true)
    setTimeout(() => {
      setVisible(false)
      setConfirmLoading(false)
    }, 1000)

    // load segments for the selected question according to curQuestionID
    if (curQuestionID>=0) {
      fetchQustionData(curQuestionID).then((res) => {
        console.log('load question segements for ID', curQuestionID, res)
        setCurQuestionData(res.data)
      })
    }
  }

  // TODO: Delete after api is ready
  // setCurQuestionData({
  //   id: 115,
  //   question:
  //     'Which of the following is the most appropriate intravenous pharmacotherapy at this time?',
  //   options: [
  //     'Cefuroxime alone',
  //     'Cefuroxime and azithromycin',
  //     'Levofloxacin alone',
  //     'Levofloxacin and ticarcillin',
  //     'Piperacillin-tazobactam'
  //   ],
  //   segment: [
  //     {
  //       classification: 'medical history-chief complaint',
  //       description:
  //         'I am a 32-year-old woman who came to the emergency department because of a 3-day history of worsening fever, dry cough, and shortness of breath. I also have had abdominal discomfort, diarrhea, and nausea, but I have not vomited.'
  //     },
  //     {
  //       classification: 'medical history-past medical history',
  //       description:
  //         'My medical history is unremarkable. I have been generally healthy and I take no medications.'
  //     },
  //     {
  //       classification: 'medical history-social history',
  //       description:
  //         'I do not smoke cigarettes, drink alcoholic beverages, or use illicit drugs. I am married and use no contraception. I returned home from a business trip to a midwestern city 2 days ago and have had no known contact with any ill individuals.'
  //     },
  //     {
  //       classification: 'physical examination-vital signs',
  //       description:
  //         'My vital signs are temperature 38.3°C (101.0°F), pulse 104/min, respirations 28/min, and blood pressure 100/60 mm Hg. Pulse oximetry on room air shows an oxygen saturation of 92%.'
  //     },
  //     {
  //       classification: 'physical examination-laboratory studies',
  //       description:
  //         'Results of laboratory studies show: Serum - ALT 80 U/L, AST 63 U/L, Urea nitrogen 14 mg/dL, Creatinine 1.7 mg/dL, Na⁺ 130 mEq/L, K⁺ 3.9 mEq/L, Cl⁻ 104 mEq/L, HCO3⁻ 16 mEq/L, Iron, total 18 μg/dL, Iron binding capacity, total 428 μg/dL (N=250–350), Iron saturation 5% (N=20–50), β-hCG Positive. Blood - Hematocrit 30.3%, Hemoglobin 10.2 g/dL, WBC 11,300/mm³, MCV 76 μm³, Platelet count 104,000/mm³, Red cell distribution width 16% (N=11.5–14.5).'
  //     }
  //   ]
  // })

  const handleCancel = () => {
    setVisible(false)
  }

  return (
    <div className="layout">
      <header className="header">
        <img src={headerSVG} className="card-title-icon" alt="" />
        <span className="header-title" onClick={() => setVisible(true)}>
          LOAD CASES
        </span>
        <div className="header-line"></div>
      </header>
      <div className="main">
        <LeftZone />
        <MiddleZone />
        <RightZone />
      </div>
      {visible &&
        ReactDOM.createPortal(
          <Modal
            className="modal"
            title="Load Cases"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            width={1000}
          >
            <Card>
              <Table
                //TODO: Wait for api to return data
                dataSource={curDataset}
                // dataSource={testData}
                columns={testColumns}
                rowSelection={{
                  type: 'radio',
                  ...rowSelection
                }}
              />
            </Card>
          </Modal>,
          document.body
        )}
    </div>
  )
}

export default observer(Layout)
