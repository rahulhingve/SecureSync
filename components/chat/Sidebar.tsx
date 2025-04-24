'use client'

import React, { useState } from 'react'
import { Chat, UserInfo } from '../Dashboard'
import { formatLastSeen, isUserOnline } from '@/lib/utils'
import { Search, Plus, UserCircle, LogOut, Settings, Moon, Sun, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import { signOut } from 'next-auth/react'

// Dynamic imports
const NewChatModal = dynamic(() => import('./NewChatModal'), { ssr: false })
const ProfileModal = dynamic(() => import('./ProfileModal'), { ssr: false })

interface SidebarProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
  userProfile: UserInfo | null
  refreshChats: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  userProfile,
  refreshChats
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  // Filter chats based on search term
  const filteredChats = searchTerm 
    ? chats.filter(chat => {
        // For direct chats, search by participant name
        if (chat.type === 'DIRECT') {
          const otherParticipant = chat.participants.find(p => p.userId !== userProfile?.id)
          return otherParticipant?.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        }
        // For group chats, search by chat name
        return chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    : chats

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    setDarkMode(!darkMode)
  }

  // Get chat display name
  const getChatName = (chat: Chat): string => {
    if (chat.type === 'DIRECT') {
      const otherParticipant = chat.participants.find(p => p.userId !== userProfile?.id)
      return otherParticipant?.user.name || 'Unknown User'
    }
    return chat.name || 'Unnamed Group'
  }

  // Get chat avatar
  const getChatAvatar = (chat: Chat): string | null => {
    if (chat.type === 'DIRECT') {
      const otherParticipant = chat.participants.find(p => p.userId !== userProfile?.id)
      return otherParticipant?.user.avatar || null
    }
    return null
  }

  // Get online status for direct chats
  const getChatStatus = (chat: Chat): string => {
    if (chat.type === 'DIRECT') {
      const otherParticipant = chat.participants.find(p => p.userId !== userProfile?.id)
      if (otherParticipant) {
        if (isUserOnline(otherParticipant.user.lastSeen ? new Date(otherParticipant.user.lastSeen) : undefined)) {
          return 'Online'
        }
        return `Last seen ${formatLastSeen(otherParticipant.user.lastSeen ? new Date(otherParticipant.user.lastSeen) : undefined)}`
      }
    }
    return ''
  }

  // Get last message for preview
  const getLastMessage = (chat: Chat): string => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[0]
      if (lastMessage.isDeleted) return 'This message was deleted'
      return lastMessage.content.length > 30 ? lastMessage.content.substring(0, 30) + '...' : lastMessage.content
    }
    return 'No messages yet'
  }

  // Handle logout
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: Partial<UserInfo>) => {
    setShowProfileModal(false)
  }

  return (
    <>
      <div className="w-80 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="font-bold text-lg dark:text-white">SecureSync</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Encrypted Messaging</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full p-2 pl-10 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {/* New Chat Button */}
        <button
          onClick={() => setShowNewChatModal(true)}
          className="mx-4 my-3 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
        
        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No chats found. Start a new conversation!
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                  selectedChat?.id === chat.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center gap-3">
                  {/* Chat Avatar */}
                  <div className="relative">
                    {getChatAvatar(chat) ? (
                      <div
                        className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center"
                        style={{
                          backgroundImage: getChatAvatar(chat) ? `url(${getChatAvatar(chat)})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {!getChatAvatar(chat) && (
                          <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            {getChatName(chat).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                        ${chat.type === 'GROUP' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        {chat.type === 'GROUP' ? (
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                        ) : (
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                            {getChatName(chat).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Online Status Indicator */}
                    {chat.type === 'DIRECT' && isUserOnline(
                      chat.participants.find(p => p.userId !== userProfile?.id)?.user.lastSeen 
                        ? new Date(chat.participants.find(p => p.userId !== userProfile?.id)?.user.lastSeen as string) 
                        : undefined
                    ) && (
                      <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate dark:text-white">{getChatName(chat)}</h3>
                      {chat.messages && chat.messages.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(chat.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{getLastMessage(chat)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{getChatStatus(chat)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal 
          onClose={() => setShowNewChatModal(false)} 
          currentUserId={userProfile?.id} 
          onChatCreated={() => {
            refreshChats()
            setShowNewChatModal(false)
          }}
        />
      )}
      
      {/* Profile Modal */}
      {showProfileModal && userProfile && (
        <ProfileModal 
          user={userProfile} 
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  )
}

export default Sidebar 