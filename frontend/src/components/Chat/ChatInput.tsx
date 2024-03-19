'use client'
import { useEffect, FC, useState } from 'react'
import { observer } from 'mobx-react'
// import { uploadFile } from '../utils/api'
// import { useDispatch, useSelector } from 'react-redux'
// import { HomeState } from '../utils/store'
// import toast from 'react-hot-toast'
import React from 'react'
import { Dropdown, message } from 'antd'
import './index.less'
import { Unfold } from '@/assets'
import { useStore } from '@/store/'
import { fetchChat } from '@/api'

const ChatInput: FC = () => {
  const [sendMessage, setSendMessage] = useState('')
  const [segments, setSegments] = useState<SegmentData[]>([])
  const [items, setItems] = useState<{ label: string; key: string }[]>([])

  const {
    curQuestionData,
    messageIsStreaming,
    setMessageIsStreaming,
    frontendMessages,
    setFrontendMessages
  } = useStore()

  // TODO: Change into Cascading menu, following 'medical history / physical examination'
  useEffect(() => {
    if (curQuestionData) {
      setSegments(curQuestionData.segment)
      const result = curQuestionData.segment.map((segmentData, index) => {
        return {
          // label: segmentData.classification + ' | ' + segmentData.description,
          label: segmentData.description,
          key: index.toString()
        }
      })
      setItems(result)
    }
  }, [curQuestionData])

  // const [humanMessageId, setHumanMessageId] = useState(-1)
  // const [aiMessageId, setAiMessageId] = useState(-1)

  const handleSend = async () => {
    if (messageIsStreaming) {
      message.error('Only one message at a time.')
      return
    }
    if (!sendMessage || sendMessage.trim() === '') {
      message.error('Please enter a prompt.')
      return
    }

    setSendMessage('')
    setMessageIsStreaming(true)

    let curFrontendMessages = [...frontendMessages]
    const parentId =
      frontendMessages.length > 0 ? frontendMessages[frontendMessages.length - 1].id : -1
    curFrontendMessages.push({
      id: -1,
      parentId: parentId, // last message id
      content: sendMessage,
      role: 'user'
    })
    setFrontendMessages(curFrontendMessages)

    try {
      fetchChat({ content: sendMessage }).then((res) => {
        console.log('fetchChat', res)
        const data = res.data
        const newFrontendMessages = [...curFrontendMessages]
        newFrontendMessages[newFrontendMessages.length - 1] = {
          ...newFrontendMessages[newFrontendMessages.length - 1],
          // TODO: wait to see is id useful
          // id: data.human_message_id
          id: newFrontendMessages.length - 1
        }
        newFrontendMessages.push({
          // id: data.ai_message_id,
          // parentId: data.human_message_id,
          id: newFrontendMessages.length,
          parentId: newFrontendMessages.length - 1,
          content: data.plain_text,
          role: 'assistant'
        })
        curFrontendMessages = [...newFrontendMessages]
        setFrontendMessages(newFrontendMessages)
        // TODO: use data.reasoning_tuples to update the state
      })
    } catch (err) {
      message.error('Oops! Something went wrong.')
    }

    setMessageIsStreaming(false)
  }

  const onClick = ({ key }) => {
    message.info(`Click on item ${key}`)
    console.log(segments[parseInt(key)].description)
    setSendMessage(segments[parseInt(key)].description)
  }

  return (
    <div className="chat-input-view">
      <textarea
        className="chat-input-tetxtarea"
        placeholder=" Describe the symptoms ->"
        onChange={(e) => setSendMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        value={sendMessage}
        required
      ></textarea>
      <Dropdown
        className=""
        menu={{
          items,
          onClick
        }}
        trigger={['click']}
        placement="topRight"
      >
        <img src={Unfold} className="unfold-icon" alt="" />
      </Dropdown>
      <button className="chat-input-send-button" onClick={handleSend} disabled={messageIsStreaming}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          aria-hidden="true"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M10 14l11 -11"></path>
          <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
        </svg>
      </button>
    </div>
  )
}

export default observer(ChatInput)
