"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"

interface LightningStrikeProps {
  duration?: number // Duración total del efecto
}

export function LightningStrike({ duration = 2000 }: LightningStrikeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const lightningColor = theme === "dark" ? "hsl(var(--secondary))" : "hsl(var(--primary))"
    const smokeColor = theme === "dark" ? "rgba(180, 70, 70, 0.05)" : "rgba(100, 100, 100, 0.05)" // Muted foreground with transparency

    // --- Lightning Bolt Class ---
    class LightningSegment {
      x1: number
      y1: number
      x2: number
      y2: number
      alpha: number
      children: LightningSegment[]
      isMain: boolean

      constructor(x1: number, y1: number, x2: number, y2: number, isMain = true) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.alpha = 1
        this.children = []
        this.isMain = isMain
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.moveTo(this.x1, this.y1)
        ctx.lineTo(this.x2, this.y2)
        ctx.strokeStyle = lightningColor
        ctx.lineWidth = this.isMain ? 3 : 1.5
        ctx.globalAlpha = this.alpha
        ctx.shadowBlur = 15 // Glow effect
        ctx.shadowColor = lightningColor
        ctx.stroke()
      }

      update() {
        this.alpha -= 0.05 // Fade out quickly
        this.children.forEach((child) => child.update())
      }
    }

    // --- Smoke Particle Class ---
    class SmokeParticle {
      x: number
      y: number
      size: number
      alpha: number
      speedX: number
      speedY: number

      constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 20 // Spread slightly
        this.y = y
        this.size = Math.random() * 10 + 5
        this.alpha = Math.random() * 0.4 + 0.2 // Start with some transparency
        this.speedX = (Math.random() - 0.5) * 1.5
        this.speedY = -(Math.random() * 1 + 0.5) // Move upwards
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.alpha -= 0.008 // Fade out
        this.size += 0.1 // Grow slightly
      }

      draw() {
        if (!ctx) return
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = smokeColor
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let lightning: LightningSegment | null = null
    let smokeParticles: SmokeParticle[] = []
    let animationId: number
    let startTime: number

    const generateLightning = () => {
      const startX = canvas.width / 2
      const startY = 0
      const endY = canvas.height * 0.8 // Strike towards bottom 80%

      const createBranch = (x1: number, y1: number, x2: number, y2: number, depth: number, isMain: boolean) => {
        const segment = new LightningSegment(x1, y1, x2, y2, isMain)
        if (depth < 3) {
          const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 30
          const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 30
          segment.children.push(createBranch(x1, y1, midX, midY, depth + 1, isMain))
          segment.children.push(createBranch(midX, midY, x2, y2, depth + 1, isMain))
        }
        if (Math.random() < 0.3 && depth < 2) {
          // Add side branches
          const branchX = x2 + (Math.random() - 0.5) * 50
          const branchY = y2 + (Math.random() - 0.5) * 50
          segment.children.push(createBranch(x2, y2, branchX, branchY, depth + 1, false))
        }
        return segment
      }

      lightning = createBranch(startX, startY, startX + (Math.random() - 0.5) * 50, endY, 0, true)
    }

    const createSmoke = (impactX: number, impactY: number) => {
      for (let i = 0; i < 50; i++) {
        smokeParticles.push(new SmokeParticle(impactX, impactY))
      }
    }

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsedTime = currentTime - startTime

      // Clear canvas with transparency for trail effect
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.shadowBlur = 0 // Reset shadow for background

      // Draw lightning
      if (lightning && lightning.alpha > 0) {
        lightning.draw()
        lightning.children.forEach((child) => child.draw())
        lightning.update()
      } else if (lightning && lightning.alpha <= 0 && smokeParticles.length === 0) {
        // Lightning faded, create smoke if not already created
        createSmoke(canvas.width / 2, canvas.height * 0.8)
      }

      // Draw smoke
      smokeParticles = smokeParticles.filter((p) => {
        p.update()
        p.draw()
        return p.alpha > 0
      })

      if (elapsedTime < duration || smokeParticles.length > 0) {
        animationId = requestAnimationFrame(animate)
      } else {
        // Stop animation when all effects are done
        cancelAnimationFrame(animationId)
      }
    }

    // Start the animation
    generateLightning()
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme, duration])

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true" />
}
