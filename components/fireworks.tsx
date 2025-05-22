"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"

interface FireworksProps {
  duration?: number
  particleCount?: number
}

export function Fireworks({ duration = 3000, particleCount = 100 }: FireworksProps) {
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

    // Colores para los fuegos artificiales - cyberpunk theme
    const colors = [
      "#ff2a6d", // Rosa neón (primary)
      "#05d9e8", // Cyan neón (secondary)
      "#d300c5", // Magenta (accent)
      "#fee302", // Amarillo neón
      "#00ff9f", // Verde neón
    ]

    // Clase para las partículas
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      alpha: number

      constructor(x: number, y: number, color: string) {
        this.x = x
        this.y = y
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 6 - 3
        this.speedY = Math.random() * 6 - 3
        this.color = color
        this.alpha = 1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.alpha -= 0.01
        this.size -= 0.05
      }

      draw() {
        if (!ctx) return
        ctx.globalAlpha = this.alpha
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Crear explosiones de fuegos artificiales
    const createFirework = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const particles: Particle[] = []

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, color))
      }

      return particles
    }

    // Crear múltiples explosiones en posiciones aleatorias
    let allParticles: Particle[] = []

    const createRandomFireworks = () => {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.6 // Solo en la parte superior
        allParticles = [...allParticles, ...createFirework(x, y)]
      }
    }

    // Iniciar con algunas explosiones
    createRandomFireworks()

    // Añadir nuevas explosiones periódicamente
    const fireworkInterval = setInterval(() => {
      createRandomFireworks()
    }, 800)

    // Función de animación
    const animate = () => {
      if (!ctx) return

      // Fondo con efecto de desvanecimiento
      ctx.fillStyle =
        theme === "dark"
          ? "rgba(13, 2, 33, 0.2)" // Fondo oscuro para tema oscuro
          : "rgba(245, 243, 255, 0.2)" // Fondo claro para tema claro
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Actualizar y dibujar partículas
      allParticles = allParticles.filter((particle) => {
        particle.update()
        particle.draw()
        return particle.alpha > 0 && particle.size > 0
      })

      // Continuar la animación
      const animationId = requestAnimationFrame(animate)

      // Detener la animación cuando no haya más partículas
      if (allParticles.length === 0) {
        cancelAnimationFrame(animationId)
      }
    }

    // Iniciar la animación
    const animationId = requestAnimationFrame(animate)

    // Detener la animación después de la duración especificada
    const timeout = setTimeout(() => {
      clearInterval(fireworkInterval)
    }, duration - 1000) // Dejar de crear nuevas explosiones un poco antes

    return () => {
      clearInterval(fireworkInterval)
      clearTimeout(timeout)
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme, particleCount, duration])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" style={{ mixBlendMode: "screen" }} />
  )
}
