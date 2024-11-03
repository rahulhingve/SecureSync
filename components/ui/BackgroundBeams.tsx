'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'

export const BackgroundBeams = ({
  className,
  colors = ['#ff0000', '#00ff00', '#0000ff'],
  speed = 1,
}: {
  className?: string
  colors?: string[]
  speed?: number
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !containerRef.current) return

    const resizeCanvas = () => {
      if (canvas && containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const beams: Beam[] = []
    for (let i = 0; i < 5; i++) {
      beams.push(new Beam(canvas, colors, speed))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      beams.forEach((beam) => beam.update(ctx))
      requestAnimationFrame(animate)
    }

    animate()
    controls.start({ opacity: 1 })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [colors, speed, controls])

  return (
    <motion.div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden', className)}
      initial={{ opacity: 0 }}
      animate={controls}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  )
}

class Beam {
  x: number
  y: number
  width: number
  height: number
  speed: number
  color: string

  constructor(canvas: HTMLCanvasElement, colors: string[], speed: number) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.width = Math.random() * 10 + 5
    this.height = canvas.height
    this.speed = (Math.random() + 0.5) * speed
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update(ctx: CanvasRenderingContext2D) {
    this.x += this.speed

    if (this.x > ctx.canvas.width) {
      this.x = -this.width
    }

    ctx.fillStyle = this.color
    ctx.globalAlpha = 0.1
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}