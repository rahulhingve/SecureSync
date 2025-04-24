'use client'

import React, { useEffect, useState } from 'react'
import { Search, X, Users, UserPlus, AlertCircle } from 'lucide-react'
import { Chat } from '../Dashboard'

interface User {
  id: number
  name: string
  email: string
  avatar: string | null
}

interface NewChatModalProps {
  onClose: () => void
  currentUserId: number | undefined
  onChatCreated: () => void
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, currentUserId, onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isGroupChat, setIsGroupChat] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/users')
        if (!res.ok) throw new Error('Failed to fetch users')
        
        const data = await res.json()
        const otherUsers = data.users.filter((user: User) => user.id !== currentUserId)
        
        setUsers(otherUsers)
        setFilteredUsers(otherUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [currentUserId])

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users)
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      setFilteredUsers(
        users.filter(
          user =>
            user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.email.toLowerCase().includes(lowerCaseSearchTerm)
        )
      )
    }
  }, [searchTerm, users])

  // Toggle user selection
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    } else {
      if (!isGroupChat && selectedUsers.length === 1) {
        // For direct chat, only allow selecting one user
        setSelectedUsers([user])
      } else {
        setSelectedUsers([...selectedUsers, user])
      }
    }
  }

  // Create a new chat
  const createChat = async () => {
    if (selectedUsers.length === 0) return
    
    // Reset error state
    setError(null)
    setCreatingChat(true)
    
    try {
      const chatData = {
        type: isGroupChat ? 'GROUP' : 'DIRECT',
        name: isGroupChat ? groupName : null,
        isEncrypted: true,
        participantIds: selectedUsers.map(user => user.id),
      }
      
      console.log('Creating chat with data:', JSON.stringify(chatData))
      
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        console.error('Server error response:', data)
        throw new Error(data.error || data.details || 'Failed to create chat')
      }
      
      console.log('Chat created successfully:', data)
      onChatCreated()
      onClose()
    } catch (error) {
      console.error('Error creating chat:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setCreatingChat(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-medium dark:text-white">
            {isGroupChat ? 'New Group' : 'New Chat'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
            <div className="flex items-center text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Group options (for group chat) */}
        {isGroupChat && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}
        
        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isGroupChat ? 'Group Participants' : 'Chat With'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="ml-2 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search box */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 pl-10 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {/* Toggle between direct and group chat */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
            Create group chat
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isGroupChat}
              onChange={() => {
                setIsGroupChat(!isGroupChat)
                if (!isGroupChat && selectedUsers.length > 1) {
                  // Keep all selected users when switching to group chat
                } else if (isGroupChat && selectedUsers.length > 1) {
                  // Keep only the first user when switching to direct chat
                  setSelectedUsers([selectedUsers[0]])
                }
              }}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {/* User list */}
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No users found
            </div>
          ) : (
            filteredUsers
              .filter(user => !selectedUsers.some(u => u.id === user.id))
              .map(user => (
                <div
                  key={user.id}
                  className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center"
                  onClick={() => toggleUserSelection(user)}
                >
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    {user.avatar ? (
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{
                          backgroundImage: `url(${user.avatar})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                        aria-label={`${user.name}'s avatar`}
                      />
                    ) : (
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="font-medium dark:text-white">{user.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  
                  {/* Add User Icon */}
                  <UserPlus className="w-5 h-5 text-gray-400" />
                </div>
              ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={createChat}
            disabled={
              selectedUsers.length === 0 ||
              (isGroupChat && !groupName.trim()) ||
              creatingChat
            }
            className={`px-4 py-2 rounded-md flex items-center ${
              selectedUsers.length === 0 || (isGroupChat && !groupName.trim()) || creatingChat
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {creatingChat ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : isGroupChat ? (
              <Users className="w-5 h-5 mr-2" />
            ) : (
              <UserPlus className="w-5 h-5 mr-2" />
            )}
            {creatingChat
              ? 'Creating...'
              : `Create ${isGroupChat ? 'Group' : 'Chat'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewChatModal 