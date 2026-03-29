import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { getMyProfile } from '../services/api';
import { setUserId, trackEvent, trackUserAction } from '../services/analytics';

interface LevelInfo {
    level: number;
    title: string;
    xp: number;
    xp_for_next: number | null;
    progress: number;
}

interface UserProfile {
    id: string;
    level: number;
    xp: number;
    credits: number;
    is_admin: boolean;
    level_info?: LevelInfo;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    profile: UserProfile | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    loginWithProvider: (provider: 'google' | 'apple' | 'azure') => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refreshProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
        } catch (err) {
            console.error("Failed to sync profile:", err);
        }
    };

    useEffect(() => {
        // Check for active session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                setUserId(u.id);
                trackEvent('session_started', { user_id: u.id });
                refreshProfile();
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) refreshProfile();
            else setProfile(null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
            setUserId(data.session.user.id);
            trackUserAction('user_login', { method: 'email' });
            await refreshProfile();
        }
    };

    const signup = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
            setUserId(data.session.user.id);
            trackUserAction('user_registered', { method: 'email' });
            await refreshProfile();
        }
    };

    const loginWithProvider = async (provider: 'google' | 'apple' | 'azure') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/oracle`
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn: !!user,
            user,
            profile,
            login,
            signup,
            loginWithProvider,
            logout,
            refreshProfile,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
