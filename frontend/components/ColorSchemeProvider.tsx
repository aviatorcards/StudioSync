'use client'

import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'

const colorSchemes = {
  orange: {
    primary: '#F39C12',
    primaryHover: '#E67E22',
    primaryLight: '#FEF5E7',
    primaryDark: '#D68910',
  },
  blue: {
    primary: '#3498DB',
    primaryHover: '#2980B9',
    primaryLight: '#EBF5FB',
    primaryDark: '#21618C',
  },
  green: {
    primary: '#27AE60',
    primaryHover: '#229954',
    primaryLight: '#E8F8F5',
    primaryDark: '#1E8449',
  },
  purple: {
    primary: '#9B59B6',
    primaryHover: '#8E44AD',
    primaryLight: '#F4ECF7',
    primaryDark: '#7D3C98',
  },
  red: {
    primary: '#E74C3C',
    primaryHover: '#C0392B',
    primaryLight: '#FADBD8',
    primaryDark: '#A93226',
  },
  teal: {
    primary: '#1ABC9C',
    primaryHover: '#16A085',
    primaryLight: '#E8F8F5',
    primaryDark: '#138D75',
  },
  indigo: {
    primary: '#5D6D7E',
    primaryHover: '#34495E',
    primaryLight: '#EBF5FB',
    primaryDark: '#2C3E50',
  },
  pink: {
    primary: '#EC7063',
    primaryHover: '#E74C3C',
    primaryLight: '#FADBD8',
    primaryDark: '#C0392B',
  },
} as const

export default function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser()

  useEffect(() => {
    // Get color scheme from user preferences or default to orange
    const colorScheme = (currentUser?.preferences?.appearance?.color_scheme || 'orange') as keyof typeof colorSchemes

    // Apply colors to CSS variables
    const colors = colorSchemes[colorScheme] || colorSchemes.orange
    const root = document.documentElement

    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-hover', colors.primaryHover)
    root.style.setProperty('--color-primary-light', colors.primaryLight)
    root.style.setProperty('--color-primary-dark', colors.primaryDark)
  }, [currentUser?.preferences?.appearance?.color_scheme])

  return <>{children}</>
}
