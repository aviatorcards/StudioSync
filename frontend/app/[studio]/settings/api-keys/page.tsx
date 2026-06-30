'use client';

import React, { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { Copy, Eye, EyeOff, Key, Plus, Trash2 } from 'lucide-react';

interface APIKey {
    id: string;
    name: string;
    prefix: string;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
    revoked_at: string | null;
}

interface NewKeyResult {
    id: string;
    name: string;
    key: string;
    prefix: string;
    created_at: string;
}

function formatDate(iso: string | null) {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function APIKeysPage() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await api.get('/core/api-keys/');
            setKeys(res.data.results ?? res.data);
        } catch {
            // silently ignore — user may not be admin
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function createKey(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await api.post('/core/api-keys/', { name: newName.trim() });
            setNewKey(res.data);
            setRevealed(false);
            setNewName('');
            setShowForm(false);
            load();
        } finally {
            setCreating(false);
        }
    }

    async function revokeKey(id: string) {
        if (!confirm('Revoke this API key? Any service using it will lose access immediately.')) return;
        setRevoking(id);
        try {
            await api.post(`/core/api-keys/${id}/revoke/`);
            setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: false } : k));
        } finally {
            setRevoking(null);
        }
    }

    function copyKey() {
        if (!newKey) return;
        navigator.clipboard.writeText(newKey.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const activeKeys = keys.filter(k => k.is_active);
    const revokedKeys = keys.filter(k => !k.is_active);

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Key className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">API Keys</h1>
                </div>
                <p className="text-muted-foreground ml-12">
                    Generate keys for external integrations (e.g. 317booking) to authenticate against the StudioSync API.
                    Keys are shown once — store them securely.
                </p>
            </div>

            {/* New key revealed */}
            {newKey && (
                <div className="mb-6 rounded-xl border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-950/20 p-5">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                        Save your new key — it won&apos;t be shown again.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm font-mono tracking-wide overflow-x-auto">
                            {revealed ? newKey.key : '•'.repeat(newKey.key.length)}
                        </code>
                        <button
                            onClick={() => setRevealed(v => !v)}
                            className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                            title={revealed ? 'Hide' : 'Reveal'}
                        >
                            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={copyKey}
                            className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                            title="Copy"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                    {copied && <p className="mt-2 text-xs text-green-600 dark:text-green-400">Copied to clipboard!</p>}
                    <button
                        onClick={() => setNewKey(null)}
                        className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        I&apos;ve saved it — dismiss
                    </button>
                </div>
            )}

            {/* Create form */}
            <div className="mb-6">
                {showForm ? (
                    <form onSubmit={createKey} className="flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Key name (e.g. 317booking)"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newName.trim()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                            {creating ? 'Generating…' : 'Generate'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setNewName(''); }}
                            className="px-4 py-2 border rounded-lg text-sm hover:bg-secondary transition-colors"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="h-4 w-4" />
                        New API Key
                    </button>
                )}
            </div>

            {/* Active keys */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading…</div>
            ) : activeKeys.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-xl">
                    No active API keys. Generate one to get started.
                </div>
            ) : (
                <div className="space-y-2 mb-8">
                    {activeKeys.map(k => (
                        <div key={k.id} className="flex items-center gap-4 border rounded-xl px-4 py-3 bg-background">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{k.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {k.prefix}••••••••••••••••••••
                                </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground shrink-0">
                                <p>Created {formatDate(k.created_at)}</p>
                                <p>Last used {formatDate(k.last_used_at)}</p>
                            </div>
                            <button
                                onClick={() => revokeKey(k.id)}
                                disabled={revoking === k.id}
                                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                title="Revoke key"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Revoked keys */}
            {revokedKeys.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground mb-2">Revoked Keys</h2>
                    <div className="space-y-1">
                        {revokedKeys.map(k => (
                            <div key={k.id} className="flex items-center gap-4 border rounded-xl px-4 py-3 opacity-50">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate line-through">{k.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {k.prefix}••••••••••••••••••••
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground shrink-0">
                                    Revoked {formatDate(k.revoked_at)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Usage guide */}
            <div className="mt-10 rounded-xl border bg-secondary/30 p-5">
                <h2 className="font-semibold mb-3">Using your API key</h2>
                <p className="text-sm text-muted-foreground mb-3">
                    Pass the key as a Bearer token or{' '}
                    <code className="bg-background border rounded px-1 text-xs">X-Api-Key</code> header:
                </p>
                <pre className="bg-background border rounded-lg p-3 text-xs overflow-x-auto">
{`# Authorization header
curl -H "Authorization: Bearer ss_<your-key>" \\
     https://your-studio.com/api/core/bands/

# X-Api-Key header (alternative)
curl -H "X-Api-Key: ss_<your-key>" \\
     https://your-studio.com/api/core/bands/`}
                </pre>
                <p className="mt-3 text-sm text-muted-foreground">
                    For <strong>317booking</strong>, set{' '}
                    <code className="bg-background border rounded px-1 text-xs">STUDIOSYNC_API_KEY</code> in its{' '}
                    <code className="bg-background border rounded px-1 text-xs">.env</code> to your key value.
                </p>
            </div>
        </div>
    );
}
