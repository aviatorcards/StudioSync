'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Plus, Music, Loader2, Search, Calendar, MapPin, DollarSign, X,
    Loader, ChevronLeft, ChevronRight, CheckCircle2, Clock, Users,
    Check, ThumbsUp, ThumbsDown, CreditCard, Star, AlertCircle,
    Music2,
} from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/UserContext'

// ─── Types ────────────────────────────────────────────────────────────────────
interface GigClaim {
    id: string
    gig: string
    band: string
    band_name: string
    status: 'pending' | 'approved' | 'declined'
    notes: string
    created_at: string
}

interface Gig {
    id: string
    title: string
    description: string
    venue: string
    scheduled_start: string
    scheduled_end: string
    band: string | null
    band_name: string | null
    status: 'open' | 'pending_approval' | 'assigned' | 'completed' | 'cancelled'
    pay_rate: string
    pay_type: 'flat' | 'hourly'
    claims: GigClaim[]
}

interface Band {
    id: string
    name: string
    genre: string
}

interface BandAvailability {
    id: string
    band: string
    band_name: string
    month: string
    availability_data: { available_days: number[]; notes?: string }
    is_submitted: boolean
    submitted_at: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
    open: 'Open',
    pending_approval: 'Pending Approval',
    assigned: 'Assigned',
    completed: 'Completed',
    cancelled: 'Cancelled',
}
const STATUS_COLOR: Record<string, string> = {
    open: 'bg-emerald-50 text-emerald-700',
    pending_approval: 'bg-amber-50 text-amber-700',
    assigned: 'bg-blue-50 text-blue-700',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-50 text-red-600',
}

function fmt(dt: string) {
    return new Date(dt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function gigHours(gig: Gig) {
    const h = (new Date(gig.scheduled_end).getTime() - new Date(gig.scheduled_start).getTime()) / 36e5
    return Math.round(h * 10) / 10
}

function gigEarnings(gig: Gig) {
    const rate = parseFloat(gig.pay_rate || '0')
    return gig.pay_type === 'hourly' ? rate * gigHours(gig) : rate
}

function PayBadge({ gig }: { gig: Gig }) {
    const rate = parseFloat(gig.pay_rate || '0')
    return (
        <span className="flex items-center gap-1 font-bold text-emerald-700">
            <DollarSign className="w-3.5 h-3.5" />
            {rate.toFixed(2)}
            <span className="font-normal text-gray-400 text-xs">
                {gig.pay_type === 'hourly' ? '/hr' : ' flat'}
            </span>
        </span>
    )
}

// ─── Shared input classes ─────────────────────────────────────────────────────
const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all'
const lbl = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

// ─── Post Gig Modal (admin) ───────────────────────────────────────────────────
const EMPTY = { title: '', description: '', venue: '', scheduled_start: '', scheduled_end: '', pay_rate: '', pay_type: 'flat' as const }

function PostGigModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

    useEffect(() => { if (open) setForm(EMPTY) }, [open])

    const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }))

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (new Date(form.scheduled_start) >= new Date(form.scheduled_end)) {
            toast.error('End time must be after start time'); return
        }
        setSaving(true)
        try {
            await api.post('/gigs/gigs/', { ...form, pay_rate: parseFloat(form.pay_rate) || 0 })
            toast.success('Gig posted to the marketplace!')
            onCreated(); onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to post gig')
        } finally { setSaving(false) }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="min-h-full flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: 'spring', duration: 0.4 }}
                                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Music className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">Post New Gig</h2>
                                            <p className="text-xs text-gray-400">Release an open slot to the marketplace</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                                <form onSubmit={submit} className="p-6 space-y-4">
                                    <div>
                                        <label className={lbl}>Title <span className="text-red-400">*</span></label>
                                        <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Saturday Night Jazz at The Venue" className={inp} required />
                                    </div>
                                    <div>
                                        <label className={lbl}>Venue <span className="text-red-400">*</span></label>
                                        <input type="text" value={form.venue} onChange={set('venue')} placeholder="e.g. The Blue Note, 123 Main St" className={inp} required />
                                    </div>
                                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={lbl}>Start <span className="text-red-400">*</span></label>
                                            <input type="datetime-local" value={form.scheduled_start} onChange={set('scheduled_start')} className={inp} required />
                                        </div>
                                        <div>
                                            <label className={lbl}>End <span className="text-red-400">*</span></label>
                                            <input type="datetime-local" value={form.scheduled_end} onChange={set('scheduled_end')} className={inp} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={lbl}>Pay Rate ($)</label>
                                            <input type="number" min="0" step="0.01" value={form.pay_rate} onChange={set('pay_rate')} placeholder="0.00" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Pay Type</label>
                                            <select value={form.pay_type} onChange={set('pay_type')} className={inp}>
                                                <option value="flat">Flat Rate</option>
                                                <option value="hourly">Hourly Rate</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={lbl}>Notes for bands</label>
                                        <textarea value={form.description} onChange={set('description')} placeholder="Dress code, gear requirements, load-in time..." rows={2} className={`${inp} resize-none`} />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                                        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                                            {saving && <Loader className="w-4 h-4 animate-spin" />} Post Gig
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─── Claim Modal (band users) ─────────────────────────────────────────────────
function ClaimModal({ gig, bands, open, onClose, onClaimed }: {
    gig: Gig | null; bands: Band[]; open: boolean; onClose: () => void; onClaimed: () => void
}) {
    const [bandId, setBandId] = useState('')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => { if (open) { setBandId(bands[0]?.id || ''); setNotes('') } }, [open, bands])

    if (!gig) return null

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bandId) { toast.error('Select a band'); return }
        setSaving(true)
        try {
            await api.post(`/gigs/gigs/${gig.id}/claim/`, { band_id: bandId, notes })
            toast.success('Gig claimed! Waiting for approval.')
            onClaimed(); onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to claim gig')
        } finally { setSaving(false) }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="min-h-full flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: 'spring', duration: 0.4 }}
                                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">Claim This Gig</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">{gig.title} · {gig.venue}</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{fmt(gig.scheduled_start)}</span>
                                        <span className="font-bold text-emerald-600">
                                            ${gigEarnings(gig).toFixed(2)} est. earnings
                                        </span>
                                    </div>
                                </div>
                                <form onSubmit={submit} className="p-6 space-y-4">
                                    <div>
                                        <label className={lbl}>Claiming as <span className="text-red-400">*</span></label>
                                        <select value={bandId} onChange={e => setBandId(e.target.value)} className={inp} required>
                                            <option value="">Select your band…</option>
                                            {bands.map(b => <option key={b.id} value={b.id}>{b.name}{b.genre ? ` (${b.genre})` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Message to booker</label>
                                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes, questions, or context for the booker…" rows={3} className={`${inp} resize-none`} />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                                        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                                            {saving && <Loader className="w-4 h-4 animate-spin" />} Submit Claim
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─── Approve Claim Modal (admin) ──────────────────────────────────────────────
function ApproveClaimModal({ gig, open, onClose, onApproved }: {
    gig: Gig | null; open: boolean; onClose: () => void; onApproved: () => void
}) {
    const [saving, setSaving] = useState<string | null>(null)

    if (!gig) return null

    const approve = async (claimId: string) => {
        setSaving(claimId)
        try {
            await api.post(`/gigs/gigs/${gig.id}/approve_claim/`, { claim_id: claimId })
            toast.success('Claim approved — gig assigned!')
            onApproved(); onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to approve claim')
        } finally { setSaving(null) }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="min-h-full flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: 'spring', duration: 0.4 }}
                                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">Review Claims</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">{gig.title} · {gig.venue} · {fmt(gig.scheduled_start)}</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="p-6 space-y-3">
                                    {gig.claims.filter(c => c.status === 'pending').length === 0 ? (
                                        <p className="text-sm text-center text-gray-400 py-8">No pending claims for this gig.</p>
                                    ) : (
                                        gig.claims.filter(c => c.status === 'pending').map(claim => (
                                            <div key={claim.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">{claim.band_name}</p>
                                                    {claim.notes && <p className="text-xs text-gray-500 mt-1 max-w-xs">{claim.notes}</p>}
                                                    <p className="text-[10px] text-gray-400 mt-1">Submitted {new Date(claim.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => approve(claim.id)}
                                                    disabled={saving === claim.id}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    {saving === claim.id ? <Loader className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                                                    Approve
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─── Payout Modal (admin) ─────────────────────────────────────────────────────
function PayoutModal({ gig, open, onClose, onPaid }: {
    gig: Gig | null; open: boolean; onClose: () => void; onPaid: () => void
}) {
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('bank_transfer')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open && gig) setAmount(gigEarnings(gig).toFixed(2))
    }, [open, gig])

    if (!gig) return null

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post(`/gigs/gigs/${gig.id}/payout/`, { amount: parseFloat(amount), payment_method: method })
            toast.success(`Payout of $${amount} processed for ${gig.band_name}`)
            onPaid(); onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Payout failed')
        } finally { setSaving(false) }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="min-h-full flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: 'spring', duration: 0.4 }}
                                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">Process Payout</h2>
                                            <p className="text-xs text-gray-400">For {gig.band_name}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                                <form onSubmit={submit} className="p-6 space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Gig</span><span className="font-semibold text-gray-800">{gig.title}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-semibold text-gray-800">{gig.venue}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-800">{fmt(gig.scheduled_start)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-semibold text-gray-800">{gigHours(gig)} hrs</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Base rate</span><span className="font-semibold text-gray-800"><PayBadge gig={gig} /></span></div>
                                    </div>
                                    <div>
                                        <label className={lbl}>Final Payout Amount ($)</label>
                                        <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inp} required />
                                    </div>
                                    <div>
                                        <label className={lbl}>Payment Method</label>
                                        <select value={method} onChange={e => setMethod(e.target.value)} className={inp}>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="check">Check</option>
                                            <option value="cash">Cash</option>
                                            <option value="venmo">Venmo</option>
                                            <option value="zelle">Zelle</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-400">This will create an invoice and payment record in billing and mark the gig as completed.</p>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                                        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                                            {saving && <Loader className="w-4 h-4 animate-spin" />} Pay ${parseFloat(amount || '0').toFixed(2)}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─── Marketplace Tab ──────────────────────────────────────────────────────────
function MarketplaceTab({ gigs, bands, isAdmin, onClaim, onRefresh }: {
    gigs: Gig[]; bands: Band[]; isAdmin: boolean; onClaim: (g: Gig) => void; onRefresh: () => void
}) {
    const [search, setSearch] = useState('')
    const open = gigs.filter(g => g.status === 'open' &&
        (g.title.toLowerCase().includes(search.toLowerCase()) || g.venue.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by title or venue…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>

            {open.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Music2 className="w-10 h-10 text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No open gigs right now</p>
                    {isAdmin && <p className="text-xs text-gray-400 mt-2">Post a gig above to get started.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {open.map(gig => (
                        <div key={gig.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <h3 className="font-bold text-gray-900 leading-tight">{gig.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${STATUS_COLOR[gig.status]}`}>
                                        {STATUS_LABEL[gig.status]}
                                    </span>
                                </div>

                                <div className="space-y-1.5 mb-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                        {gig.venue}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                        {fmt(gig.scheduled_start)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                        {gigHours(gig)} hrs
                                    </div>
                                </div>

                                {gig.description && (
                                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{gig.description}</p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Est. earnings</p>
                                        <p className="text-lg font-black text-gray-900">
                                            ${gigEarnings(gig).toFixed(2)}
                                            <span className="text-xs font-normal text-gray-400 ml-1">
                                                ({gig.pay_type === 'hourly' ? `$${parseFloat(gig.pay_rate).toFixed(2)}/hr` : 'flat'})
                                            </span>
                                        </p>
                                    </div>
                                    {!isAdmin && bands.length > 0 && (
                                        <button onClick={() => onClaim(gig)}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                                            Claim
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Manage Tab (admin) ───────────────────────────────────────────────────────
function ManageTab({ gigs, onApprove, onPayout, onRefresh }: {
    gigs: Gig[]; onApprove: (g: Gig) => void; onPayout: (g: Gig) => void; onRefresh: () => void
}) {
    const [filter, setFilter] = useState<string>('all')

    const filtered = filter === 'all' ? gigs : gigs.filter(g => g.status === filter)
    const pendingCount = gigs.filter(g => g.status === 'pending_approval').length

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {[['all', 'All'], ['open', 'Open'], ['pending_approval', 'Pending'], ['assigned', 'Assigned'], ['completed', 'Completed']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === v ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {l}
                        {v === 'pending_approval' && pendingCount > 0 && (
                            <span className="ml-1.5 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Gig', 'Venue', 'Date', 'Pay', 'Band', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-16 text-center text-xs text-gray-400">No gigs in this category</td></tr>
                            ) : filtered.map(gig => (
                                <tr key={gig.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4 font-semibold text-sm text-gray-900 max-w-[160px]">
                                        <p className="truncate">{gig.title}</p>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-gray-500">{gig.venue}</td>
                                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{fmt(gig.scheduled_start)}</td>
                                    <td className="px-5 py-4"><PayBadge gig={gig} /></td>
                                    <td className="px-5 py-4 text-xs font-semibold text-gray-600">{gig.band_name || <span className="text-gray-300">—</span>}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLOR[gig.status]}`}>
                                            {STATUS_LABEL[gig.status]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {gig.status === 'pending_approval' && (
                                                <button onClick={() => onApprove(gig)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                                                    <Users className="w-3 h-3" /> Review Claims
                                                </button>
                                            )}
                                            {gig.status === 'assigned' && (
                                                <button onClick={() => onPayout(gig)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                                    <CreditCard className="w-3 h-3" /> Pay Out
                                                </button>
                                            )}
                                            {gig.status === 'completed' && (
                                                <span className="flex items-center gap-1 text-xs text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Paid</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ─── My Gigs Tab (band/student) ────────────────────────────────────────────────
function MyGigsTab({ gigs, onRefresh }: { gigs: Gig[]; onRefresh: () => void }) {
    const [releasing, setReleasing] = useState<string | null>(null)

    const release = async (gig: Gig) => {
        setReleasing(gig.id)
        try {
            await api.post(`/gigs/gigs/${gig.id}/release/`)
            toast.success('Gig released back to the marketplace')
            onRefresh()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to release gig')
        } finally { setReleasing(null) }
    }

    const mine = gigs.filter(g => g.status !== 'open')

    if (mine.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Music2 className="w-10 h-10 text-gray-200 mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No gigs yet</p>
                <p className="text-xs text-gray-400 mt-2">Head to Marketplace to claim open gigs.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mine.map(gig => (
                <div key={gig.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className={`h-1.5 ${gig.status === 'assigned' ? 'bg-blue-400' : gig.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-gray-900">{gig.title}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${STATUS_COLOR[gig.status]}`}>
                                {STATUS_LABEL[gig.status]}
                            </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-300" />{gig.venue}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-300" />{fmt(gig.scheduled_start)}</div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Your earnings</p>
                                <p className="text-base font-black text-gray-900">${gigEarnings(gig).toFixed(2)}</p>
                            </div>
                            {gig.status === 'assigned' && (
                                <button onClick={() => release(gig)} disabled={releasing === gig.id}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1">
                                    {releasing === gig.id ? <Loader className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Release
                                </button>
                            )}
                            {gig.status === 'completed' && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                    <CheckCircle2 className="w-4 h-4" /> Paid out
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Availability Tab ─────────────────────────────────────────────────────────
function AvailabilityTab({ bands, isAdmin }: { bands: Band[]; isAdmin: boolean }) {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth()) // 0-indexed
    const [selectedBand, setSelectedBand] = useState<string>(bands[0]?.id || '')
    const [avail, setAvail] = useState<BandAvailability | null>(null)
    const [availMap, setAvailMap] = useState<Record<string, BandAvailability>>({}) // bandId → avail (admin)
    const [activeDays, setActiveDays] = useState<Set<number>>(new Set())
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })

    const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
    const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

    // Fetch availability for the current month/band
    const fetchAvail = useCallback(async () => {
        if (!selectedBand && !isAdmin) return
        setLoading(true)
        try {
            const res = await api.get('/gigs/availabilities/')
            const all: BandAvailability[] = res.data.results || res.data

            if (isAdmin) {
                // Build map for all bands for this month
                const map: Record<string, BandAvailability> = {}
                all.filter(a => a.month === monthKey).forEach(a => { map[a.band] = a })
                setAvailMap(map)
            } else {
                const found = all.find(a => a.band === selectedBand && a.month === monthKey) || null
                setAvail(found)
                setActiveDays(new Set(found?.availability_data?.available_days || []))
                setNotes(found?.availability_data?.notes || '')
            }
        } catch { } finally { setLoading(false) }
    }, [selectedBand, monthKey, isAdmin])

    useEffect(() => { fetchAvail() }, [fetchAvail])

    const toggleDay = (day: number) => {
        if (avail?.is_submitted) return
        setActiveDays(prev => {
            const n = new Set(prev)
            n.has(day) ? n.delete(day) : n.add(day)
            return n
        })
    }

    const save = async (submit = false) => {
        if (!selectedBand) return
        const fn = submit ? setSubmitting : setSaving
        fn(true)
        try {
            const payload = {
                band: selectedBand,
                month: monthKey,
                availability_data: { available_days: Array.from(activeDays).sort((a, b) => a - b), notes },
                is_submitted: submit,
            }
            if (avail?.id) {
                await api.patch(`/gigs/availabilities/${avail.id}/`, payload)
                if (submit) await api.post(`/gigs/availabilities/${avail.id}/submit/`)
            } else {
                await api.post('/gigs/availabilities/', payload)
            }
            toast.success(submit ? 'Availability submitted!' : 'Draft saved')
            fetchAvail()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to save')
        } finally { fn(false) }
    }

    // Calendar grid
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDow = new Date(year, month, 1).getDay() // 0=Sun
    const calDays: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    while (calDays.length % 7 !== 0) calDays.push(null)

    if (isAdmin) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                    <span className="text-base font-bold text-gray-900 min-w-[160px] text-center">{monthName}</span>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                </div>

                {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
                    <div className="space-y-4">
                        {bands.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No bands found in this studio.</p>}
                        {bands.map(band => {
                            const ba = availMap[band.id]
                            const days = new Set<number>(ba?.availability_data?.available_days || [])
                            return (
                                <div key={band.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{band.name}</p>
                                            {band.genre && <p className="text-xs text-gray-400">{band.genre}</p>}
                                        </div>
                                        {ba ? (
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ba.is_submitted ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {ba.is_submitted ? 'Submitted' : 'Draft'}
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400">Not submitted</span>
                                        )}
                                    </div>
                                    {ba ? (
                                        <div className="grid grid-cols-7 gap-1">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                <div key={i} className="text-center text-[10px] font-black text-gray-400 uppercase pb-1">{d}</div>
                                            ))}
                                            {calDays.map((day, i) => (
                                                <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold
                                                    ${day === null ? '' : days.has(day) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-300'}`}>
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-300 text-center py-4">No availability submitted for this month.</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    // Band / student view
    return (
        <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                    <span className="text-base font-bold text-gray-900 min-w-[160px] text-center">{monthName}</span>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                </div>
                {avail?.is_submitted && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Submitted
                    </span>
                )}
            </div>

            {bands.length > 1 && (
                <div>
                    <label className={lbl}>Band</label>
                    <select value={selectedBand} onChange={e => setSelectedBand(e.target.value)} className={inp}>
                        {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
            )}

            {avail?.is_submitted && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Availability has been submitted and is locked. Contact your studio if changes are needed.
                </div>
            )}

            {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {[['S','Sun'],['M','Mon'],['T','Tue'],['W','Wed'],['T','Thu'],['F','Fri'],['S','Sat']].map(([s,l], i) => (
                            <div key={i} className="text-center text-[10px] font-black text-gray-400 uppercase pb-2">
                                <span className="sm:hidden">{s}</span>
                                <span className="hidden sm:inline">{l}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calDays.map((day, i) => (
                            <button key={i} disabled={!day || avail?.is_submitted}
                                onClick={() => day && toggleDay(day)}
                                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all
                                    ${!day ? 'cursor-default' :
                                        avail?.is_submitted ? 'cursor-default' :
                                            'cursor-pointer hover:scale-105'}
                                    ${day && activeDays.has(day) ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' :
                                        day ? 'bg-gray-50 text-gray-400 hover:bg-gray-100' : ''}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Available</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Unavailable</span>
                        <span className="ml-auto font-semibold text-gray-600">{activeDays.size} days selected</span>
                    </div>
                </div>
            )}

            {!avail?.is_submitted && (
                <>
                    <div>
                        <label className={lbl}>Notes (optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                            placeholder="e.g. Available evenings only on weekdays, no Sundays in July…"
                            className={`${inp} resize-none`} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => save(false)} disabled={saving}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving && <Loader className="w-4 h-4 animate-spin" />} Save Draft
                        </button>
                        <button onClick={() => save(true)} disabled={submitting || activeDays.size === 0}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting && <Loader className="w-4 h-4 animate-spin" />} Submit Availability
                        </button>
                    </div>
                    {activeDays.size === 0 && <p className="text-xs text-center text-gray-400">Select at least one available day before submitting.</p>}
                </>
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GigsPage() {
    const { currentUser } = useUser()
    const isAdmin = currentUser?.role === 'admin'

    const [gigs, setGigs] = useState<Gig[]>([])
    const [bands, setBands] = useState<Band[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('marketplace')

    const [postOpen, setPostOpen] = useState(false)
    const [claimGig, setClaimGig] = useState<Gig | null>(null)
    const [approveGig, setApproveGig] = useState<Gig | null>(null)
    const [payoutGig, setPayoutGig] = useState<Gig | null>(null)

    const fetchAll = useCallback(async () => {
        try {
            const [gigsRes, bandsRes] = await Promise.all([
                api.get('/gigs/gigs/'),
                api.get('/core/bands/'),
            ])
            setGigs(Array.isArray(gigsRes.data) ? gigsRes.data : gigsRes.data.results || [])
            setBands(Array.isArray(bandsRes.data) ? bandsRes.data : bandsRes.data.results || [])
        } catch { toast.error('Failed to load gig data') }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    const openGigs = gigs.filter(g => g.status === 'open')
    const pendingCount = gigs.filter(g => g.status === 'pending_approval').length

    const tabs = [
        { id: 'marketplace', label: 'Marketplace', count: openGigs.length },
        ...(isAdmin
            ? [{ id: 'manage', label: 'Manage', count: pendingCount > 0 ? pendingCount : undefined }]
            : [{ id: 'mygigs', label: 'My Gigs' }]
        ),
        { id: 'availability', label: 'Availability' },
    ]

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Marketplace…</p>
        </div>
    )

    return (
        <>
            <PostGigModal open={postOpen} onClose={() => setPostOpen(false)} onCreated={fetchAll} />
            <ClaimModal gig={claimGig} bands={bands} open={!!claimGig} onClose={() => setClaimGig(null)} onClaimed={fetchAll} />
            <ApproveClaimModal gig={approveGig} open={!!approveGig} onClose={() => setApproveGig(null)} onApproved={fetchAll} />
            <PayoutModal gig={payoutGig} open={!!payoutGig} onClose={() => setPayoutGig(null)} onPaid={fetchAll} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Gig Marketplace</h1>
                        <p className="text-gray-500 text-sm mt-1">Bands pick up gigs, set their schedules, and get paid — no middleman.</p>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setPostOpen(true)}
                            className="gap-2 shadow-lg shadow-primary/20 font-bold">
                            <Plus className="w-4 h-4" /> Post New Gig
                        </Button>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Open', value: gigs.filter(g => g.status === 'open').length, color: 'text-emerald-600' },
                        { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
                        { label: 'Assigned', value: gigs.filter(g => g.status === 'assigned').length, color: 'text-blue-600' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                            <p className={`text-2xl font-black ${color}`}>{value}</p>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {t.label}
                            {t.count !== undefined && t.count > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {tab === 'marketplace' && <MarketplaceTab gigs={gigs} bands={bands} isAdmin={isAdmin} onClaim={setClaimGig} onRefresh={fetchAll} />}
                {tab === 'manage' && isAdmin && <ManageTab gigs={gigs} onApprove={setApproveGig} onPayout={setPayoutGig} onRefresh={fetchAll} />}
                {tab === 'mygigs' && !isAdmin && <MyGigsTab gigs={gigs} onRefresh={fetchAll} />}
                {tab === 'availability' && <AvailabilityTab bands={bands} isAdmin={isAdmin} />}
            </div>
        </>
    )
}
