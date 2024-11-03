'use client'

import React, { useRef, useEffect } from 'react'
import { useMotionValue, useSpring, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

export const Vortex = ({
  className,
  colors,
  density = 1,
  speed = 1,
}: {
  className?: string
  colors?: string[]
  density?: number
  speed?: number
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef)
  const particles: Particle[] = []
  const defaultColors = ['#ff0000', '#00ff00', '#0000ff']

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const resizeCanvas = () => {
      if (canvas && containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particleCount = Math.floor(200 * density)
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas, colors || defaultColors, speed))
    }

    const animate = () => {
      if (!isInView) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => particle.update(ctx))
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isInView, colors, density, speed])

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)}>
      <canvas ref={canvasRef} />
    </div>
  )
}

class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string

  constructor(canvas: HTMLCanvasElement, colors: string[], speed: number) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 3 + 1
    this.speedX = (Math.random() - 0.5) * speed
    this.speedY = (Math.random() - 0.5) * speed
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update(ctx: CanvasRenderingContext2D) {
    this.x += this.speedX
    this.y += this.speedY

    if (this.x > ctx.canvas.width) this.x = 0
    else if (this.x < 0) this.x = ctx.canvas.width

    if (this.y > ctx.canvas.height) this.y = 0
    else if (this.y < 0) this.y = ctx.canvas.height

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}