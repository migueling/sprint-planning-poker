import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn (classnames utility)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("should handle conditional classes", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe("base active")
  })

  it("should handle undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end")
  })

  it("should merge conflicting tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("should merge conflicting tailwind color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("should handle empty input", () => {
    expect(cn()).toBe("")
  })

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar")
  })

  it("should handle objects for conditional classes", () => {
    expect(cn({ active: true, hidden: false, visible: true })).toBe("active visible")
  })
})
