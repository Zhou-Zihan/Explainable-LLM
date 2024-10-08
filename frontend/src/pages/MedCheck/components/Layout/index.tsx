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
  const { curDataset, setCurDataset, curQuestionID, setCurQuestionID, setCurQuestionData } =
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

  // TODO: Delete after api is ready
  // const testData = [
  //   {
  //     key: 0,
  //     question_stem:
  //       "A 30-year-old woman comes to the office because of a 3-day history of joint pain in her hands and a rash over her chest and arms that is slowly resolving. The joint pain in her hands has persisted and is exacerbated by writing or typing. She rates the pain as a 3 on a 10-point scale. The patient is a preschool teacher and reports that one of her students had a facial rash and fever 1 week prior to the development of her symptoms. The patient's medical history is unremarkable and her only medication is an oral contraceptive. She is in a monogamous relationship with her husband. She does not smoke cigarettes, drink alcoholic beverages, or use illicit drugs. BMI is 22 kg/m² . Vital signs are temperature 38.1°C (100.5°F), pulse 94/min, respirations 18/min, and blood pressure 107/58 mm Hg. Physical examination discloses a blanching, erythematous, papular rash on the anterior chest and proximal upper extremities. The first and second metacarpophalangeal joints of both hands are tender and swollen. The wrist joints also are tender to palpation but there is minimal swelling.",
  //     question:
  //       "Which of the following microorganisms is most likely to have caused this patient's symptoms?",
  //     options: [
  //       'Adenovirus',
  //       'Borrelia burgdorferi',
  //       'Coxsackievirus',
  //       'Ehrlichia chaffeensis',
  //       'Parvovirus B19'
  //     ]
  //   },
  //   {
  //     key: 1,
  //     question_stem:
  //       'A 34-year-old woman comes to the office because of a 1-month history of worsening right upper quadrant abdominal pain and discomfort. She describes the pain as a dull ache and says it is not affected by eating or defecating. She has not had nausea or changes in appetite or bowel habits. She feels the pain constantly while she is awake, but it rarely keeps her from sleeping. Acetaminophen provides occasional relief. She has been otherwise healthy. Medical history is unremarkable and her only other medication is an oral contraceptive. Vital signs are normal. Abdominal examination discloses hepatomegaly but no palpable masses or evidence of cirrhosis. Results of liver function tests and serum α-fetoprotein concentration are within the reference ranges. Serologic studies for hepatitis B and C are negative. Ultrasonography of the abdomen shows a 4×4-cm mass in the right lobe of the liver.',
  //     question: 'Which of the following is the most likely diagnosis?',
  //     options: [
  //       'Hepatic adenoma',
  //       'Hepatocellular cancer',
  //       'Hydatid cyst',
  //       'Metastatic ovarian cancer'
  //     ]
  //   },
  //   {
  //     key: 2,
  //     question_stem:
  //       'A 12-year-old girl is brought to the emergency department by her mother because of a 1-week history of worsening swelling in her legs. The patient also noticed blood in her urine yesterday. The bleeding has not recurred. She had an upper respiratory tract infection and sore throat 1 week ago that caused her to miss several days of school. Medical history is otherwise unremarkable and she takes no routine medications. Menarche has not yet occurred. BMI is 20 kg/m². Vital signs are temperature 37.0°C (98.6°F), pulse 78/min, respirations 12/min, and blood pressure 136/84 mm Hg. Pulse oximetry on room air shows an oxygen saturation of 100%. Physical examination discloses erythema of the posterior pharynx, mild cervical lymphadenopathy, and 3+ pitting edema to both knees. Results of urinalysis are shown: Protein: 150 mg/dL Blood: Positive Leukocyte esterase: Positive Nitrite: Negative WBCs: 5−10/hpf RBCs: 10−25/hpf Casts:1−2/lpf  ',
  //     question:
  //       'Results of which of the following laboratory studies are most likely to be abnormal in this patient?',
  //     options: [
  //       'Bleeding time',
  //       'Erythrocyte count',
  //       'Serum concentration of C3',
  //       'Serum IgA concentration',
  //       'Serum rheumatoid factor assay'
  //     ]
  //   }
  // ]

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
    if (!curQuestionID) {
      fetchQustionData(curQuestionID).then((res) => {
        console.log('load question segements for ID', curQuestionID, res)
        setCurQuestionData(res.data)
      })
    }
  }

  // TODO: Delete after api is ready
  setCurQuestionData({
    id: 115,
    question:
      'Which of the following is the most appropriate intravenous pharmacotherapy at this time?',
    options: [
      'Cefuroxime alone',
      'Cefuroxime and azithromycin',
      'Levofloxacin alone',
      'Levofloxacin and ticarcillin',
      'Piperacillin-tazobactam'
    ],
    segment: [
      {
        classification: 'medical history-chief complaint',
        description:
          'I am a 32-year-old woman who came to the emergency department because of a 3-day history of worsening fever, dry cough, and shortness of breath. I also have had abdominal discomfort, diarrhea, and nausea, but I have not vomited.'
      },
      {
        classification: 'medical history-past medical history',
        description:
          'My medical history is unremarkable. I have been generally healthy and I take no medications.'
      },
      {
        classification: 'medical history-social history',
        description:
          'I do not smoke cigarettes, drink alcoholic beverages, or use illicit drugs. I am married and use no contraception. I returned home from a business trip to a midwestern city 2 days ago and have had no known contact with any ill individuals.'
      },
      {
        classification: 'physical examination-vital signs',
        description:
          'My vital signs are temperature 38.3°C (101.0°F), pulse 104/min, respirations 28/min, and blood pressure 100/60 mm Hg. Pulse oximetry on room air shows an oxygen saturation of 92%.'
      },
      {
        classification: 'physical examination-laboratory studies',
        description:
          'Results of laboratory studies show: Serum - ALT 80 U/L, AST 63 U/L, Urea nitrogen 14 mg/dL, Creatinine 1.7 mg/dL, Na⁺ 130 mEq/L, K⁺ 3.9 mEq/L, Cl⁻ 104 mEq/L, HCO3⁻ 16 mEq/L, Iron, total 18 μg/dL, Iron binding capacity, total 428 μg/dL (N=250–350), Iron saturation 5% (N=20–50), β-hCG Positive. Blood - Hematocrit 30.3%, Hemoglobin 10.2 g/dL, WBC 11,300/mm³, MCV 76 μm³, Platelet count 104,000/mm³, Red cell distribution width 16% (N=11.5–14.5).'
      }
    ]
  })

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
