import { useState, useEffect } from 'react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

interface DashboardStats {
    overview: {
        [key: string]: {
            value: number | string
            trend?: string
            positive?: boolean
            label?: string
        }
    }
    recent_activity: {
        id: string
        text: string
        time: string
        type: 'success' | 'warning' | 'info' | 'error'
    }[]
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/core/stats/')
                setStats(response.data)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err)
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { stats, loading, error }
}

export function useStudents(params?: any) {
    const [students, setStudents] = useState<any[]>([])
    const [meta, setMeta] = useState<any>({ count: 0, next: null, previous: null })
    const [loading, setLoading] = useState(true)

    const fetchStudents = async () => {
        setLoading(true)
        try {
            const response = await api.get('/students/', { params })
            const data = response.data
            if (data.results) {
                setStudents(data.results)
                setMeta({ count: data.count, next: data.next, previous: data.previous })
            } else {
                setStudents(Array.isArray(data) ? data : [])
                setMeta({ count: Array.isArray(data) ? data.length : 0, next: null, previous: null })
            }
        } catch (err) {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [JSON.stringify(params)])

    return { students, meta, loading, refresh: fetchStudents }
}

export function useLessons(params?: any) {
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchLessons = async () => {
        try {
            const response = await api.get('/lessons/', { params })
            const data = response.data.results || response.data
            setLessons(Array.isArray(data) ? data : [])
        } catch (err) {
            toast.error('Failed to load lessons')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLessons()
    }, [JSON.stringify(params)])

    return { lessons, loading, refetch: fetchLessons }
}

export function useTeachers(params?: any) {
    const [teachers, setTeachers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/core/teachers/', { params })
            const data = response.data.results || response.data
            setTeachers(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load teachers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeachers()
    }, [JSON.stringify(params)])

    return { teachers, loading, refresh: fetchTeachers }
}

export function useInvoices(params?: any) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await api.get('/billing/invoices/', { params })
                const data = response.data.results || response.data
                setInvoices(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error(err)
                toast.error('Failed to load invoices')
            } finally {
                setLoading(false)
            }
        }
        fetchInvoices()
    }, [JSON.stringify(params)])

    return { invoices, loading }
}

export function useUsers(params?: any) {
    const [users, setUsers] = useState<any[]>([])
    const [meta, setMeta] = useState<any>({ count: 0, next: null, previous: null })
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const response = await api.get('/core/users/', { params })
            const data = response.data
            if (data.results) {
                setUsers(data.results)
                setMeta({ count: data.count, next: data.next, previous: data.previous })
            } else {
                setUsers(Array.isArray(data) ? data : [])
                setMeta({ count: Array.isArray(data) ? data.length : 0, next: null, previous: null })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [JSON.stringify(params)])

    return { users, meta, loading, refresh: fetchUsers }
}

export function useBands(params?: any) {
    const [bands, setBands] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBands = async () => {
        try {
            const response = await api.get('/core/bands/', { params })
            const data = response.data.results || response.data
            setBands(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load bands')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBands()
    }, [JSON.stringify(params)])

    return { bands, loading, refresh: fetchBands }
}

export function useStudios(params?: any) {
    const [studios, setStudios] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchStudios = async () => {
        try {
            const response = await api.get('/core/studios/', { params })
            const data = response.data.results || response.data
            setStudios(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load studios')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudios()
    }, [JSON.stringify(params)])

    return { studios, loading, refetch: fetchStudios }
}

export function useResources(params?: any) {
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchResources = async () => {
        try {
            const response = await api.get('/resources/library/', { params })
            const data = response.data.results || response.data
            setResources(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load resources')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchResources()
    }, [JSON.stringify(params)])

    return { resources, loading, refetch: fetchResources }
}

export function useLessonPlans(params?: any) {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPlans = async () => {
        try {
            const response = await api.get('/lessons/plans/', { params })
            const data = response.data.results || response.data
            setPlans(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load lesson plans')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlans()
    }, [JSON.stringify(params)])

    return { plans, loading, refetch: fetchPlans }
}

export function useGoals(params?: any) {
    const [goals, setGoals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchGoals = async () => {
        try {
            const response = await api.get('/lessons/goals/', { params })
            const data = response.data.results || response.data
            setGoals(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load goals')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGoals()
    }, [JSON.stringify(params)])

    return { goals, loading, refetch: fetchGoals }
}
