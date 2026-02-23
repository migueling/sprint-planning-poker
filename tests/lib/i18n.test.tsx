import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { I18nProvider, useI18n } from "@/lib/i18n"

// Helper component to test the hook
function TestConsumer() {
  const { t, language, setLanguage } = useI18n()
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="translation">{t("header.title")}</span>
      <span data-testid="interpolated">{t("session.participants.votedCount", { voted: "3", total: "5" })}</span>
      <span data-testid="missing-key">{t("this.key.does.not.exist")}</span>
      <button data-testid="switch-es" onClick={() => setLanguage("es")}>ES</button>
      <button data-testid="switch-en" onClick={() => setLanguage("en")}>EN</button>
    </div>
  )
}

describe("I18nProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("should default to English language", () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    )

    expect(screen.getByTestId("language")).toHaveTextContent("en")
  })

  it("should translate a simple key", () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    )

    expect(screen.getByTestId("translation")).toHaveTextContent("Sprint Planning Poker")
  })

  it("should return the key for missing translations", () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    )

    expect(screen.getByTestId("missing-key")).toHaveTextContent("this.key.does.not.exist")
  })

  it("should switch language to Spanish", async () => {
    const user = userEvent.setup()

    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    )

    await user.click(screen.getByTestId("switch-es"))

    expect(screen.getByTestId("language")).toHaveTextContent("es")
    expect(localStorage.setItem).toHaveBeenCalledWith("language", "es")
  })

  it("should interpolate parameters in translations", () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    )

    const text = screen.getByTestId("interpolated").textContent
    expect(text).toContain("3")
    expect(text).toContain("5")
  })

  it("should read saved language from localStorage", () => {
    localStorage.setItem("language", "es")

    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    )

    // After useEffect runs, it should pick up 'es'
    expect(localStorage.getItem).toHaveBeenCalledWith("language")
  })
})

describe("useI18n outside provider", () => {
  it("should throw when used outside of I18nProvider", () => {
    // Suppress console.error from React for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer />)
    }).toThrow("useI18n must be used within an I18nProvider")

    consoleSpy.mockRestore()
  })
})
