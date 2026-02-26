"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Provides authentication state (session, user, profile, loading)
 * and auth actions (logout) to the component tree.
 */
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    // Use a ref so the onAuthStateChange callback always has the current pathname
    const pathnameRef = useRef(pathname);
    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    // Fetch user profile from Supabase 'profiles' table
    const fetchUserProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, business_name')
                .eq('id', userId)
                .single();

            if (error) throw error;

            setUserProfile({
                role: data?.role || 'user',
                businessName: data?.business_name || 'Rekan',
            });
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
            setUserProfile({ role: 'user', businessName: 'Rekan' });
        }
    }, []);

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                await fetchUserProfile(session.user.id);
            }
            setLoading(false);
        };
        getSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                // Update session state immediately so UI responds fast
                setSession(session);

                if (session?.user) {
                    // Fetch profile in background — don't block the redirect
                    fetchUserProfile(session.user.id);

                    // Use ref to get current pathname (avoids stale closure)
                    const currentPath = pathnameRef.current;
                    if (currentPath === '/' || currentPath === '/auth') {
                        router.push('/dashboard');
                    }
                } else {
                    setUserProfile(null);

                    const currentPath = pathnameRef.current;
                    if (currentPath.startsWith('/dashboard')) {
                        router.push('/');
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setSession(null);
        setUserProfile(null);
        setLoading(false);
        router.push('/');
    };

    const value = {
        session,
        user: session?.user ?? null,
        userProfile,
        loading,
        handleLogout,
        isAdmin: userProfile?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
