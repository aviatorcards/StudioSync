'use client'

import { useState, useRef } from 'react'
import { User, Building2, Bell, Palette, Mail, Camera, Wand2, Check, Server, Eye, EyeOff, Save, Loader2 } from 'lucide-react'
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

    // Studio settings
    const [studioSettings, setStudioSettings] = useState({
        studio_name: '',
        studio_address: '',
        default_lesson_duration: '60',
        cancellation_notice: '24',
        studio_description: ''
    })

    // Initialize studio settings from user profile
    useState(() => {
        if (currentUser?.studio) {
            const s = currentUser.studio
            setStudioSettings({
                studio_name: s.name || '',
                studio_address: s.address_line1 || '',
                default_lesson_duration: s.settings?.default_lesson_duration?.toString() || '60',
                cancellation_notice: s.settings?.cancellation_notice_period?.toString() || '24',
                studio_description: s.settings?.studio_description || ''
            })
        }
    }, [currentUser])

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
        { id: 'technical', label: 'Technical', icon: Server, roles: ['admin'] },
    ]

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setCropImage(reader.result as string)
        })
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setCropImage(null)
        setLoading(true)

        const uploadData = new FormData()
        uploadData.append('avatar', croppedImageBlob, 'avatar.jpg')

        try {
            const response = await api.patch('/core/users/me/', uploadData)
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
            const response = await fetch(autoAvatarUrl)
            const blob = await response.blob()

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
            if (settingsType === 'Studio') {
                // Fetch current studio to get latest settings for merging
                const currentStudioRes = await api.get('/core/studios/current/')
                const currentStudio = currentStudioRes.data
                const currentSettings = currentStudio.settings || {}

                // Prepare update payload
                const updatePayload = {
                    name: settings.studio_name,
                    address_line1: settings.studio_address,
                    settings: {
                        ...currentSettings,
                        default_lesson_duration: parseInt(settings.default_lesson_duration),
                        cancellation_notice_period: parseInt(settings.cancellation_notice),
                        studio_description: settings.studio_description
                    }
                }

                const response = await api.patch('/core/studios/current/', updatePayload)
                
                // Update local user context if needed (though usually we'd refresh the whole user)
                // For now, assume the toast suggests success
                toast.success('Studio settings saved successfully')
                
                // Refresh user to get updated studio embedded data
                const userRes = await api.get('/core/users/me/')
                setCurrentUser(userRes.data)

            } else {
                // Handle User Preferences (Appearance, Communication, Notifications)
                const updatedPreferences = {
                    ...currentUser?.preferences,
                    [settingsType.toLowerCase()]: settings
                }

                const response = await api.patch('/core/users/me/', {
                    preferences: updatedPreferences
                })

                setCurrentUser(response.data)
                toast.success(`${settingsType} settings saved successfully`)

                if (settingsType.toLowerCase() === 'appearance') {
                    setTimeout(() => {
                        window.location.reload()
                    }, 500)
                }
            }
        } catch (error) {
            console.error(`Failed to save ${settingsType} settings:`, error)
            toast.error(`Failed to save ${settingsType} settings`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="pt-4 space-y-2">
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 font-medium max-w-lg">Manage your account and preferences.</p>
            </header>

            {/* Mobile Tab Selector */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    {tabs.map((tab) => {
                        if (tab.roles && !tab.roles.includes(currentUser?.role as any)) return null
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:w-64 shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-6 shadow-sm">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                if (tab.roles && !tab.roles.includes(currentUser?.role as any)) return null
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === tab.id
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
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
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Profile Settings</h2>

                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                        {currentUser?.avatar ? (
                                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                                                {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-sm">Profile Picture</h3>
                                    <p className="text-xs text-gray-500 mb-2">PNG, JPG up to 5MB</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-primary hover:text-primary-hover font-medium"
                                        >
                                            Upload
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={handleAutoSelectAvatar}
                                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                        >
                                            <Wand2 className="w-3 h-3" /> Auto
                                        </button>
                                        {currentUser?.avatar && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={handleRemoveAvatar}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea
                                        rows={3}
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Instrument</label>
                                    <input
                                        type="text"
                                        value={formData.instrument}
                                        onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                                        placeholder="e.g. Piano, Violin, Voice"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used for personalization</p>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !hasChanges()}
                                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${!hasChanges()
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary-hover'
                                            } disabled:opacity-50`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : justSaved ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    {!hasChanges() && !justSaved && (
                                        <span className="text-xs text-gray-500">No changes to save</span>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Studio Tab */}
                    {activeTab === 'studio' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Studio Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Studio Name</label>
                                    <input
                                        type="text"
                                        value={studioSettings.studio_name}
                                        onChange={e => setStudioSettings({ ...studioSettings, studio_name: e.target.value })}
                                        placeholder="My Music Studio"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={studioSettings.studio_address}
                                        onChange={e => setStudioSettings({ ...studioSettings, studio_address: e.target.value })}
                                        placeholder="123 Music Lane, City, State 12345"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Lesson Duration</label>
                                        <select
                                            value={studioSettings.default_lesson_duration}
                                            onChange={e => setStudioSettings({ ...studioSettings, default_lesson_duration: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                                        placeholder="Tell students about your studio..."
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleSaveSettings('Studio', studioSettings)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Communication Tab */}
                    {activeTab === 'communication' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Email Notifications</h3>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'email_lessons', label: 'Lesson confirmations and changes' },
                                            { key: 'email_messages', label: 'New messages from students/teachers' },
                                            { key: 'email_payments', label: 'Payment receipts and reminders' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="text-sm text-gray-700">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={commSettings[item.key as keyof typeof commSettings] as boolean}
                                                    onChange={e => setCommSettings({ ...commSettings, [item.key]: e.target.checked })}
                                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">SMS Settings</h3>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-3">
                                        <span className="text-sm text-gray-700">Send SMS reminders</span>
                                        <input
                                            type="checkbox"
                                            checked={commSettings.sms_reminders}
                                            onChange={e => setCommSettings({ ...commSettings, sms_reminders: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                                        />
                                    </label>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reminder timing</label>
                                        <select
                                            value={commSettings.reminder_hours}
                                            onChange={e => setCommSettings({ ...commSettings, reminder_hours: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        >
                                            <option value={1}>1 hour before</option>
                                            <option value={3}>3 hours before</option>
                                            <option value={24}>24 hours before</option>
                                            <option value={48}>48 hours before</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Automation</h3>
                                    <label className="flex items-start justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <div className="flex-1 pr-4">
                                            <span className="text-sm text-gray-700 block">Auto-confirm lesson requests</span>
                                            <span className="text-xs text-gray-500">Automatically accept lesson requests from existing students</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={commSettings.auto_confirm_lessons}
                                            onChange={e => setCommSettings({ ...commSettings, auto_confirm_lessons: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5"
                                        />
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleSaveSettings('Communication', commSettings)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['light', 'dark', 'auto'].map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}
                                                className={`p-4 border-2 rounded-lg capitalize transition-all text-sm font-medium ${appearanceSettings.theme === theme
                                                        ? 'border-primary bg-orange-50 text-primary'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                {theme}
                                                {appearanceSettings.theme === theme && <Check className="w-4 h-4 mx-auto mt-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                                    <select
                                        value={appearanceSettings.font_size}
                                        onChange={e => setAppearanceSettings({ ...appearanceSettings, font_size: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Primary Color</label>
                                    <p className="text-xs text-gray-500 mb-4">Choose your preferred accent color for buttons, links, and highlights throughout the dashboard</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { value: 'orange', color: '#F39C12', name: 'Orange' },
                                            { value: 'blue', color: '#3498DB', name: 'Blue' },
                                            { value: 'green', color: '#2ECC71', name: 'Green' },
                                            { value: 'purple', color: '#9B59B6', name: 'Purple' },
                                            { value: 'red', color: '#E74C3C', name: 'Red' },
                                            { value: 'teal', color: '#1ABC9C', name: 'Teal' },
                                            { value: 'indigo', color: '#34495E', name: 'Indigo' },
                                            { value: 'pink', color: '#EC7063', name: 'Pink' }
                                        ].map(scheme => (
                                            <button
                                                key={scheme.value}
                                                type="button"
                                                onClick={() => setAppearanceSettings({ ...appearanceSettings, color_scheme: scheme.value })}
                                                className={`p-3 border-2 rounded-lg transition-all hover:scale-105 ${appearanceSettings.color_scheme === scheme.value
                                                        ? 'border-gray-900 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className="w-12 h-12 rounded-full mx-auto mb-2 shadow-inner border-2 border-white" style={{ backgroundColor: scheme.color }}></div>
                                                <p className="text-xs font-semibold text-gray-900">{scheme.name}</p>
                                                {appearanceSettings.color_scheme === scheme.value && (
                                                    <div className="mt-1">
                                                        <Check className="w-4 h-4 mx-auto text-gray-900" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs text-blue-800">
                                            <strong>Note:</strong> After saving, the page will reload to apply your new color scheme across the entire dashboard.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-start justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <div className="flex-1 pr-4">
                                            <span className="text-sm text-gray-700 block">Compact Mode</span>
                                            <span className="text-xs text-gray-500">Reduce spacing for more content</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={appearanceSettings.compact_mode}
                                            onChange={e => setAppearanceSettings({ ...appearanceSettings, compact_mode: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5"
                                        />
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleSaveSettings('Appearance', appearanceSettings)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Channels</h3>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'push_enabled', label: 'Push notifications', desc: 'In-app notifications' },
                                            { key: 'email_enabled', label: 'Email notifications', desc: 'Receive notifications via email' },
                                            { key: 'sms_enabled', label: 'SMS notifications', desc: 'Text message alerts' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div className="flex-1 pr-4">
                                                    <span className="text-sm text-gray-700 block">{item.label}</span>
                                                    <span className="text-xs text-gray-500">{item.desc}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifSettings[item.key as keyof typeof notifSettings] as boolean}
                                                    onChange={e => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                                                    className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Types</h3>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'lesson_reminders', label: 'Lesson reminders' },
                                            { key: 'payment_alerts', label: 'Payment alerts' },
                                            { key: 'new_messages', label: 'New messages' },
                                            { key: 'student_updates', label: 'Student updates' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="text-sm text-gray-700">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={notifSettings[item.key as keyof typeof notifSettings] as boolean}
                                                    onChange={e => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Quiet Hours</h3>
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-3">
                                        <span className="text-sm text-gray-700">Enable quiet hours</span>
                                        <input
                                            type="checkbox"
                                            checked={notifSettings.quiet_hours_enabled}
                                            onChange={e => setNotifSettings({ ...notifSettings, quiet_hours_enabled: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                                        />
                                    </label>
                                    {notifSettings.quiet_hours_enabled && (
                                        <div className="grid grid-cols-2 gap-4 pl-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Start time</label>
                                                <input
                                                    type="time"
                                                    value={notifSettings.quiet_start}
                                                    onChange={e => setNotifSettings({ ...notifSettings, quiet_start: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">End time</label>
                                                <input
                                                    type="time"
                                                    value={notifSettings.quiet_end}
                                                    onChange={e => setNotifSettings({ ...notifSettings, quiet_end: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleSaveSettings('Notifications', notifSettings)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Technical Settings Tab (Admin Only) */}
                    {activeTab === 'technical' && currentUser?.role === 'admin' && (
                        <div className="max-w-3xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Server & Technical Settings</h2>
                            <div className="space-y-8">
                                {/* SMTP Configuration */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-semibold text-gray-900">SMTP Configuration</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Configure email server for automated emails
                                    </p>
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Host</label>
                                                <input
                                                    type="text"
                                                    value={technicalSettings.smtp_host}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_host: e.target.value })}
                                                    placeholder="smtp.gmail.com"
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Port</label>
                                                <select
                                                    value={technicalSettings.smtp_port}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_port: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                >
                                                    <option value="25">25 (Standard)</option>
                                                    <option value="465">465 (SSL)</option>
                                                    <option value="587">587 (TLS)</option>
                                                    <option value="2525">2525</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Username / Email</label>
                                            <input
                                                type="text"
                                                value={technicalSettings.smtp_username}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_username: e.target.value })}
                                                placeholder="your-email@gmail.com"
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showSmtpPassword ? 'text' : 'password'}
                                                    value={technicalSettings.smtp_password}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-500"
                                                >
                                                    {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">For Gmail, use an App Password</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">From Email</label>
                                                <input
                                                    type="email"
                                                    value={technicalSettings.smtp_from_email}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_from_email: e.target.value })}
                                                    placeholder="noreply@studio.com"
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">From Name</label>
                                                <input
                                                    type="text"
                                                    value={technicalSettings.smtp_from_name}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_from_name: e.target.value })}
                                                    placeholder="My Studio"
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>

                                        <label className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <span className="text-sm text-gray-700">Use TLS / STARTTLS</span>
                                            <input
                                                type="checkbox"
                                                checked={technicalSettings.smtp_use_tls}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, smtp_use_tls: e.target.checked })}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* SMS Configuration */}
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bell className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-semibold text-gray-900">SMS Configuration</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Configure SMS service for text reminders
                                    </p>
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">SMS Provider</label>
                                            <select
                                                value={technicalSettings.sms_provider}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, sms_provider: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            >
                                                <option value="twilio">Twilio</option>
                                                <option value="aws-sns">Amazon SNS</option>
                                                <option value="messagebird">MessageBird</option>
                                                <option value="plivo">Plivo</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Account SID</label>
                                            <input
                                                type="text"
                                                value={technicalSettings.sms_account_sid}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, sms_account_sid: e.target.value })}
                                                placeholder="ACxxxxxxxx"
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Auth Token</label>
                                            <div className="relative">
                                                <input
                                                    type={showSmsApiKey ? 'text' : 'password'}
                                                    value={technicalSettings.sms_auth_token}
                                                    onChange={e => setTechnicalSettings({ ...technicalSettings, sms_auth_token: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                                                    className="absolute right-3 top-2.5 text-gray-500"
                                                >
                                                    {showSmsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">From Number</label>
                                            <input
                                                type="tel"
                                                value={technicalSettings.sms_from_number}
                                                onChange={e => setTechnicalSettings({ ...technicalSettings, sms_from_number: e.target.value })}
                                                placeholder="+1234567890"
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleSaveSettings('Technical', technicalSettings)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Settings
                                            </>
                                        )}
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
