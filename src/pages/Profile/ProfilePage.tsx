import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Calendar, Heart, Sparkles, Save, Loader2 } from 'lucide-react';
import { getProfile, updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SkeletonText } from '../../components/Skeleton';

interface LevelInfo {
    level: number;
    title: string;
    xp: number;
    xp_for_next: number | null;
    progress: number;
}

interface ProfileData {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    birth_date: string | null;
    birth_place: string | null;
    current_place: string | null;
    gender: string | null;
    prompt_context: string | null;
    level: number;
    xp: number;
    credits: number;
    level_info?: LevelInfo;
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        display_name: '',
        avatar_url: '',
        birth_date: '',
        birth_place: '',
        current_place: '',
        gender: '',
        prompt_context: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
            setFormData({
                display_name: data.display_name || '',
                avatar_url: data.avatar_url || '',
                birth_date: data.birth_date || '',
                birth_place: data.birth_place || '',
                current_place: data.current_place || '',
                gender: data.gender || '',
                prompt_context: data.prompt_context || ''
            });
        } catch (err: any) {
            console.error('Failed to load profile:', err);
            // If 401, user is not logged in - that's OK, just show empty form
            if (err?.status === 401 || err?.message?.includes('401')) {
                console.log('User not authenticated, showing empty form');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const updated = await updateProfile({
                display_name: formData.display_name || undefined,
                avatar_url: formData.avatar_url || undefined,
                birth_date: formData.birth_date || undefined,
                birth_place: formData.birth_place || undefined,
                current_place: formData.current_place || undefined,
                gender: formData.gender || undefined,
                prompt_context: formData.prompt_context || undefined
            });
            setProfile({ ...profile, ...updated } as ProfileData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            if (err?.message?.includes('401') || err?.status === 401) {
                setError('Please login to save profile');
            } else {
                setError('Failed to save profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <div style={cssBg} className="min-h-[calc(100vh-80px)] py-12 px-6">
                <main className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center mb-12 space-y-4">
                        <SkeletonText lines={1} className="h-10 w-64 mx-auto" />
                        <SkeletonText lines={2} className="h-4 w-80 mx-auto" />
                    </div>
                    <div className="space-y-6 p-8" style={cssSurface}>
                        <SkeletonText lines={4} />
                    </div>
                    <div className="space-y-6 p-8" style={cssSurface}>
                        <SkeletonText lines={5} />
                    </div>
                    <div className="space-y-6 p-8" style={cssSurface}>
                        <SkeletonText lines={3} />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={cssBg} className="min-h-[calc(100vh-80px)] py-12 px-6">
            <main className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl italic opacity-80 mb-4">Your Profile</h1>
                    <p className="text-sm opacity-40 max-w-md mx-auto">
                        Personalize your experience. These details help the oracles provide deeper, more relevant insights.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6 p-8" style={cssSurface}>
                        <h2 className="font-serif text-xl flex items-center gap-3 opacity-80">
                            <User size={20} />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    name="display_name"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                    placeholder="How should we call you?"
                                    className="w-full bg-transparent border-b border-ink/20 dark:border-white/20 py-3 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-ink/20 dark:border-white/20 py-3 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                Avatar URL
                            </label>
                            <input
                                type="url"
                                name="avatar_url"
                                value={formData.avatar_url}
                                onChange={handleChange}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full bg-transparent border-b border-ink/20 dark:border-white/20 py-3 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-6 p-8" style={cssSurface}>
                        <h2 className="font-serif text-xl flex items-center gap-3 opacity-80">
                            <MapPin size={20} />
                            Location & Birth
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-ink/20 dark:border-white/20 py-3 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                    Place of Birth
                                </label>
                                <input
                                    type="text"
                                    name="birth_place"
                                    value={formData.birth_place}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="w-full bg-transparent border-b border-ink/20 dark:border-white/20 py-3 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                Current Residence
                            </label>
                            <input
                                type="text"
                                name="current_place"
                                value={formData.current_place}
                                onChange={handleChange}
                                placeholder="City, Country"
                                className="w-full bg-transparent border-b border-ink/20 dark:border-white/20 py-3 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-6 p-8" style={cssSurface}>
                        <h2 className="font-serif text-xl flex items-center gap-3 opacity-80">
                            <Sparkles size={20} />
                            Oracle Context
                        </h2>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                                Custom Context Notes
                            </label>
                            <textarea
                                name="prompt_context"
                                value={formData.prompt_context}
                                onChange={handleChange}
                                placeholder="Any personal context you want the oracles to consider? E.g., current life situation, important decisions, areas of focus..."
                                rows={4}
                                className="w-full bg-transparent border border-ink/10 dark:border-white/10 rounded-lg p-4 focus:outline-none focus:border-ink dark:focus:border-white transition-colors resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <motion.button
                        type="submit"
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-ink dark:bg-white text-white dark:text-ink text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 rounded-full shadow-2xl"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : saved ? (
                            <>
                                <Save size={18} />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Profile
                            </>
                        )}
                    </motion.button>
                </form>

                {profile && (
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-40">
                            <span>Nivel {profile.level}</span>
                            <span>{profile.xp || 0} XP</span>
                        </div>
                        
                        <div className="relative h-2 bg-ink/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-200"
                                initial={{ width: 0 }}
                                animate={{ width: `${(profile.level_info?.progress || 0)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        
                        <p className="text-center text-xs opacity-30">
                            {(profile.level_info?.title || "Buscador")}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
