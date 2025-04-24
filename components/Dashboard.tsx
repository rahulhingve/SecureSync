'use client'
// import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateEncryptionKeys } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Import components when they're created
const Sidebar = dynamic(() => import('./chat/Sidebar'), { ssr: false })
const ChatWindow = dynamic(() => import('./chat/ChatWindow'), { ssr: false })

// Chat models
export type Chat = {
  id: number
  name: string | null
  type: 'DIRECT' | 'GROUP'
  createdAt: string
  updatedAt: string
  isEncrypted: boolean
  messages: Message[]
  participants: ChatParticipant[]
}

export type ChatParticipant = {
  id: number
  userId: number
  chatId: number
  joinedAt: string
  isAdmin: boolean
  lastRead: string | null
  notificationsEnabled: boolean
  user: UserInfo
}

export type UserInfo = {
  id: number
  name: string
  email: string
  avatar: string | null
  status: 'ONLINE' | 'OFFLINE' | 'AWAY'
  lastSeen: string | null
  username?: string
  bio?: string
  publicKey?: string
}

export type Message = {
  id: number
  content: string
  encryptedContent: string | null
  sender: {
    id: number
    name: string
    email: string
    avatar: string | null
  }
  senderId: number
  recipientId: number | null
  chatId: number
  createdAt: string
  updatedAt: string
  isRead: boolean
  isDeleted: boolean
  isEncrypted: boolean
  replyTo: Message | null
  replyToId: number | null
}

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [userChats, setUserChats] = useState<Chat[]>([])
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize user encryption keys on first load
  useEffect(() => {
    const initializeKeys = async () => {
      try {
        // Check if keys already exist in storage
        const storedPublicKey = localStorage.getItem('publicKey')
        
        if (!storedPublicKey) {
          // Generate new encryption keys
          const keys = await generateEncryptionKeys()
          
          // Store keys in local storage (private key should be in secure storage in production)
          localStorage.setItem('publicKey', keys.publicKey)
          localStorage.setItem('privateKey', keys.privateKey)
          
          // Update user profile with public key
          await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKey: keys.publicKey }),
          })
        }
      } catch (error) {
        console.error('Failed to initialize encryption keys:', error)
      }
    }
    
    initializeKeys()
  }, [])

  // Fetch user data and chats
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user profile
        const profileRes = await fetch('/api/user/profile')
        if (!profileRes.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const profileData = await profileRes.json()
        setUserProfile(profileData.user)
        
        // Fetch user chats
        const chatsRes = await fetch('/api/chats')
        if (!chatsRes.ok) {
          throw new Error('Failed to fetch chats')
        }
        const chatsData = await chatsRes.json()
        setUserChats(chatsData.chats.map((chatParticipant: { chat: Chat }) => chatParticipant.chat))
      } catch (error) {
        console.error('Error fetching data:', error)
        // If unauthorized, redirect to login
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  // Set user status to OFFLINE when leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OFFLINE' }),
        })
      } catch (error) {
        console.error('Error updating status on unload:', error)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar 
        chats={userChats} 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat}
        userProfile={userProfile}
        refreshChats={() => {
          fetch('/api/chats')
            .then(res => res.json())
            .then(data => setUserChats(data.chats.map((cp: { chat: Chat }) => cp.chat)))
            .catch(err => console.error('Error refreshing chats:', err))
        }}
      />
      
      <ChatWindow 
        chat={selectedChat} 
        currentUser={userProfile}
        onBack={() => setSelectedChat(null)}
      />
    </div>
  )
}

export default Dashboard