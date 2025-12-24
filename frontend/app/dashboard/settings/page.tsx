'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Building2, Bell, Palette, Mail, Camera, Wand2, Check, Server, Eye, EyeOff } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import ImageCropper from '@/components/ImageCropper'

export default function SettingsPage() {
    const { currentUser, setCurrentUser } = useUser()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [justSaved, setJustSaved] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showSmtpPassword, setShowSmtpPassword] = useState(false)
    const [showSmsApiKey, setShowSmsApiKey] = useState(false)
    const [cropImage, setCropImage] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        first_name: currentUser?.first_name || '',
        last_name: currentUser?.last_name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        bio: currentUser?.bio || '',
        instrument: currentUser?.instrument || ''
    })

    // Track original values to detect changes
    const [originalFormData, setOriginalFormData] = useState({
        first_name: currentUser?.first_name || '',
        last_name: currentUser?.last_name || '',
        phone: currentUser?.phone || '',
        bio: currentUser?.bio || '',
        instrument: currentUser?.instrument || ''
    })

    // Check if form has changed
    const hasChanges = () => {
        return formData.first_name !== originalFormData.first_name ||
            formData.last_name !== originalFormData.last_name ||
            formData.phone !== originalFormData.phone ||
            formData.bio !== originalFormData.bio ||
            formData.instrument !== originalFormData.instrument
    }

    // Communication settings
    const [commSettings, setCommSettings] = useState({
        email_lessons: currentUser?.preferences?.communication?.email_lessons ?? true,
        email_messages: currentUser?.preferences?.communication?.email_messages ?? true,
        email_payments: currentUser?.preferences?.communication?.email_payments ?? true,
        sms_reminders: currentUser?.preferences?.communication?.sms_reminders ?? true,
        reminder_hours: currentUser?.preferences?.communication?.reminder_hours ?? 24,
        auto_confirm_lessons: currentUser?.preferences?.communication?.auto_confirm_lessons ?? false
    })

    // Notification settings
    const [notifSettings, setNotifSettings] = useState({
        push_enabled: currentUser?.preferences?.notifications?.push_enabled ?? true,
        email_enabled: currentUser?.preferences?.notifications?.email_enabled ?? true,
        sms_enabled: currentUser?.preferences?.notifications?.sms_enabled ?? false,
        lesson_reminders: currentUser?.preferences?.notifications?.lesson_reminders ?? true,
        payment_alerts: currentUser?.preferences?.notifications?.payment_alerts ?? true,
        new_messages: currentUser?.preferences?.notifications?.new_messages ?? true,
        student_updates: currentUser?.preferences?.notifications?.student_updates ?? true,
        quiet_hours_enabled: currentUser?.preferences?.notifications?.quiet_hours_enabled ?? false,
        quiet_start: currentUser?.preferences?.notifications?.quiet_start ?? '22:00',
        quiet_end: currentUser?.preferences?.notifications?.quiet_end ?? '08:00'
    })

    // Appearance settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: currentUser?.preferences?.appearance?.theme ?? 'light',
        compact_mode: currentUser?.preferences?.appearance?.compact_mode ?? false,
        font_size: currentUser?.preferences?.appearance?.font_size ?? 'medium',
        color_scheme: currentUser?.preferences?.appearance?.color_scheme ?? 'default'
    })

    // Studio settings (these could also go in preferences or Studio model)
    const [studioSettings, setStudioSettings] = useState({
        studio_name: currentUser?.preferences?.studio?.studio_name ?? '',
        studio_address: currentUser?.preferences?.studio?.studio_address ?? '',
        default_lesson_duration: currentUser?.preferences?.studio?.default_lesson_duration ?? '60',
        cancellation_notice: currentUser?.preferences?.studio?.cancellation_notice ?? '24',
        studio_description: currentUser?.preferences?.studio?.studio_description ?? ''
    })

    // Technical settings (SMTP/SMS) - Admin only
    const [technicalSettings, setTechnicalSettings] = useState({
        smtp_host: currentUser?.preferences?.technical?.smtp_host ?? '',
        smtp_port: currentUser?.preferences?.technical?.smtp_port ?? '587',
        smtp_username: currentUser?.preferences?.technical?.smtp_username ?? '',
        smtp_password: currentUser?.preferences?.technical?.smtp_password ?? '',
        smtp_from_email: currentUser?.preferences?.technical?.smtp_from_email ?? '',
        smtp_from_name: currentUser?.preferences?.technical?.smtp_from_name ?? 'StudioSync',
        smtp_use_tls: currentUser?.preferences?.technical?.smtp_use_tls ?? true,
        sms_provider: currentUser?.preferences?.technical?.sms_provider ?? 'twilio',
        sms_account_sid: currentUser?.preferences?.technical?.sms_account_sid ?? '',
        sms_auth_token: currentUser?.preferences?.technical?.sms_auth_token ?? '',
        sms_from_number: currentUser?.preferences?.technical?.sms_from_number ?? ''
    })

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'studio', label: 'Studio', icon: Building2 },
        { id: 'communication', label: 'Communication', icon: Mail },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'technical', label: 'Server & Technical', icon: Server, roles: ['admin'] },
    ]

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Read file as data URL to show in cropper
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setCropImage(reader.result as string)
        })
        reader.readAsDataURL(file)

        // Reset input value so same file can be selected again
        e.target.value = ''
    }

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setCropImage(null) // Close cropper
        setLoading(true)

        console.log('Avatar upload started with cropped image', croppedImageBlob.size)

        const uploadData = new FormData()
        uploadData.append('avatar', croppedImageBlob, 'avatar.jpg')

        try {
            const response = await api.patch('/core/users/me/', uploadData)
            console.log('Avatar upload successful:', response.data)
            setCurrentUser(response.data)
            toast.success('Avatar updated successfully!')
        } catch (error: any) {
            console.error('Avatar upload failed:', error)
            const errorMessage = error.response?.data?.avatar?.[0] ||
                error.response?.data?.detail ||
                'Failed to upload avatar'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        setLoading(true)
        try {
            await api.post('/core/users/remove_avatar/')
            // Refresh current user data
            const meResponse = await api.get('/core/users/me/')
            setCurrentUser(meResponse.data)
            toast.success('Avatar removed successfully')
        } catch (error) {
            console.error('Failed to remove avatar:', error)
            toast.error('Failed to remove avatar')
        } finally {
            setLoading(false)
        }
    }

    const handleAutoSelectAvatar = async () => {
        const instrument = formData.instrument || 'Music'
        const color = instrument.toLowerCase().includes('piano') ? '000000' :
            instrument.toLowerCase().includes('guitar') ? '8B4513' : 'F39C12'

        const autoAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.first_name)}+${encodeURIComponent(formData.last_name)}&background=${color}&color=fff&size=256`

        setLoading(true)
        try {
            // Fetch the generated avatar image
            const response = await fetch(autoAvatarUrl)
            const blob = await response.blob()

            // Use same upload flow as manual avatar
            const uploadData = new FormData()
            uploadData.append('avatar', blob, 'avatar.png')

            const apiResponse = await api.patch('/core/users/me/', uploadData)
            setCurrentUser(apiResponse.data)
            toast.success(`Avatar set for ${instrument} player!`)
        } catch (error) {
            console.error('Auto-select failed:', error)
            toast.error('Failed to set avatar automatically')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setJustSaved(false)
        try {
            const response = await api.patch('/core/users/me/', formData)
            setCurrentUser(response.data)
            setOriginalFormData({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                phone: response.data.phone,
                bio: response.data.bio,
                instrument: response.data.instrument
            })
            toast.success('Profile updated')
            setJustSaved(true)
            setTimeout(() => setJustSaved(false), 3000)
        } catch (error) {
            console.error(error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSettings = async (settingsType: string, settings: any) => {
        setLoading(true)
        try {
            // Merge new settings into existing preferences
            const updatedPreferences = {
                ...currentUser?.preferences,
                [settingsType.toLowerCase()]: settings
            }

            const response = await api.patch('/core/users/me/', {
                preferences: updatedPreferences
            })

            setCurrentUser(response.data)
            toast.success(`${settingsType} settings saved successfully`)

            // Reload page to apply appearance changes
            if (settingsType.toLowerCase() === 'appearance') {
                setTimeout(() => {
                    window.location.reload()
                }, 500)
            }
        } catch (error) {
            console.error(`Failed to save ${settingsType} settings:`, error)
            toast.error(`Failed to save ${settingsType} settings`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
                <p className="text-lg text-gray-500 mt-2 font-medium">Manage your account and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                {/* Sidebar */}
                <div className="lg:w-72 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 h-fit lg:sticky lg:top-6">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Navigation</h2>
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            // Check if tab is role-restricted
                            if (tab.roles && !tab.roles.includes(currentUser?.role as any)) return null

                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-[#F39C12] text-white shadow-lg scale-105'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Image Cropper Modal */}
                {cropImage && (
                    <ImageCropper
                        imageSrc={cropImage}
                        onCropComplete={handleCropComplete}
                        onCancel={() => setCropImage(null)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 lg:p-10">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>

                            {/* Avatar Section */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                        {currentUser?.avatar ? (
                                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold bg-gray-100">
                                                {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-1.5 bg-white border rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Profile Picture</h3>
                                    <p className="text-sm text-gray-500 mb-2">PNG, JPG up to 5MB</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-sm text-[#F39C12] font-medium hover:text-[#E67E22]"
                                        >
                                            Upload Image
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={handleAutoSelectAvatar}
                                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                        >
                                            <Wand2 className="w-3 h-3" /> Auto-select
                                        </button>
                                        {currentUser?.avatar && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={handleRemoveAvatar}
                                                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea
                                        rows={4}
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Instrument</label>
                                    <input
                                        type="text"
                                        value={formData.instrument}
                                        onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                                        placeholder="e.g. Piano, Violin, Voice"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used to personalize your experience and avatar recommendations.</p>
                                </div>

                                <div className="pt-4 border-t flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !hasChanges()}
                                        className={`px-6 py-2.5 rounded-lg transition-all ${!hasChanges()
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#F39C12] text-white hover:bg-[#E67E22]'
                                            } disabled:opacity-50`}
                                    >
                                        {loading ? 'Saving...' : justSaved ? '✓ Saved!' : 'Save Changes'}
                                    </button>
                                    {justSaved && (
                                        <span className="text-sm text-green-600 animate-fade-in">
                                            Changes saved successfully!
                                        </span>
                                    )}
                                    {!hasChanges() && !justSaved && (
                                        <span className="text-xs text-gray-500">
                                            No changes to save
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Studio Tab */}
                    {activeTab === 'studio' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Studio Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Studio Name</label>
                                    <input
                                        type="text"
                                        value={studioSettings.studio_name}
                                        onChange={e => setStudioSettings({ ...studioSettings, studio_name: e.target.value })}
                                        placeholder="My Music Studio"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={studioSettings.studio_address}
                                        onChange={e => setStudioSettings({ ...studioSettings, studio_address: e.target.value })}
                                        placeholder="123 Music Lane, City, State 12345"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Lesson Duration</label>
                                        <select
                                            value={studioSettings.default_lesson_duration}
                                            onChange={e => setStudioSettings({ ...studioSettings, default_lesson_duration: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        >
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                            <option value="90">90 minutes</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Notice</label>
                                        <select
                                            value={studioSettings.cancellation_notice}
                                            onChange={e => setStudioSettings({ ...studioSettings, cancellation_notice: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        >
                                            <option value="12">12 hours</option>
                                            <option value="24">24 hours</option>
                                            <option value="48">48 hours</option>
                                            <option value="168">1 week</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Studio Description</label>
                                    <textarea
                                        rows={4}
                                        value={studioSettings.studio_description}
                                        onChange={e => setStudioSettings({ ...studioSettings, studio_description: e.target.value })}
                                        placeholder="Tell students about your studio, teaching philosophy, and what makes your lessons special..."
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        onClick={() => handleSaveSettings('Studio', studioSettings)}
                                        className="px-6 py-2.5 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Communication Tab */}
                    {activeTab === 'communication' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Communication Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Email Notifications</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'email_lessons', label: 'Lesson confirmations and changes' },
                                            { key: 'email_messages', label: 'New messages from students/teachers' },
                                            { key: 'email_payments', label: 'Payment receipts and reminders' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm text-gray-700">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={commSettings[item.key as keyof typeof commSettings] as boolean}
                                                    onChange={e => setCommSettings({ ...commSettings, [item.key]: e.target.checked })}
                                                    className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">SMS Settings</h3>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                                        <span className="text-sm text-gray-700">Send SMS reminders</span>
                                        <input
                                            type="checkbox"
                                            checked={commSettings.sms_reminders}
                                            onChange={e => setCommSettings({ ...commSettings, sms_reminders: e.target.checked })}
                                            className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                        />
                                    </label>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reminder timing</label>
                                        <select
                                            value={commSettings.reminder_hours}
                                            onChange={e => setCommSettings({ ...commSettings, reminder_hours: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        >
                                            <option value={1}>1 hour before</option>
                                            <option value={3}>3 hours before</option>
                                            <option value={24}>24 hours before</option>
                                            <option value={48}>48 hours before</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Automation</h3>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="text-sm text-gray-700 block">Auto-confirm lesson requests</span>
                                            <span className="text-xs text-gray-500">Automatically accept lesson requests from existing students</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={commSettings.auto_confirm_lessons}
                                            onChange={e => setCommSettings({ ...commSettings, auto_confirm_lessons: e.target.checked })}
                                            className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                        />
                                    </label>
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        onClick={() => handleSaveSettings('Communication', commSettings)}
                                        className="px-6 py-2.5 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appearance Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['light', 'dark', 'auto'].map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}
                                                className={`p-4 border-2 rounded-lg capitalize transition-all ${appearanceSettings.theme === theme
                                                    ? 'border-[#F39C12] bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {theme}
                                                {appearanceSettings.theme === theme && <Check className="w-4 h-4 text-[#F39C12] mx-auto mt-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                                    <select
                                        value={appearanceSettings.font_size}
                                        onChange={e => setAppearanceSettings({ ...appearanceSettings, font_size: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { value: 'default', color: '#F39C12' },
                                            { value: 'blue', color: '#3498DB' },
                                            { value: 'green', color: '#27AE60' },
                                            { value: 'purple', color: '#9B59B6' }
                                        ].map(scheme => (
                                            <button
                                                key={scheme.value}
                                                onClick={() => setAppearanceSettings({ ...appearanceSettings, color_scheme: scheme.value })}
                                                className={`p-4 border-2 rounded-lg transition-all ${appearanceSettings.color_scheme === scheme.value
                                                    ? 'border-gray-900'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="w-8 h-8 rounded-full mx-auto" style={{ backgroundColor: scheme.color }}></div>
                                                {appearanceSettings.color_scheme === scheme.value && <Check className="w-4 h-4 mx-auto mt-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="text-sm text-gray-700 block">Compact Mode</span>
                                            <span className="text-xs text-gray-500">Reduce spacing for more content</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={appearanceSettings.compact_mode}
                                            onChange={e => setAppearanceSettings({ ...appearanceSettings, compact_mode: e.target.checked })}
                                            className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                        />
                                    </label>
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        onClick={() => handleSaveSettings('Appearance', appearanceSettings)}
                                        className="px-6 py-2.5 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Notification Channels</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'push_enabled', label: 'Push notifications', desc: 'In-app notifications' },
                                            { key: 'email_enabled', label: 'Email notifications', desc: 'Receive notifications via email' },
                                            { key: 'sms_enabled', label: 'SMS notifications', desc: 'Text message alerts (charges may apply)' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className="text-sm text-gray-700 block">{item.label}</span>
                                                    <span className="text-xs text-gray-500">{item.desc}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifSettings[item.key as keyof typeof notifSettings] as boolean}
                                                    onChange={e => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                                                    className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Notification Types</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'lesson_reminders', label: 'Lesson reminders' },
                                            { key: 'payment_alerts', label: 'Payment alerts' },
                                            { key: 'new_messages', label: 'New messages' },
                                            { key: 'student_updates', label: 'Student updates' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm text-gray-700">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={notifSettings[item.key as keyof typeof notifSettings] as boolean}
                                                    onChange={e => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                                                    className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Quiet Hours</h3>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                                        <span className="text-sm text-gray-700">Enable quiet hours</span>
                                        <input
                                            type="checkbox"
                                            checked={notifSettings.quiet_hours_enabled}
                                            onChange={e => setNotifSettings({ ...notifSettings, quiet_hours_enabled: e.target.checked })}
                                            className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                        />
                                    </label>
                                    {notifSettings.quiet_hours_enabled && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                                                <input
                                                    type="time"
                                                    value={notifSettings.quiet_start}
                                                    onChange={e => setNotifSettings({ ...notifSettings, quiet_start: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                                                <input
                                                    type="time"
                                                    value={notifSettings.quiet_end}
                                                    onChange={e => setNotifSettings({ ...notifSettings, quiet_end: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        onClick={() => handleSaveSettings('Notifications', notifSettings)}
                                        className="px-6 py-2.5 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Technical Settings Tab (Admin Only) */}
                    {activeTab === 'technical' && currentUser?.role === 'admin' && (
                        <div className="max-w-3xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Server & Technical Settings</h2>
                            <div className="space-y-8">
                                {/* SMTP Configuration */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-medium text-gray-900 text-lg">SMTP Configuration</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Configure your email server settings for sending automated emails (lesson reminders, receipts, etc.)
                                    </p>
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                                                <input
                                                    type="text"
                                                    value={technicalSettings.smtp_host}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_host: e.target.value })}
                                                    placeholder="smtp.gmail.com"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                                                <select
                                                    value={technicalSettings.smtp_port}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_port: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                >
                                                    <option value="25">25 (Standard)</option>
                                                    <option value="465">465 (SSL)</option>
                                                    <option value="587">587 (TLS - Recommended)</option>
                                                    <option value="2525">2525 (Alternative)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label>
                                            <input
                                                type="text"
                                                value={technicalSettings.smtp_username}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_username: e.target.value })}
                                                placeholder="your-email@gmail.com"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password / App Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showSmtpPassword ? 'text' : 'password'}
                                                    value={technicalSettings.smtp_password}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">For Gmail, use an App Password instead of your regular password</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                                                <input
                                                    type="email"
                                                    value={technicalSettings.smtp_from_email}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_from_email: e.target.value })}
                                                    placeholder="noreply@yourstudio.com"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                                                <input
                                                    type="text"
                                                    value={technicalSettings.smtp_from_name}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_from_name: e.target.value })}
                                                    placeholder="My Music Studio"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                            </div>
                                        </div>

                                        <label className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <div>
                                                <span className="text-sm text-gray-700 block">Use TLS / STARTTLS</span>
                                                <span className="text-xs text-gray-500">Recommended for security</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={technicalSettings.smtp_use_tls}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_use_tls: e.target.checked })}
                                                className="w-4 h-4 text-[#F39C12] focus:ring-[#F39C12]"
                                            />
                                        </label>

                                        <button
                                            onClick={async () => {
                                                setLoading(true)
                                                try {
                                                    const response = await api.post('/core/users/send_test_email/', technicalSettings)
                                                    toast.success(response.data.detail || 'Test email sent successfully')
                                                } catch (error: any) {
                                                    console.error('Test email failed:', error)
                                                    toast.error(error.response?.data?.detail || 'Failed to send test email')
                                                } finally {
                                                    setLoading(false)
                                                }
                                            }}
                                            disabled={loading}
                                            className="text-sm text-[#F39C12] font-medium hover:text-[#E67E22] disabled:opacity-50"
                                        >
                                            {loading ? 'Sending...' : 'Send Test Email'}
                                        </button>
                                    </div>
                                </div>

                                {/* SMS Configuration */}
                                <div className="pt-6 border-t">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bell className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-medium text-gray-900 text-lg">SMS Configuration</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Configure SMS service for sending text reminders. We recommend Twilio for reliability.
                                    </p>
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Provider</label>
                                            <select
                                                value={technicalSettings.sms_provider}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, sms_provider: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                            >
                                                <option value="twilio">Twilio (Recommended)</option>
                                                <option value="aws-sns">Amazon SNS</option>
                                                <option value="messagebird">MessageBird</option>
                                                <option value="plivo">Plivo</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                <a href="https://www.twilio.com/try-twilio" target="_blank" className="text-[#F39C12] hover:underline">
                                                    Sign up for Twilio
                                                </a> - Get $15 free credit to start
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Account SID / Account ID</label>
                                            <input
                                                type="text"
                                                value={technicalSettings.sms_account_sid}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, sms_account_sid: e.target.value })}
                                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Auth Token / API Key</label>
                                            <div className="relative">
                                                <input
                                                    type={showSmsApiKey ? 'text' : 'password'}
                                                    value={technicalSettings.sms_auth_token}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, sms_auth_token: e.target.value })}
                                                    placeholder="••••••••••••••••••••••••••••••••"
                                                    className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                                                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showSmsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">From Number</label>
                                            <input
                                                type="tel"
                                                value={technicalSettings.sms_from_number}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, sms_from_number: e.target.value })}
                                                placeholder="+1234567890"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Purchase a phone number from your SMS provider</p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <h4 className="text-sm font-medium text-blue-900 mb-1">💡 SMS Best Practices</h4>
                                            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                                <li>Always get explicit consent before sending SMS</li>
                                                <li>Provide an opt-out mechanism in every message</li>
                                                <li>Be aware of costs - typically $0.0075 per message</li>
                                                <li>Test your messages to ensure they&apos;re under 160 characters</li>
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => toast.success('Send test SMS functionality will be added with backend integration')}
                                            className="text-sm text-[#F39C12] font-medium hover:text-[#E67E22]"
                                        >
                                            Send Test SMS
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        onClick={() => handleSaveSettings('Technical', technicalSettings)}
                                        className="px-6 py-2.5 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors"
                                    >
                                        Save Technical Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

