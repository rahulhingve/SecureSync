'use client'

import { motion } from 'framer-motion'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleLogin = (provider: string) => {
    setLoading(provider)
    signIn(provider)
    setTimeout(() => {
      console.log(`Logged in with ${provider}`)
      setLoading(null)
      

    }, 2000)
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            backgroundImage: [
              'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
              'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
              'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 p-8 rounded-2xl shadow-lg backdrop-blur-md z-10"
      >
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Login</h1>
        <div className="space-y-4">
          <LoginButton
            provider="Google"
            icon={<FaGoogle />}
            onClick={() => handleLogin('google')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            loading={loading === 'google'}
          />
          <LoginButton
            provider="GitHub"
            icon={<FaGithub />}
            onClick={() => handleLogin('github')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            loading={loading === 'github'}
          />
        </div>
      </motion.div>
    </div>
  )
}

interface LoginButtonProps {
  provider: string
  icon: React.ReactNode
  onClick: () => void
  className: string
  loading: boolean
}

function LoginButton({ provider, icon, onClick, className, loading }: LoginButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full py-3 px-6 rounded-full text-white font-semibold text-lg flex items-center justify-center space-x-2 transition duration-300 md:px-32 ${className}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <motion.div
          className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <>
          {icon}
          <span>Login with {provider}</span>
        </>
      )}
    </motion.button>
  )
}

