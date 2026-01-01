'use client'

import { useState, useEffect } from 'react'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

interface FeatureFlag {
  id: number
  key: string
  name: string
  description: string
  flag_type: 'boolean' | 'string' | 'number' | 'json'
  value: any
  is_active: boolean
  scope: 'global' | 'studio' | 'user' | 'role'
  rollout_percentage: number
  created_at: string
  updated_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { refresh } = useFeatureFlags()

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/feature-flags/flags/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to fetch flags')

      const data = await res.json()
      setFlags(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = async (id: number, currentState: boolean) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/feature-flags/flags/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentState })
      })

      if (!res.ok) throw new Error('Failed to update flag')

      await fetchFlags()
      await refresh()
    } catch (err) {
      alert('Failed to toggle flag')
    }
  }

  const deleteFlag = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/feature-flags/flags/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to delete flag')

      await fetchFlags()
      await refresh()
    } catch (err) {
      alert('Failed to delete flag')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600 mt-1">Manage feature flags and rollouts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Flag
        </button>
      </div>

      {flags.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No feature flags found. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rollout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{flag.name}</div>
                      <div className="text-xs font-mono text-gray-500">{flag.key}</div>
                      {flag.description && (
                        <div className="text-xs text-gray-600 mt-1">{flag.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {flag.flag_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {typeof flag.value === 'object' ? JSON.stringify(flag.value) : String(flag.value)}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {flag.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flag.rollout_percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFlag(flag.id, flag.is_active)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        flag.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {flag.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteFlag(flag.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateFlagModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchFlags()
            refresh()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function CreateFlagModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    flag_type: 'boolean' as 'boolean' | 'string' | 'number' | 'json',
    value: 'false',
    scope: 'global' as 'global' | 'studio' | 'user' | 'role',
    rollout_percentage: 100,
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Not authenticated')
      setSubmitting(false)
      return
    }

    try {
      // Parse value based on type
      let parsedValue: any = formData.value
      if (formData.flag_type === 'boolean') {
        parsedValue = formData.value === 'true'
      } else if (formData.flag_type === 'number') {
        parsedValue = parseFloat(formData.value)
      } else if (formData.flag_type === 'json') {
        parsedValue = JSON.parse(formData.value)
      }

      const res = await fetch(`${API_URL}/feature-flags/flags/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          value: parsedValue
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Failed to create flag')
      }

      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create flag')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create Feature Flag</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="stripe_payments"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Stripe Payments"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enable Stripe payment processing"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.flag_type}
                onChange={(e) => setFormData({
                  ...formData,
                  flag_type: e.target.value as any,
                  value: e.target.value === 'boolean' ? 'false' : ''
                })}
              >
                <option value="boolean">Boolean</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
              >
                <option value="global">Global</option>
                <option value="studio">Studio</option>
                <option value="user">User</option>
                <option value="role">Role</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
            {formData.flag_type === 'boolean' ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.flag_type === 'json' ? '{"key": "value"}' : 'Value'}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rollout Percentage: {formData.rollout_percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              className="w-full"
              value={formData.rollout_percentage}
              onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active immediately
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {submitting ? 'Creating...' : 'Create Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
