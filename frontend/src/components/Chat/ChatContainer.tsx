'use client'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import { useStore } from '@/store/'
import './index.less'

const ChatContainer: FC = () => {
  const { frontendMessages } = useStore()
  console.log("frontendMessages",frontendMessages)
  // // Scroll to the bottom of the chat
  // const messagesEndRef = useRef<HTMLDivElement>(null)

  // const scrollDown = () => {
  //   if (!messagesEndRef.current) return
  //   messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  // }

  // useEffect(() => {
  //   scrollDown()
  // }, [frontendMessages])

  const testFrontendMessage = [
    {
      id: 0,
      parentId: -1,
      content: 'skajhdaskhdaksjdhkadhka',
      role: 'assistent'
    },
    {
      id: 1,
      parentId: 0,
      content: 'skajhdaskhdaksjdhkadhka',
      role: 'user'
    }
  ]

  return (
    <div className="chat-view">
      <div className="chat-messages">
        {/* {testFrontendMessage &&
          testFrontendMessage.length > 0 &&
          testFrontendMessage.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))} */}
        {/* TODO: change after api is ready */}
        {frontendMessages &&
          frontendMessages.length > 0 &&
          frontendMessages.map((message, index) => (
            <ChatMessage key={index} message={message as Message} />
          ))}
        {/* <div className="h-[160px]" ref={messagesEndRef} /> */}
      </div>
      <ChatInput />
    </div>
  )
}

export default observer(ChatContainer)
