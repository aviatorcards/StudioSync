import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        // 'Content-Type': 'application/json', // Let axios set this automatically
    },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Add a response interceptor to handle 401s (token expiration)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')
                if (!refreshToken) {
                    throw new Error('No refresh token')
                }

                const response = await axios.post(`${API_URL}/auth/token/refresh`, {
                    refresh: refreshToken
                })

                const { access } = response.data
                localStorage.setItem('accessToken', access)

                api.defaults.headers.common['Authorization'] = `Bearer ${access}`
                return api(originalRequest)
            } catch (refreshError) {
                // Logout user if refresh fails
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api

// Setlist API
export const getSetlists = (bandId?: string) => api.get('/resources/setlists', { params: bandId ? { band: bandId } : {} })
export const getSetlist = (setlistId: string) => api.get(`/resources/setlists/${setlistId}`)
export const createSetlist = (data: { name: string; description?: string; band?: string; status?: string; event_date?: string; venue?: string }) => api.post('/resources/setlists', data)
export const updateSetlist = (setlistId: string, data: { name?: string; description?: string; status?: string; event_date?: string; venue?: string }) => api.patch(`/resources/setlists/${setlistId}`, data)
export const deleteSetlist = (setlistId: string) => api.delete(`/resources/setlists/${setlistId}`)

// Setlist Items (songs & breaks)
export const addSetlistItem = (setlistId: string, data: { title: string; artist?: string; notes?: string; item_type?: string; duration_minutes?: number; resource_id?: string }) => api.post(`/resources/setlists/${setlistId}/add-item`, data)
export const addResourceToSetlist = (setlistId: string, resourceId: string, notes?: string) => api.post(`/resources/setlists/${setlistId}/add-resource`, { resource_id: resourceId, notes })
export const removeSetlistItem = (setlistId: string, itemId: string) => api.post(`/resources/setlists/${setlistId}/remove-item`, { item_id: itemId })
export const reorderSetlist = (setlistId: string, itemIds: string[]) => api.post(`/resources/setlists/${setlistId}/reorder`, { item_ids: itemIds })

// Setlist Comments & Approvals
export const addSetlistComment = (setlistId: string, text: string, isApproval?: boolean) => api.post(`/resources/setlists/${setlistId}/comment`, { text, is_approval: isApproval || false })
export const approveSetlist = (setlistId: string, text?: string) => api.post(`/resources/setlists/${setlistId}/approve`, { text })
export const revokeSetlistApproval = (setlistId: string) => api.post(`/resources/setlists/${setlistId}/revoke-approval`)
