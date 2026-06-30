'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Plus, Trash2, Users, X, Loader2, Check } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface StudioUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

interface Venue {
    id: string;
    name: string;
    address: string;
    notes: string;
    allowed_posters: string[];
    allowed_poster_names: string[];
    gigs_count: number;
}

const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all';
const lbl = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

export default function GigVenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [users, setUsers] = useState<StudioUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({ name: '', address: '', notes: '', allowed_posters: [] as string[] });

    const load = useCallback(async () => {
        try {
            const [venuesRes, usersRes] = await Promise.all([
                api.get('/gigs/venues/'),
                api.get('/core/users/'),
            ]);
            setVenues(venuesRes.data.results ?? venuesRes.data ?? []);
            // Only show admins and teachers as potential authorized posters
            const all: StudioUser[] = usersRes.data.results ?? usersRes.data ?? [];
            setUsers(all.filter(u => u.role === 'admin' || u.role === 'teacher'));
        } catch {
            toast.error('Failed to load venues');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    function openCreate() {
        setEditingId(null);
        setForm({ name: '', address: '', notes: '', allowed_posters: [] });
        setShowForm(true);
    }

    function openEdit(v: Venue) {
        setEditingId(v.id);
        setForm({ name: v.name, address: v.address, notes: v.notes, allowed_posters: v.allowed_posters });
        setShowForm(true);
    }

    function togglePoster(userId: string) {
        setForm(f => ({
            ...f,
            allowed_posters: f.allowed_posters.includes(userId)
                ? f.allowed_posters.filter(id => id !== userId)
                : [...f.allowed_posters, userId],
        }));
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Venue name is required'); return; }
        setSaving(true);
        try {
            if (editingId) {
                await api.patch(`/gigs/venues/${editingId}/`, form);
                toast.success('Venue updated');
            } else {
                await api.post('/gigs/venues/', form);
                toast.success('Venue created');
            }
            setShowForm(false);
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save venue');
        } finally {
            setSaving(false);
        }
    }

    async function deleteVenue(id: string) {
        if (!confirm('Delete this venue? Existing gigs will not be affected.')) return;
        setDeleting(id);
        try {
            await api.delete(`/gigs/venues/${id}/`);
            toast.success('Venue deleted');
            setVenues(v => v.filter(x => x.id !== id));
        } catch {
            toast.error('Failed to delete venue');
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pt-8 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/settings" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gig Venues</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Venues your studio books gigs at, and who's allowed to post for each.</p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Add Venue
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                </div>
            ) : venues.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                    <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                    <p className="font-bold text-gray-700 text-sm uppercase tracking-widest">No venues yet</p>
                    <p className="text-xs text-gray-400 mt-1 mb-6">Add the venues your studio performs at to start posting gigs.</p>
                    <button onClick={openCreate} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
                        Add First Venue
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {venues.map(v => (
                        <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <button onClick={() => openEdit(v)} className="font-bold text-gray-900 text-sm hover:text-primary transition-colors text-left">
                                    {v.name}
                                </button>
                                {v.address && <p className="text-xs text-gray-400 mt-0.5">{v.address}</p>}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    {v.gigs_count > 0 && (
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                            {v.gigs_count} gig{v.gigs_count !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {v.allowed_poster_names.length > 0 ? (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                            <Users className="w-3 h-3" />
                                            {v.allowed_poster_names.join(', ')}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin only</span>
                                    )}
                                </div>
            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => openEdit(v)}
                                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteVenue(v.id)}
                                    disabled={deleting === v.id}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                >
                                    {deleting === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit drawer */}
            {showForm && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
                                    {editingId ? 'Edit Venue' : 'New Venue'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={save} className="p-6 space-y-4">
                                <div>
                                    <label className={lbl}>Venue Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. The Vogue"
                                        className={inp}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Address</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="e.g. 6259 N College Ave, Indianapolis, IN"
                                        className={inp}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Notes</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Load-in details, parking, contact info…"
                                        rows={2}
                                        className={`${inp} resize-none`}
                                    />
                                </div>

                                {users.length > 0 && (
                                    <div>
                                        <label className={lbl}>
                                            Authorized to Post Gigs
                                            <span className="ml-1 font-normal text-gray-400 normal-case tracking-normal">(empty = admin only)</span>
                                        </label>
                                        <div className="space-y-1.5 mt-1">
                                            {users.map(u => {
                                                const selected = form.allowed_posters.includes(u.id);
                                                return (
                                                    <button
                                                        key={u.id}
                                                        type="button"
                                                        onClick={() => togglePoster(u.id)}
                                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all text-sm ${
                                                            selected
                                                                ? 'border-primary/30 bg-primary/5 text-primary'
                                                                : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                            selected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {selected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-semibold">{u.first_name} {u.last_name}</span>
                                                            <span className="text-xs text-gray-400 ml-2">{u.email}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{u.role}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingId ? 'Save Changes' : 'Create Venue'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
