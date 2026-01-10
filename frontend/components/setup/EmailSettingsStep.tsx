import React from 'react'
import { Mail, Server, Shield, Lock, Send, Info } from 'lucide-react'
import { EmailSettings } from '@/types/setup'

interface EmailSettingsStepProps {
  data: EmailSettings
  updateData: (data: Partial<EmailSettings>) => void
  onNext: () => void
  onBack: () => void
}

export default function EmailSettingsStep({ data, updateData, onNext, onBack }: EmailSettingsStepProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    updateData({
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? parseInt(value) : value
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Email Communications</h2>
        <p className="text-gray-500 font-medium max-w-md mx-auto">
          Configure how StudioSync sends welcome emails, reminders, and system notifications.
        </p>
      </div>

      <div className="grid gap-6">
        {/* SMTP Configuration */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">SMTP Server Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">SMTP Host</label>
              <div className="relative">
                <input
                  type="text"
                  name="smtp_host"
                  value={data.smtp_host}
                  onChange={handleChange}
                  placeholder="smtp.gmail.com"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">SMTP Port</label>
              <input
                type="number"
                name="smtp_port"
                value={data.smtp_port}
                onChange={handleChange}
                placeholder="587"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Username / Email</label>
              <div className="relative">
                <input
                  type="text"
                  name="smtp_username"
                  value={data.smtp_username}
                  onChange={handleChange}
                  placeholder="your-email@gmail.com"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password / App Key</label>
              <div className="relative">
                <input
                  type="password"
                  name="smtp_password"
                  value={data.smtp_password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sender Info & Security */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Sender Configuration</h3>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">From Email Address</label>
            <input
              type="email"
              name="smtp_from_email"
              value={data.smtp_from_email}
              onChange={handleChange}
              placeholder="no-reply@yourstudio.com"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight ml-1">This is the email address recipients will see.</p>
          </div>

          <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-white border-2 border-transparent hover:border-primary transition-all">
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${data.smtp_use_tls ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}>
              <Lock className={`w-4 h-4 text-white transition-opacity ${data.smtp_use_tls ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <input
              type="checkbox"
              name="smtp_use_tls"
              checked={data.smtp_use_tls}
              onChange={handleChange}
              className="hidden"
            />
            <div className="flex-1">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest block">Use TLS Encryption</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Recommended for modern SMTP providers.</span>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
          <Info className="w-6 h-6 text-blue-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Why set this up now?</h4>
            <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
              Correct email settings ensure your students receive their <span className="font-bold">Welcome Emails</span> immediately after setup. You can always skip this and configure it later in the Technical Settings.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all border-2 border-transparent"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Proceed
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
