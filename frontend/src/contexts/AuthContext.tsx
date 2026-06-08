import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { User, Session, AuthError } from "@supabase/supabase-js";

// User profile from database
interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    provider: string;
    created_at: string;
    // Extended profile fields
    username: string | null;
    institute_name: string | null;
    whatsapp_number: string | null;
    academic_year: string | null;
    course: string | null;
    specialization: string | null;
    short_bio: string | null;
    skills: string[] | null;
    linkedin_url: string | null;
    github_username: string | null;
    profile_completed: boolean;
    profile_completed_at: string | null;
    // Dashboard metrics
    streak_count: number;
    total_xp: number;
    last_activity_date: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    profileLoading: boolean;
    isConfigured: boolean;
    isProfileComplete: boolean;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signInWithLinkedIn: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const isConfigured = isSupabaseConfigured();

    // Fetch user profile from database
    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                return null;
            }
            return data as UserProfile;
        } catch (err) {
            console.error("Profile fetch error:", err);
            return null;
        }
    }, []);

    // Refresh profile data
    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            setProfileLoading(true);
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
            setProfileLoading(false);
        }
    }, [user?.id, fetchProfile]);

    // Ensure profile exists - create one if it doesn't (fallback for OAuth users)
    const ensureProfileExists = useCallback(async (userId: string, authUser: User): Promise<UserProfile | null> => {
        try {
            // First try to fetch existing profile
            let profileData = await fetchProfile(userId);

            if (!profileData) {
                // Profile doesn't exist, create a basic one
                console.log("Profile not found, creating basic profile for user:", userId);

                const { error: insertError } = await supabase
                    .from("users")
                    .upsert({
                        id: userId,
                        email: authUser.email || "",
                        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "",
                        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || "",
                        provider: authUser.app_metadata?.provider || "oauth",
                        profile_completed: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'id'
                    });

                if (insertError) {
                    console.error("Error creating profile:", insertError);
                    return null;
                }

                // Fetch the newly created profile
                profileData = await fetchProfile(userId);
            }

            return profileData;
        } catch (err) {
            console.error("Error ensuring profile exists:", err);
            return null;
        }
    }, [fetchProfile]);

    useEffect(() => {
        if (!isConfigured) {
            setLoading(false);
            setProfileLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Ensure profile exists if user is logged in
            if (session?.user?.id) {
                setProfileLoading(true);
                const profileData = await ensureProfileExists(session.user.id, session.user);
                setProfile(profileData);
                setProfileLoading(false);
            } else {
                setProfileLoading(false);
            }

            setLoading(false);
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Ensure profile exists on auth change (login/signup)
            if (session?.user?.id) {
                setProfileLoading(true);
                // Small delay to allow trigger to create profile first
                setTimeout(async () => {
                    const profileData = await ensureProfileExists(session.user.id, session.user);
                    setProfile(profileData);
                    setProfileLoading(false);
                }, 500);
            } else {
                setProfile(null);
                setProfileLoading(false);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [isConfigured, ensureProfileExists]);

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin,
            },
        });
        return { error };
    }, []);

    const signInWithLinkedIn = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "linkedin_oidc",
            options: {
                redirectTo: window.location.origin,
            },
        });
        return { error };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
    }, []);

    const isProfileComplete = useMemo(() => profile?.profile_completed ?? false, [profile]);

    const value = useMemo(() => ({
        user,
        profile,
        session,
        loading,
        profileLoading,
        isConfigured,
        isProfileComplete,
        signInWithGoogle,
        signInWithLinkedIn,
        signOut,
        refreshProfile,
    }), [
        user,
        profile,
        session,
        loading,
        profileLoading,
        isConfigured,
        isProfileComplete,
        signInWithGoogle,
        signInWithLinkedIn,
        signOut,
        refreshProfile,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
