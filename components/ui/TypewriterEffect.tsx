'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export const TypewriterEffect = ({
  text,
  className,
  delay = 0,
  speed = 50,
}: {
  text: string
  className?: string
  delay?: number
  speed?: number
}) => {
  const [displayText, setDisplayText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    let timer: NodeJS.Timeout
    let cursorTimer: NodeJS.Timeout

    const startTyping = () => {
      let i = 0
      timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(timer)
        }
      }, speed)
    }

    const blinkCursor = () => {
      cursorTimer = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 500)
    }

    const timeoutId = setTimeout(() => {
      startTyping()
      blinkCursor()
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(timer)
      clearInterval(cursorTimer)
    }
  }, [text, delay, speed])

  return (
    <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {displayText}
      <motion.span
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      >
        |
      </motion.span>
    </motion.div>
  )
}