"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LightningStrike } from "@/components/lightning-strike"
import { Ghost, RotateCcw } from "lucide-react"

export default function ConsensusTestPage() {
  const [showLightning, setShowLightning] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const triggerLightning = () => {
    if (isPlaying) return

    setShowLightning(true)
    setIsPlaying(true)

    // Resetear después de 3.5 segundos (un poco más que la duración del efecto)
    setTimeout(() => {
      setShowLightning(false)
      setIsPlaying(false)
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Efecto de lightning */}
      {showLightning && <LightningStrike duration={3000} />}

      {/* Contenido de la página */}
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glitch-text mb-4 flex items-center justify-center gap-3">
            <Ghost className="h-10 w-10 text-primary" />
            Lightning Strike Test
          </h1>
          <p className="text-muted-foreground text-lg">Test page for the consensus celebration effect</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Control Panel */}
          <Card className="cyberpunk-card">
            <CardHeader>
              <CardTitle className="text-xl neon-text">⚡ Effect Controls</CardTitle>
              <CardDescription>
                Trigger the lightning strike effect that appears when consensus is reached
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={triggerLightning}
                disabled={isPlaying}
                className="w-full btn-primary text-lg py-6"
                size="lg"
              >
                {isPlaying ? (
                  <>
                    <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                    Playing Effect...
                  </>
                ) : (
                  <>
                    <Ghost className="h-5 w-5 mr-2" />
                    Trigger Lightning Strike
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Click the button to see the consensus celebration effect</p>
                <p>• The effect lasts approximately 3 seconds</p>
                <p>• Features yellow lightning with flash effects</p>
                <p>• Includes impact particles and smoke</p>
              </div>
            </CardContent>
          </Card>

          {/* Effect Details */}
          <Card className="cyberpunk-card">
            <CardHeader>
              <CardTitle className="text-xl neon-text-secondary">🎃 Effect Details</CardTitle>
              <CardDescription>What happens during the lightning strike effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Lightning Bolt</h4>
                    <p className="text-sm text-muted-foreground">
                      Bright yellow lightning strikes from top to bottom with branching effects
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Flash Effect</h4>
                    <p className="text-sm text-muted-foreground">
                      Screen flashes with yellow overlay and lightning flickers between yellow and white
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Impact & Shockwave</h4>
                    <p className="text-sm text-muted-foreground">
                      Circular shockwave expands from impact point with particle explosion
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Smoke Effect</h4>
                    <p className="text-sm text-muted-foreground">
                      Realistic smoke particles rise and dissipate from the impact zone
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="cyberpunk-card bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">🎯 Consensus Reached!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This effect triggers when all participants vote the same value
              </p>
            </CardContent>
          </Card>

          <Card className="cyberpunk-card bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">⚡ Cyberpunk Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bright yellow lightning with glow effects and screen flash
              </p>
            </CardContent>
          </Card>

          <Card className="cyberpunk-card bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">🎆 Full Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lightning → Impact → Shockwave → Smoke sequence</p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 cyberpunk-card border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-xl text-amber-500">💡 How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click the "Trigger Lightning Strike" button above</li>
              <li>Watch the full sequence: lightning → flash → impact → smoke</li>
              <li>Wait for the effect to complete before triggering again</li>
              <li>Try switching between light and dark themes to see color variations</li>
              <li>The effect works the same way in the actual voting sessions</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
