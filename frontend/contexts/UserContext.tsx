'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    initials: string
    role: UserRole
    avatar: string | null
    timezone: string
    is_staff: boolean
    preferences?: Record<string, any>
    phone?: string
    bio?: string
    instrument?: string
}

interface UserContextType {
    currentUser: User | null
    isLoading: boolean
    login: (email: string, pass: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<void>
    setCurrentUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// API URL configuration
// API URL configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const checkAuth = useCallback(async () => {
        // Only run on client-side
        if (typeof window === 'undefined') {
            setIsLoading(false)
            return
        }

        const token = localStorage.getItem('accessToken')
        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/auth/me/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            })

            if (res.ok) {
                const userData = await res.json()
                setCurrentUser(userData)
            } else {
                // Token invalid or expired
                logout()
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const login = async (email: string, pass: string) => {
        if (typeof window === 'undefined') return

        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password: pass })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.detail || 'Login failed')
            }

            const data = await res.json()
            localStorage.setItem('accessToken', data.access)
            localStorage.setItem('refreshToken', data.refresh)

            await checkAuth()
            router.push('/dashboard')
        } catch (error) {
            setIsLoading(false)
            throw error
        }
    }

    const logout = () => {
        if (typeof window === 'undefined') return

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setCurrentUser(null)
        router.push('/login')
    }

    return (
        <UserContext.Provider value={{ currentUser, isLoading, login, logout, checkAuth, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

