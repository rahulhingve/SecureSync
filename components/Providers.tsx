'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from "next-auth/react"
import { SocketProvider } from '@/contexts/SocketContext'

interface ProvidersProps {
  children: React.ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default Providers 