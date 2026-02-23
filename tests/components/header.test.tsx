import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Header } from "@/components/header"
import { I18nProvider } from "@/lib/i18n"

// Mock the theme-related components
vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), resolvedTheme: "light" }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe("Header", () => {
  it("should render the header", () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole("banner")).toBeInTheDocument()
  })

  it("should display the app title", () => {
    renderWithProviders(<Header />)

    expect(screen.getByText("Sprint Planning Poker")).toBeInTheDocument()
  })

  it("should render the language toggle button", () => {
    renderWithProviders(<Header />)

    const langToggle = screen.getByRole("button", { name: /toggle language/i })
    expect(langToggle).toBeInTheDocument()
  })

  it("should render the theme toggle button", () => {
    renderWithProviders(<Header />)

    const themeToggle = screen.getByRole("button", { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
  })

  it("should be sticky positioned", () => {
    renderWithProviders(<Header />)

    const header = screen.getByRole("banner")
    expect(header.className).toContain("sticky")
    expect(header.className).toContain("top-0")
  })
})
