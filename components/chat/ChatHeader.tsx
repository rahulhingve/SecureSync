'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { ArrowLeft, Users, User, Phone, Video, MoreVertical } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  avatar: string | null
}

interface ChatHeaderProps {
  chatName: string
  isGroup: boolean
  participants: { user: User }[]
  onClose: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  chatName, 
  isGroup, 
  participants,
  onClose
}) => {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <button 
          onClick={onClose}
          className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {isGroup ? (
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            ) : (
              <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {chatName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isGroup ? `${participants.length} participants` : 'Online'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isGroup && (
          <>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader 