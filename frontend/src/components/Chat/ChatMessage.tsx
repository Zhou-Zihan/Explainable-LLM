'use client'
import React, { useEffect, useRef, useState, FC, memo } from 'react'
import { observer } from 'mobx-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatBot, Account } from '@/assets'

interface ChatMessageProps {
  message: Message
}

const ChatMessage: FC<ChatMessageProps> = (props) => {
  console.log(props.message)
  const message = props.message
  return (
    <div className={message.role == 'user' ? 'message-container-reverse' : 'message-container'}>
      {message.role == 'user' ? (
        <img src={Account} className="chat-icon" />
      ) : (
        <img src={ChatBot} className="chat-icon" />
      )}
      <div className="message-content">
        <ReactMarkdown
          className="message-text"
          components={{
            ol({ node, className, children, ...props }) {
              return <ol className="ol-list">{children}</ol>
            },
            ul({ node, className, children, ...props }) {
              return <ul className="ul-list">{children}</ul>
            }
          }}
          remarkPlugins={[remarkGfm]}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
ChatMessage.displayName = 'ChatMessage'

export default observer(ChatMessage)
