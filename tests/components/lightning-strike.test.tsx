import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render } from "@testing-library/react"
import { LightningStrike } from "@/components/lightning-strike"

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}))

describe("LightningStrike", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should render a canvas element", () => {
    const { container } = render(<LightningStrike />)

    const canvas = container.querySelector("canvas")
    expect(canvas).toBeInTheDocument()
  })

  it("should have aria-hidden for accessibility", () => {
    const { container } = render(<LightningStrike />)

    const canvas = container.querySelector("canvas")
    expect(canvas?.getAttribute("aria-hidden")).toBe("true")
  })

  it("should be positioned fixed and cover the viewport", () => {
    const { container } = render(<LightningStrike />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain("fixed")
    expect(wrapper.className).toContain("inset-0")
    expect(wrapper.className).toContain("z-50")
  })

  it("should call onComplete after the animation", () => {
    const onComplete = vi.fn()

    render(<LightningStrike onComplete={onComplete} />)

    // Advance past the animation duration (3500ms)
    vi.advanceTimersByTime(4000)

    expect(onComplete).toHaveBeenCalled()
  })

  it("should accept a custom duration", () => {
    const onComplete = vi.fn()

    render(<LightningStrike duration={1000} onComplete={onComplete} />)

    vi.advanceTimersByTime(1500)

    expect(onComplete).toHaveBeenCalled()
  })
})
