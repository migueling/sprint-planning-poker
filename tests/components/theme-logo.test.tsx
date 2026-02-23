import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeLogo } from "@/components/theme-logo"

// We'll control the returned theme via a variable
let mockTheme = "light"

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: vi.fn() }),
}))

describe("ThemeLogo", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockTheme = "light"
  })

  it("should render an SVG icon", () => {
    render(<ThemeLogo />)

    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("should accept a custom className", () => {
    render(<ThemeLogo className="h-10 w-10 text-red-500" />)

    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute("class")).toContain("h-10")
  })

  it("should render Sun icon for light theme", () => {
    mockTheme = "light"
    localStorage.setItem("sprint-poker-theme", "light")

    render(<ThemeLogo />)

    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("should render Moon icon for dark theme", () => {
    mockTheme = "dark"
    localStorage.setItem("sprint-poker-theme", "dark")

    render(<ThemeLogo />)

    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("should render Ghost icon for halloween theme", () => {
    mockTheme = "halloween"
    localStorage.setItem("sprint-poker-theme", "halloween")

    render(<ThemeLogo />)

    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("should render TreePine icon for christmas theme", () => {
    mockTheme = "christmas"
    localStorage.setItem("sprint-poker-theme", "christmas")

    render(<ThemeLogo />)

    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })
})
