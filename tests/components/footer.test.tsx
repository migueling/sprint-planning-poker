import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/footer"
import { I18nProvider } from "@/lib/i18n"

function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe("Footer", () => {
  it("should render the footer", () => {
    renderWithProviders(<Footer />)

    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })

  it("should display 'Created with' text", () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText(/Created with/)).toBeInTheDocument()
  })

  it("should display the heart emoji", () => {
    renderWithProviders(<Footer />)

    const footer = screen.getByRole("contentinfo")
    expect(footer.textContent).toContain("\u2764\uFE0F")
  })

  it("should have a link to Mike's LinkedIn", () => {
    renderWithProviders(<Footer />)

    const mikeLink = screen.getByRole("link", { name: "Mike" })
    expect(mikeLink).toBeInTheDocument()
    expect(mikeLink).toHaveAttribute("href", "https://www.linkedin.com/in/migueling/")
    expect(mikeLink).toHaveAttribute("target", "_blank")
    expect(mikeLink).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("should have a link to v0.dev", () => {
    renderWithProviders(<Footer />)

    const v0Link = screen.getByRole("link", { name: "v0" })
    expect(v0Link).toBeInTheDocument()
    expect(v0Link).toHaveAttribute("href", "https://v0.dev")
    expect(v0Link).toHaveAttribute("target", "_blank")
    expect(v0Link).toHaveAttribute("rel", "noopener noreferrer")
  })
})
