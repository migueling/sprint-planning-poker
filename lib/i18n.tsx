"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import esTranslations from "@/locales/es.json"
import enTranslations from "@/locales/en.json"

type Translations = Record<string, any>
type Language = "es" | "en"

interface I18nContextType {
  t: (key: string, params?: Record<string, string>) => string
  language: Language
  setLanguage: (lang: Language) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>("es")
  const translations: Record<Language, Translations> = {
    es: esTranslations,
    en: enTranslations,
  }

  useEffect(() => {
    // Intenta obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    } else {
      // Si no hay idioma guardado, detecta el idioma del navegador
      const browserLanguage = navigator.language.split("-")[0]
      setLanguageState(browserLanguage === "en" ? "en" : "es")
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    // Navega por el objeto de traducciones
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Si no se encuentra la clave, intenta en español como fallback
        if (language !== "es") {
          let fallbackValue = translations["es"]
          for (const fallbackKey of keys) {
            if (fallbackValue && typeof fallbackValue === "object" && fallbackKey in fallbackValue) {
              fallbackValue = fallbackValue[fallbackKey]
            } else {
              return key // Si tampoco está en español, devuelve la clave
            }
          }
          value = fallbackValue
        } else {
          return key // Si ya estamos en español y no existe, devuelve la clave
        }
      }
    }

    // Si el valor es un array, devuélvelo como tal
    if (Array.isArray(value)) {
      return value
    }

    // Si el valor no es un string, conviértelo
    if (typeof value !== "string") {
      return String(value)
    }

    // Reemplaza los parámetros si existen
    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{{${paramKey}}}`, "g"), paramValue)
      }, value)
    }

    return value
  }

  return <I18nContext.Provider value={{ t, language, setLanguage }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
