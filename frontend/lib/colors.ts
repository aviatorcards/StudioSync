export const colorSchemes = {
  terracotta: {
    name: 'Terracotta',
    primary: '#D98880',
    primaryHover: '#CD6155',
    primaryLight: '#FADBD8',
    primaryDark: '#B03A2E',
  },
  ocean: {
    name: 'Ocean',
    primary: '#5DADE2',
    primaryHover: '#3498DB',
    primaryLight: '#D6EAF8',
    primaryDark: '#2874A6',
  },
  sky: {
    name: 'Sky',
    primary: '#85C1E9',
    primaryHover: '#5DADE2',
    primaryLight: '#EBF5FB',
    primaryDark: '#2E86C1',
  },
  slate: {
    name: 'Slate',
    primary: '#AAB7B8',
    primaryHover: '#909497',
    primaryLight: '#EAECEE',
    primaryDark: '#566573',
  },
} as const

export type ColorScheme = keyof typeof colorSchemes

export function applyColorScheme(scheme: ColorScheme) {
  const colors = colorSchemes[scheme]

  // Apply CSS variables to root
  const root = document.documentElement
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-primary-hover', colors.primaryHover)
  root.style.setProperty('--color-primary-light', colors.primaryLight)
  root.style.setProperty('--color-primary-dark', colors.primaryDark)

  // Store in localStorage
  localStorage.setItem('colorScheme', scheme)
}

export function getStoredColorScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'terracotta'
  const stored = localStorage.getItem('colorScheme') as ColorScheme
  return stored && stored in colorSchemes ? stored : 'terracotta'
}

export function initializeColorScheme() {
  if (typeof window === 'undefined') return
  const scheme = getStoredColorScheme()
  applyColorScheme(scheme)
}
