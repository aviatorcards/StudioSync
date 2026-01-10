export const colorSchemes = {
  // Classic/Legacy
  terracotta: {
    name: 'Terracotta',
    primary: '#D98880',
    primaryHover: '#CD6155',
    primaryLight: '#FADBD8',
    primaryDark: '#B03A2E',
  },
  
  // Modern Palette
  orange: {
    name: 'Orange',
    primary: '#F39C12',
    primaryHover: '#D68910',
    primaryLight: '#FDEBD0',
    primaryDark: '#B9770E',
  },
  blue: {
    name: 'Blue',
    primary: '#3498DB',
    primaryHover: '#2980B9',
    primaryLight: '#D6EAF8',
    primaryDark: '#21618C',
  },
  green: {
    name: 'Green',
    primary: '#2ECC71',
    primaryHover: '#27AE60',
    primaryLight: '#D5F5E3',
    primaryDark: '#1E8449',
  },
  purple: {
    name: 'Purple',
    primary: '#9B59B6',
    primaryHover: '#8E44AD',
    primaryLight: '#EBDEF0',
    primaryDark: '#7D3C98',
  },
  red: {
    name: 'Red',
    primary: '#E74C3C',
    primaryHover: '#C0392B',
    primaryLight: '#FADBD8',
    primaryDark: '#943126',
  },
  teal: {
    name: 'Teal',
    primary: '#1ABC9C',
    primaryHover: '#16A085',
    primaryLight: '#D1F2EB',
    primaryDark: '#117864',
  },
  indigo: {
    name: 'Indigo',
    primary: '#34495E',
    primaryHover: '#2C3E50',
    primaryLight: '#D6DBDF',
    primaryDark: '#17202A',
  },
  pink: {
    name: 'Pink',
    primary: '#EC7063',
    primaryHover: '#E74C3C',
    primaryLight: '#FADBD8',
    primaryDark: '#943126',
  },
} as const

export type ColorScheme = keyof typeof colorSchemes

export function applyColorScheme(scheme: ColorScheme) {
  const colors = colorSchemes[scheme] || colorSchemes.blue // Fallback to blue if undefined
  
  if (!colors) return // Safety check

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
  if (typeof window === 'undefined') return 'blue'
  const stored = localStorage.getItem('colorScheme') as ColorScheme
  return stored && stored in colorSchemes ? stored : 'blue'
}

export function initializeColorScheme() {
  if (typeof window === 'undefined') return
  const scheme = getStoredColorScheme()
  applyColorScheme(scheme)
}
