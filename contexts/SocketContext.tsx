'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'

// Define a simplified Socket interface
interface Socket {
  emit: (event: string, data: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback: (data: any) => void) => void
}

// Create a mock socket for demonstration
const mockSocket: Socket = {
  emit: (event, data) => {
    console.log(`[MOCK] Emitting ${event} with data:`, data)
  },
  on: (event, callback) => {
    console.log(`[MOCK] Registered listener for ${event}`)
  },
  off: (event, callback) => {
    console.log(`[MOCK] Removed listener for ${event}`)
  }
}

// Create context with default values
const SocketContext = createContext<{
  socket: Socket | null
  isConnected: boolean
}>({
  socket: null,
  isConnected: false
})

export const useSocket = () => useContext(SocketContext)

// Provider component
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected] = useState(true)
  
  return (
    <SocketContext.Provider value={{ socket: mockSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
} 