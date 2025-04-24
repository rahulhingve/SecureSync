'use client'

import React from 'react'
import { format } from 'date-fns'

interface User {
  id: number
  name: string
  email: string
  avatar: string | null
}

interface MessageProps {
  message: {
    id: number
    content: string
    senderId: number
    chatId: number
    createdAt: string
    updatedAt: string
  }
  isOwnMessage: boolean
  sender?: User
}

const Message: React.FC<MessageProps> = ({ message, isOwnMessage, sender }) => {
  // Format timestamp
  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a')
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${
        isOwnMessage 
          ? 'bg-blue-500 text-white rounded-lg rounded-tr-none' 
          : 'bg-white dark:bg-gray-800 dark:text-white rounded-lg rounded-tl-none'
        } px-4 py-2 shadow-sm`}
      >
        {/* Display sender name for messages not from current user */}
        {!isOwnMessage && sender && (
          <div className="text-xs font-medium mb-1 text-blue-700 dark:text-blue-300">
            {sender.name}
          </div>
        )}
        
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        {/* Timestamp */}
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Message 