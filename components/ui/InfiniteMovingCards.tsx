'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
}: {
  items: {
    quote: string
    name: string
    title: string
    avatar: string
  }[]
  direction?: 'left' | 'right'
  speed?: 'slow' | 'normal' | 'fast'
  pauseOnHover?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  const speedMap = {
    slow: 50,
    normal: 100,
    fast: 150,
  }

  return (
    <div ref={containerRef} className="overflow-hidden">
      <motion.div
        className="flex"
        animate={{
          x: direction === 'left' ? [-containerWidth, 0] : [0, -containerWidth],
        }}
        transition={{
          duration: (containerWidth / speedMap[speed]) * items.length,
          repeat: Infinity,
          ease: 'linear',
        }}
        {...(pauseOnHover && { whileHover: { animationPlayState: 'paused' } })}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[300px] p-4 bg-gray-800 rounded-lg shadow-lg m-2"
          >
            <div className="flex items-center mb-4">
              <img
                src={item.avatar}
                alt={item.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.title}</p>
              </div>
            </div>
            <p className="text-sm">&quot;{item.quote}&quot;</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}