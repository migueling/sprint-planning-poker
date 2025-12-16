# How to Change the Default Theme

This document provides clear instructions on how to change the default theme in the Sprint Planning Poker application.

## Overview

The application supports multiple themes: `light`, `dark`, `halloween`, and `christmas`. To change the default theme, you need to update **THREE** specific locations in the codebase.

## Required Changes

### 1. Update `app/layout.tsx`

This is the **MOST IMPORTANT** file. You need to change the default theme in **THREE** places:

#### Location 1: HTML className attribute
```typescript
// Find this line (around line 25):
<html lang="en" suppressHydrationWarning className="halloween">

// Change "halloween" to your desired theme:
<html lang="en" suppressHydrationWarning className="christmas">
```

#### Location 2: Script fallback value
```typescript
// Find this line inside the Script tag (around line 29):
const theme = localStorage.getItem('sprint-poker-theme') || 'halloween';

// Change "halloween" to your desired theme:
const theme = localStorage.getItem('sprint-poker-theme') || 'christmas';
```

#### Location 3: Script catch block
```typescript
// Find this line inside the catch block (around line 32):
document.documentElement.className = 'halloween';

// Change "halloween" to your desired theme:
document.documentElement.className = 'christmas';
```

#### Location 4: ThemeProvider defaultTheme prop
```typescript
// Find this line (around line 37):
<ThemeProvider
  attribute="class"
  defaultTheme="halloween"
  enableSystem={false}
  storageKey="sprint-poker-theme"
>

// Change "halloween" to your desired theme:
<ThemeProvider
  attribute="class"
  defaultTheme="christmas"
  enableSystem={false}
  storageKey="sprint-poker-theme"
>
```

### 2. Update `components/theme-provider.tsx`

#### Location: localStorage default value
```typescript
// Find this line (around line 13):
if (!savedTheme) {
  localStorage.setItem("sprint-poker-theme", "halloween")
  document.documentElement.className = "halloween"
}

// Change both instances of "halloween" to your desired theme:
if (!savedTheme) {
  localStorage.setItem("sprint-poker-theme", "christmas")
  document.documentElement.className = "christmas"
}
```

### 3. Update `components/theme-toggle.tsx`

#### Location 1: Initial state
```typescript
// Find this line (around line 14):
const [currentTheme, setCurrentTheme] = useState<string>("halloween")

// Change "halloween" to your desired theme:
const [currentTheme, setCurrentTheme] = useState<string>("christmas")
```

#### Location 2: localStorage fallback
```typescript
// Find this line (around line 19):
const savedTheme = localStorage.getItem("sprint-poker-theme") || "halloween"

// Change "halloween" to your desired theme:
const savedTheme = localStorage.getItem("sprint-poker-theme") || "christmas"
```

#### Location 3: Theme check fallback
```typescript
// Find this line (around line 23):
if (!theme || theme === "system") {
  setTheme("halloween")
  document.documentElement.className = "halloween"
}

// Change both instances of "halloween" to your desired theme:
if (!theme || theme === "system") {
  setTheme("christmas")
  document.documentElement.className = "christmas"
}
```

#### Location 4: Loading state icon
```typescript
// Find this section (around line 32):
if (!mounted) {
  return (
    <Button variant="ghost" size="icon" className="h-9 w-9">
      <Ghost className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

// Change the icon to match your default theme:
// For christmas: <TreePine className="h-4 w-4" />
// For halloween: <Ghost className="h-4 w-4" />
// For light: <Sun className="h-4 w-4" />
// For dark: <Moon className="h-4 w-4" />
```

## Summary Checklist

When changing the default theme, update ALL of these locations:

- [ ] `app/layout.tsx` - HTML className (line ~25)
- [ ] `app/layout.tsx` - Script localStorage fallback (line ~29)
- [ ] `app/layout.tsx` - Script catch block (line ~32)
- [ ] `app/layout.tsx` - ThemeProvider defaultTheme prop (line ~37)
- [ ] `components/theme-provider.tsx` - localStorage default (line ~13, 2 instances)
- [ ] `components/theme-toggle.tsx` - useState initial value (line ~14)
- [ ] `components/theme-toggle.tsx` - localStorage fallback (line ~19)
- [ ] `components/theme-toggle.tsx` - Theme check fallback (line ~23, 2 instances)
- [ ] `components/theme-toggle.tsx` - Loading state icon (line ~32)

## Available Themes

- `light` - Light mode with sun icon
- `dark` - Dark mode with moon icon
- `halloween` - Halloween theme with ghost icon
- `christmas` - Christmas theme with tree icon

## Testing

After making changes:

1. Clear your browser's localStorage for the app
2. Refresh the page
3. Verify the correct theme loads by default
4. Verify the correct icon appears in the theme toggle button
5. Test switching between themes to ensure all themes still work

## Important Notes

- **ALL locations must be updated** - Missing even one location will cause the wrong theme to load
- The theme name must be **exactly the same** in all locations (case-sensitive)
- The theme name must match one of the available themes defined in `app/globals.css`
- After changing the default theme, users who have already selected a theme will keep their selection (stored in localStorage)
