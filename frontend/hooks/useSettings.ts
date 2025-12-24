import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';

export interface StudioSettings {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    timezone: string;
    currency: string;
    settings?: Record<string, any>;
}

export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    timezone: string;
}

export function useSettings() {
    const { currentUser: user } = useUser();
    const [studio, setStudio] = useState<StudioSettings | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            // Fetch User Profile
            const userRes = await api.get('/core/users/me/');
            setProfile(userRes.data);

            // Fetch Studio Settings (only if admin)
            if (user?.role === 'admin') {
                const studioRes = await api.get('/core/studios/current/');
                setStudio(studioRes.data);
            }

        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        try {
            setSaving(true);
            const res = await api.patch('/core/users/me/', data);
            setProfile(res.data);
            toast.success('Profile updated successfully');
            return res.data;
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const updateStudio = async (data: Partial<StudioSettings>) => {
        try {
            setSaving(true);
            const res = await api.patch('/core/studios/current/', data);
            setStudio(res.data);
            toast.success('Studio settings updated successfully');
            return res.data;
        } catch (error) {
            console.error('Failed to update studio:', error);
            toast.error('Failed to update studio settings');
            throw error;
        } finally {
            setSaving(false);
        }
    };

    return {
        studio,
        profile,
        loading,
        saving,
        updateProfile,
        updateStudio,
        refresh: fetchSettings
    };
}
