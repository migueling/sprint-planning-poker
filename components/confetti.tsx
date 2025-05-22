"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"

interface ConfettiProps {
  duration?: number
  particleCount?: number
}

export function Confetti({ duration = 3000, particleCount = 150 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajustar el tamaño del canvas al tamaño de la ventana
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Colores para el confeti - cyberpunk theme
    const colors = [
      "#ff2a6d", // Rosa neón (primary)
      "#05d9e8", // Cyan neón (secondary)
      "#d300c5", // Magenta (accent)
      "#fee302", // Amarillo neón
      "#00ff9f", // Verde neón
    ]

    // Clase para las partículas de confeti
    class ConfettiParticle {
      x: number
      y: number
      width: number
      height: number
      color: string
      rotation: number
      rotationSpeed: number
      speedX: number
      speedY: number
      gravity: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = -20 - Math.random() * 100 // Empezar por encima de la pantalla
        this.width = Math.random() * 10 + 5
        this.height = Math.random() * 6 + 2
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.rotation = Math.random() * 360
        this.rotationSpeed = Math.random() * 10 - 5
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 + 2
        this.gravity = 0.1
        this.opacity = 1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.speedY += this.gravity
        this.rotation += this.rotationSpeed

        // Reducir la opacidad gradualmente
        if (this.y > canvas.height / 2) {
          this.opacity -= 0.01
        }

        // Efecto de oscilación horizontal
        this.x += Math.sin(this.y / 30) * 0.5
      }

      draw() {
        if (!ctx) return

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate((this.rotation * Math.PI) / 180)
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
        ctx.restore()
      }
    }

    // Crear partículas de confeti
    const particles: ConfettiParticle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push(new ConfettiParticle())
    }

    // Función de animación
    let animationId: number
    const animate = () => {
      if (!ctx) return

      // Limpiar el canvas con un fondo semi-transparente para crear efecto de desvanecimiento
      ctx.fillStyle = theme === "dark" ? "rgba(13, 2, 33, 0.2)" : "rgba(245, 243, 255, 0.2)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Actualizar y dibujar partículas
      let activeParts = 0
      for (const particle of particles) {
        if (particle.opacity > 0) {
          particle.update()
          particle.draw()
          activeParts++
        }
      }

      // Continuar la animación si hay partículas activas
      if (activeParts > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    // Iniciar la animación
    animationId = requestAnimationFrame(animate)

    // Detener la animación después de la duración especificada
    const timeout = setTimeout(() => {
      // Acelerar la desaparición de las partículas
      for (const particle of particles) {
        particle.opacity -= 0.02
      }
    }, duration - 1000)

    return () => {
      cancelAnimationFrame(animationId)
      clearTimeout(timeout)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme, particleCount, duration])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  )
}
