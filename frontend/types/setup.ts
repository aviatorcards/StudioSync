/**
 * Setup Wizard Type Definitions
 *
 * Types for the initial setup wizard flow including:
 * - Setup status tracking
 * - Feature flags configuration
 * - Studio and admin account creation
 * - Quick settings and sample data
 */

export interface SetupStatus {
  is_completed: boolean
  setup_required: boolean
  completed_at?: string
  setup_version?: string
  message?: string
}

export interface FeatureFlags {
  billing_enabled: boolean
  inventory_enabled: boolean
  messaging_enabled: boolean
  resources_enabled: boolean
  goals_enabled: boolean
  bands_enabled: boolean
  analytics_enabled: boolean
  practice_rooms_enabled: boolean
}

export interface StudioInfo {
  studio_name: string
  studio_email: string
  studio_phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  timezone: string
  currency: string
}

export interface AdminAccount {
  admin_email: string
  admin_first_name: string
  admin_last_name: string
  admin_password: string
  admin_phone: string
}

export interface QuickSettings {
  default_lesson_duration: number
  business_start_hour: number
  business_end_hour: number
  
  // Billing
  default_hourly_rate?: number
  tax_rate?: number
  charge_tax_on_lessons?: boolean
  invoice_due_days?: number
  invoice_footer_text?: string

  // Scheduling
  cancellation_notice_period?: number
  enable_online_booking?: boolean

  // Events
  default_event_duration?: number
}

export interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  smtp_from_email: string
  smtp_use_tls: boolean
}

export interface SetupWizardData {
  language: string
  studio_info: StudioInfo
  admin_account: AdminAccount
  features: FeatureFlags
  quick_settings: QuickSettings
  email_settings: EmailSettings
  create_sample_data: boolean
}

/**
 * Default feature flags configuration
 * Recommended features are enabled by default
 */
export const DEFAULT_FEATURES: FeatureFlags = {
  billing_enabled: true,
  inventory_enabled: false,
  messaging_enabled: true,
  resources_enabled: true,
  goals_enabled: true,
  bands_enabled: false,
  analytics_enabled: true,
  practice_rooms_enabled: false,
}

/**
 * Feature descriptions and metadata
 * Used in the feature selection step
 */
export const FEATURE_DESCRIPTIONS = {
  billing_enabled: {
    name: 'Billing & Invoicing',
    description: 'Create invoices, track payments, and manage student accounts',
    icon: 'CreditCard'
  },
  inventory_enabled: {
    name: 'Inventory Management',
    description: 'Track instruments, accessories, and studio equipment',
    icon: 'Package'
  },
  messaging_enabled: {
    name: 'Messaging System',
    description: 'Communicate with students and parents directly in the app',
    icon: 'MessageSquare'
  },
  resources_enabled: {
    name: 'Resource Library',
    description: 'Share sheet music, recordings, and practice materials',
    icon: 'FolderOpen'
  },
  goals_enabled: {
    name: 'Student Goals',
    description: 'Set and track progress toward learning objectives',
    icon: 'Target'
  },
  bands_enabled: {
    name: 'Bands & Ensembles',
    description: 'Manage band rehearsals and group lessons',
    icon: 'Users'
  },
  analytics_enabled: {
    name: 'Analytics & Reports',
    description: 'View insights on attendance, revenue, and student progress',
    icon: 'BarChart'
  },
  practice_rooms_enabled: {
    name: 'Practice Rooms',
    description: 'Allow students to book practice rooms online',
    icon: 'Calendar'
  }
} as const

/**
 * Timezone options for studio configuration
 */
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
] as const

/**
 * Currency options for studio configuration
 */
export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD - Canadian Dollar ($)', symbol: '$' },
  { value: 'AUD', label: 'AUD - Australian Dollar ($)', symbol: '$' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)', symbol: '¥' },
] as const

/**
 * Language options for wizard
 */
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
] as const
