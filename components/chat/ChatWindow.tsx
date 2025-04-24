'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { useSocket } from '@/contexts/SocketContext'
import { useTheme } from 'next-themes'
import { EncryptionService } from '@/services/EncryptionService'
import Message from './Message'
import ChatHeader from './ChatHeader'
import { Chat, Message as MessageType, UserInfo } from '../Dashboard'

interface ChatWindowProps {
  chat: Chat | null
  currentUser: UserInfo | null
  onBack: () => void
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser, onBack }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket()
  const [encryptionService, setEncryptionService] = useState<EncryptionService | null>(null)
  const [typingUsers, setTypingUsers] = useState<{ [key: number]: boolean }>({})
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize encryption service
  useEffect(() => {
    if (chat?.isEncrypted) {
      setEncryptionService(new EncryptionService())
    } else {
      setEncryptionService(null)
    }
  }, [chat])

  // Load messages when chat changes
  useEffect(() => {
    if (chat) {
      setIsLoading(true)
      
      // For demo purposes, use the chat's existing messages if available
      if (chat.messages && chat.messages.length > 0) {
        setMessages(chat.messages)
        setIsLoading(false)
      } else {
        // Otherwise, try to fetch messages from API
        const fetchMessages = async () => {
          try {
            const res = await fetch(`/api/chats/${chat.id}/messages`)
            if (!res.ok) throw new Error('Failed to fetch messages')
            
            const data = await res.json()
            setMessages(data.messages || [])
          } catch (error) {
            console.error('Error fetching messages:', error)
          } finally {
            setIsLoading(false)
          }
        }
        
        fetchMessages()
      }
    } else {
      setMessages([])
    }
  }, [chat])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  // Handle sending a message
  const sendMessage = async () => {
    if (!message.trim() || !chat || !currentUser) return
    
    try {
      // Clear the input
      setMessage('')
      
      // Encrypt message if chat is encrypted
      let messageContent = message
      if (chat.isEncrypted && encryptionService) {
        messageContent = await encryptionService.encrypt(message)
      }
      
      // Create a temporary message for the UI
      const tempMessage: MessageType = {
        id: Date.now(), // Temporary ID
        content: message,
        encryptedContent: chat.isEncrypted ? messageContent : null,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar
        },
        senderId: currentUser.id,
        recipientId: null,
        chatId: chat.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRead: false,
        isDeleted: false,
        isEncrypted: chat.isEncrypted,
        replyTo: null,
        replyToId: null
      }
      
      // Update UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage])
      
      // Send message to server
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: messageContent,
            chatId: chat.id,
            isEncrypted: chat.isEncrypted
          }),
        })
        
        if (!res.ok) throw new Error('Failed to send message')
        
        // If we have a socket, emit the message
        if (socket) {
          socket.emit('sendMessage', {
            chatId: chat.id,
            senderId: currentUser.id
          })
        }
      } catch (error) {
        console.error('Error sending message:', error)
        // Could add error handling here to inform the user
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    // Send typing indicator if socket exists
    if (socket && chat) {
      socket.emit('typingStart', {
        chatId: chat.id,
        userId: currentUser?.id
      })
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Get chat display name
  const getChatName = (): string => {
    if (!chat) return ''
    
    if (chat.type === 'GROUP') {
      return chat.name || 'Group Chat'
    } else {
      const otherParticipant = chat.participants.find(p => p.userId !== currentUser?.id)
      return otherParticipant?.user.name || 'Chat'
    }
  }

  // Render empty state if no chat
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Select a chat to start messaging
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Choose a conversation from the sidebar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <ChatHeader
        chatName={getChatName()}
        isGroup={chat.type === 'GROUP'}
        participants={chat.participants}
        onClose={onBack}
      />
      
      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map(msg => (
            <Message
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === currentUser?.id}
              sender={msg.sender}
            />
          ))
        )}
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden bg-white dark:bg-gray-800">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-transparent outline-none dark:text-white"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          
          <div className="flex items-center px-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              type="button"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className={`p-2 rounded-full ${
                message.trim()
                  ? 'text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
              type="button"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow 