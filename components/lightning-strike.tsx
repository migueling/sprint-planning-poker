"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"

interface LightningStrikeProps {
  duration?: number
}

export function LightningStrike({ duration = 3000 }: LightningStrikeProps) {
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

    // Colores del rayo - amarillo brillante
    const lightningColors = {
      core: "#ffff00", // Amarillo puro para el núcleo
      bright: "#fff700", // Amarillo brillante
      glow: "#ffed4e", // Amarillo más suave para el glow
      flash: "#ffffff", // Blanco para el flash
    }

    let animationId: number
    let startTime: number
    let lightningBolts: LightningBolt[] = []
    let smokeParticles: SmokeParticle[] = []
    let flashIntensity = 0
    let impactCreated = false

    // Clase para el rayo principal
    class LightningBolt {
      segments: LightningSegment[]
      alpha: number
      flashTimer: number
      isFlashing: boolean

      constructor() {
        this.segments = []
        this.alpha = 1
        this.flashTimer = 0
        this.isFlashing = true
        this.generateBolt()
      }

      generateBolt() {
        const startX = canvas.width / 2
        const startY = -50
        const endX = canvas.width / 2 + (Math.random() - 0.5) * 100
        const endY = canvas.height * 0.85

        // Crear el rayo principal con múltiples segmentos zigzagueantes
        const numSegments = 15 + Math.floor(Math.random() * 10)
        let currentX = startX
        let currentY = startY

        for (let i = 0; i < numSegments; i++) {
          const progress = i / numSegments
          const targetX = startX + (endX - startX) * progress + (Math.random() - 0.5) * 80
          const targetY = startY + (endY - startY) * progress + (Math.random() - 0.5) * 40

          this.segments.push(new LightningSegment(currentX, currentY, targetX, targetY, true))

          // Crear ramas laterales ocasionalmente
          if (Math.random() < 0.4 && i > 2) {
            const branchLength = 30 + Math.random() * 50
            const branchAngle = (Math.random() - 0.5) * Math.PI * 0.8
            const branchEndX = targetX + Math.cos(branchAngle) * branchLength
            const branchEndY = targetY + Math.sin(branchAngle) * branchLength

            this.segments.push(new LightningSegment(targetX, targetY, branchEndX, branchEndY, false))
          }

          currentX = targetX
          currentY = targetY
        }
      }

      update() {
        this.flashTimer += 0.1

        // Efecto de flash intermitente
        if (this.flashTimer < 1) {
          this.isFlashing = Math.sin(this.flashTimer * 20) > 0
        } else {
          this.isFlashing = false
          this.alpha -= 0.02
        }

        // Regenerar el rayo ocasionalmente para efecto de parpadeo
        if (this.flashTimer < 0.8 && Math.random() < 0.3) {
          this.segments = []
          this.generateBolt()
        }
      }

      draw() {
        if (!ctx || this.alpha <= 0) return

        this.segments.forEach((segment) => {
          // Dibujar múltiples capas para efecto de grosor y glow

          // Capa exterior (glow más amplio)
          ctx.beginPath()
          ctx.moveTo(segment.x1, segment.y1)
          ctx.lineTo(segment.x2, segment.y2)
          ctx.strokeStyle = lightningColors.glow
          ctx.lineWidth = segment.isMain ? 12 : 8
          ctx.globalAlpha = this.alpha * 0.3
          ctx.shadowBlur = 25
          ctx.shadowColor = lightningColors.glow
          ctx.stroke()

          // Capa media (brillo)
          ctx.beginPath()
          ctx.moveTo(segment.x1, segment.y1)
          ctx.lineTo(segment.x2, segment.y2)
          ctx.strokeStyle = lightningColors.bright
          ctx.lineWidth = segment.isMain ? 6 : 4
          ctx.globalAlpha = this.alpha * 0.7
          ctx.shadowBlur = 15
          ctx.shadowColor = lightningColors.bright
          ctx.stroke()

          // Núcleo (más brillante)
          ctx.beginPath()
          ctx.moveTo(segment.x1, segment.y1)
          ctx.lineTo(segment.x2, segment.y2)
          ctx.strokeStyle = this.isFlashing ? lightningColors.flash : lightningColors.core
          ctx.lineWidth = segment.isMain ? 3 : 2
          ctx.globalAlpha = this.alpha
          ctx.shadowBlur = this.isFlashing ? 30 : 10
          ctx.shadowColor = this.isFlashing ? lightningColors.flash : lightningColors.core
          ctx.stroke()
        })

        // Reset shadow
        ctx.shadowBlur = 0
      }
    }

    class LightningSegment {
      x1: number
      y1: number
      x2: number
      y2: number
      isMain: boolean

      constructor(x1: number, y1: number, x2: number, y2: number, isMain: boolean) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.isMain = isMain
      }
    }

    class SmokeParticle {
      x: number
      y: number
      size: number
      alpha: number
      speedX: number
      speedY: number
      color: string

      constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 60
        this.y = y
        this.size = Math.random() * 15 + 8
        this.alpha = Math.random() * 0.6 + 0.4
        this.speedX = (Math.random() - 0.5) * 2
        this.speedY = -(Math.random() * 2 + 1)
        this.color = theme === "dark" ? "rgba(200, 200, 200, 0.8)" : "rgba(100, 100, 100, 0.6)"
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.alpha -= 0.01
        this.size += 0.2
        this.speedY *= 0.98 // Desaceleración gradual
      }

      draw() {
        if (!ctx || this.alpha <= 0) return

        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    class ImpactEffect {
      x: number
      y: number
      particles: ImpactParticle[]
      shockwaveRadius: number
      shockwaveAlpha: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.particles = []
        this.shockwaveRadius = 0
        this.shockwaveAlpha = 1

        // Crear partículas de impacto
        for (let i = 0; i < 30; i++) {
          this.particles.push(new ImpactParticle(x, y))
        }
      }

      update() {
        this.shockwaveRadius += 8
        this.shockwaveAlpha -= 0.03

        this.particles = this.particles.filter((p) => {
          p.update()
          return p.alpha > 0
        })
      }

      draw() {
        if (!ctx) return

        // Dibujar onda de choque
        if (this.shockwaveAlpha > 0) {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.shockwaveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = lightningColors.glow
          ctx.lineWidth = 3
          ctx.globalAlpha = this.shockwaveAlpha
          ctx.shadowBlur = 20
          ctx.shadowColor = lightningColors.glow
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        // Dibujar partículas de impacto
        this.particles.forEach((p) => p.draw())
      }
    }

    class ImpactParticle {
      x: number
      y: number
      speedX: number
      speedY: number
      size: number
      alpha: number
      color: string

      constructor(x: number, y: number) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 5 + 2
        this.x = x
        this.y = y
        this.speedX = Math.cos(angle) * speed
        this.speedY = Math.sin(angle) * speed - Math.random() * 2
        this.size = Math.random() * 4 + 2
        this.alpha = 1
        this.color = lightningColors.bright
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.speedY += 0.1 // Gravedad
        this.alpha -= 0.02
        this.size -= 0.05
      }

      draw() {
        if (!ctx || this.alpha <= 0 || this.size <= 0) return

        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.shadowBlur = 10
        ctx.shadowColor = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    let impactEffect: ImpactEffect | null = null

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsedTime = currentTime - startTime

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Efecto de flash de pantalla
      if (elapsedTime < 1000) {
        flashIntensity = Math.sin(elapsedTime * 0.02) * 0.3 + 0.1
        if (flashIntensity > 0) {
          ctx.fillStyle = `rgba(255, 255, 0, ${flashIntensity * 0.1})`
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }

      // Crear rayos iniciales
      if (elapsedTime < 1200 && lightningBolts.length < 3) {
        if (Math.random() < 0.1) {
          lightningBolts.push(new LightningBolt())
        }
      }

      // Actualizar y dibujar rayos
      lightningBolts = lightningBolts.filter((bolt) => {
        bolt.update()
        bolt.draw()
        return bolt.alpha > 0
      })

      // Crear efecto de impacto
      if (elapsedTime > 800 && !impactCreated) {
        impactEffect = new ImpactEffect(canvas.width / 2, canvas.height * 0.85)

        // Crear humo
        for (let i = 0; i < 40; i++) {
          smokeParticles.push(new SmokeParticle(canvas.width / 2, canvas.height * 0.85))
        }

        impactCreated = true
      }

      // Actualizar y dibujar efecto de impacto
      if (impactEffect) {
        impactEffect.update()
        impactEffect.draw()
      }

      // Actualizar y dibujar humo
      smokeParticles = smokeParticles.filter((particle) => {
        particle.update()
        particle.draw()
        return particle.alpha > 0
      })

      // Continuar animación
      if (elapsedTime < duration || smokeParticles.length > 0 || lightningBolts.length > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    // Iniciar animación
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme, duration])

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true" />
}
