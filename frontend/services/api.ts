import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const CSRF_COOKIE = 'studiosync_csrf'

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        // 'Content-Type': 'application/json', // Let axios set this automatically
    },
})

api.interceptors.request.use(
    (config) => {
        const method = (config.method || 'get').toUpperCase()
        if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
            const csrf = readCookie(CSRF_COOKIE)
            if (csrf) {
                config.headers['X-CSRFToken'] = csrf
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const csrf = readCookie(CSRF_COOKIE)
                await axios.post(`${API_URL}/auth/token/refresh/`, {}, {
                    withCredentials: true,
                    headers: csrf ? { 'X-CSRFToken': csrf } : {},
                })
                return api(originalRequest)
            } catch (refreshError) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api
