'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
  Users,
  Calendar,
  DollarSign,
  Library,
  MessageCircle,
  Settings,
  LogOut,
  GraduationCap,
  FileText,
  BarChart,
  Music
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: any
  action: () => void
  keywords?: string[]
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigate = useCallback((path: string) => {
    setOpen(false)
    router.push(path)
    setSearch('')
  }, [router])

  const commands: CommandItem[] = [
    // Dashboard
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View your dashboard',
      icon: Home,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'overview']
    },

    // Students
    {
      id: 'students',
      title: 'Students',
      subtitle: 'Manage students',
      icon: GraduationCap,
      action: () => navigate('/dashboard/students'),
      keywords: ['pupils', 'learners']
    },
    {
      id: 'add-student',
      title: 'Add New Student',
      subtitle: 'Create a new student profile',
      icon: Users,
      action: () => navigate('/dashboard/students?action=new'),
      keywords: ['create', 'new', 'register']
    },

    // Teachers
    {
      id: 'teachers',
      title: 'Teachers',
      subtitle: 'Manage instructors',
      icon: Users,
      action: () => navigate('/dashboard/teachers'),
      keywords: ['instructors', 'staff']
    },

    // Schedule
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'View calendar and lessons',
      icon: Calendar,
      action: () => navigate('/dashboard/schedule'),
      keywords: ['calendar', 'timetable', 'appointments']
    },
    {
      id: 'lessons',
      title: 'Lessons',
      subtitle: 'Manage lessons',
      icon: Music,
      action: () => navigate('/dashboard/lessons'),
      keywords: ['classes', 'sessions']
    },

    // Billing
    {
      id: 'billing',
      title: 'Billing',
      subtitle: 'Invoices and payments',
      icon: DollarSign,
      action: () => navigate('/dashboard/billing'),
      keywords: ['invoices', 'payments', 'money', 'finance']
    },

    // Resources
    {
      id: 'resources',
      title: 'Resources',
      subtitle: 'Files and materials',
      icon: Library,
      action: () => navigate('/dashboard/resources'),
      keywords: ['files', 'documents', 'materials', 'library']
    },

    // Inventory
    {
      id: 'inventory',
      title: 'Inventory',
      subtitle: 'Equipment and instruments',
      icon: FileText,
      action: () => navigate('/dashboard/inventory'),
      keywords: ['equipment', 'instruments', 'items']
    },

    // Messages
    {
      id: 'messages',
      title: 'Messages',
      subtitle: 'Communications',
      icon: MessageCircle,
      action: () => navigate('/dashboard/messages'),
      keywords: ['chat', 'communications', 'inbox']
    },

    // Reports
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Analytics and insights',
      icon: BarChart,
      action: () => navigate('/dashboard/reports'),
      keywords: ['analytics', 'stats', 'insights', 'data']
    },

    // Settings
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Account preferences',
      icon: Settings,
      action: () => navigate('/dashboard/settings'),
      keywords: ['preferences', 'config', 'configuration']
    },

    // Logout
    {
      id: 'logout',
      title: 'Log Out',
      subtitle: 'Sign out of your account',
      icon: LogOut,
      action: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/login')
      },
      keywords: ['sign out', 'exit']
    }
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
            >
              <Command
                className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
                shouldFilter={true}
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-gray-200 px-4">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent border-none outline-none py-4 text-gray-900 placeholder:text-gray-400 text-sm"
                    autoFocus
                  />
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="py-12 text-center text-sm text-gray-500">
                    No results found.
                  </Command.Empty>

                  {/* Navigation Section */}
                  <Command.Group heading="Navigation" className="text-xs font-semibold text-gray-500 px-2 py-2">
                    {commands.filter(cmd => ['dashboard', 'students', 'teachers', 'schedule', 'lessons'].includes(cmd.id)).map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.subtitle} ${item.keywords?.join(' ')}`}
                        onSelect={() => item.action()}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-gray-700 hover:bg-purple-50 hover:text-purple-700 aria-selected:bg-purple-50 aria-selected:text-purple-700 transition-colors mb-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {/* Management Section */}
                  <Command.Group heading="Management" className="text-xs font-semibold text-gray-500 px-2 py-2 mt-2">
                    {commands.filter(cmd => ['billing', 'resources', 'inventory', 'messages'].includes(cmd.id)).map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.subtitle} ${item.keywords?.join(' ')}`}
                        onSelect={() => item.action()}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-gray-700 hover:bg-purple-50 hover:text-purple-700 aria-selected:bg-purple-50 aria-selected:text-purple-700 transition-colors mb-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {/* Actions Section */}
                  <Command.Group heading="Actions" className="text-xs font-semibold text-gray-500 px-2 py-2 mt-2">
                    {commands.filter(cmd => ['add-student', 'reports', 'settings', 'logout'].includes(cmd.id)).map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.subtitle} ${item.keywords?.join(' ')}`}
                        onSelect={() => item.action()}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-gray-700 hover:bg-purple-50 hover:text-purple-700 aria-selected:bg-purple-50 aria-selected:text-purple-700 transition-colors mb-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">↑↓</kbd>
                        <span>Navigate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">↵</kbd>
                        <span>Select</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd>
                        <span>Close</span>
                      </div>
                    </div>
                    <div className="hidden sm:block">Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">⌘K</kbd> to toggle</div>
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
