import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LanguageToggle } from "@/components/language-toggle"
import { I18nProvider } from "@/lib/i18n"

function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe("LanguageToggle", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("should render the toggle button", () => {
    renderWithProviders(<LanguageToggle />)

    const button = screen.getByRole("button", { name: /toggle language/i })
    expect(button).toBeInTheDocument()
  })

  it("should open dropdown on click", async () => {
    const user = userEvent.setup()

    renderWithProviders(<LanguageToggle />)

    const button = screen.getByRole("button", { name: /toggle language/i })
    await user.click(button)

    // Should show language options
    expect(screen.getByText(/English/i)).toBeInTheDocument()
  })
})
