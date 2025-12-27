export const colorSchemes = {
  orange: {
    name: 'Orange',
    primary: '#F39C12',
    primaryHover: '#E67E22',
    primaryLight: '#FEF5E7',
    primaryDark: '#D68910',
  },
  blue: {
    name: 'Blue',
    primary: '#3498DB',
    primaryHover: '#2980B9',
    primaryLight: '#EBF5FB',
    primaryDark: '#21618C',
  },
  green: {
    name: 'Green',
    primary: '#27AE60',
    primaryHover: '#229954',
    primaryLight: '#E8F8F5',
    primaryDark: '#1E8449',
  },
  purple: {
    name: 'Purple',
    primary: '#9B59B6',
    primaryHover: '#8E44AD',
    primaryLight: '#F4ECF7',
    primaryDark: '#7D3C98',
  },
  red: {
    name: 'Red',
    primary: '#E74C3C',
    primaryHover: '#C0392B',
    primaryLight: '#FADBD8',
    primaryDark: '#A93226',
  },
  teal: {
    name: 'Teal',
    primary: '#1ABC9C',
    primaryHover: '#16A085',
    primaryLight: '#E8F8F5',
    primaryDark: '#138D75',
  },
  indigo: {
    name: 'Indigo',
    primary: '#5D6D7E',
    primaryHover: '#34495E',
    primaryLight: '#EBF5FB',
    primaryDark: '#2C3E50',
  },
  pink: {
    name: 'Pink',
    primary: '#EC7063',
    primaryHover: '#E74C3C',
    primaryLight: '#FADBD8',
    primaryDark: '#C0392B',
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
  if (typeof window === 'undefined') return 'orange'
  const stored = localStorage.getItem('colorScheme') as ColorScheme
  return stored && stored in colorSchemes ? stored : 'orange'
}

export function initializeColorScheme() {
  if (typeof window === 'undefined') return
  const scheme = getStoredColorScheme()
  applyColorScheme(scheme)
}
