import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';
import type { UserProfile } from '../types/database-types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (userId: string, force = false) => {
    // Prevent multiple concurrent profile loads for the same user
    if (profileLoading && !force) {
      return;
    }

    // If we already have a profile for this user, don't reload unless forced
    if (profile?.id === userId && !force) {
      return;
    }

    setProfileLoading(true);

    try {
      // Timeout ekleyelim
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile loading timeout')), 10000); // 10 saniye
      });

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = result as any;

      if (error && error.code === 'PGRST116') {
        // Profile not found, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: user?.user_metadata?.full_name || 'Kullanıcı',
              user_type: 'buyer_seller',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setProfileLoading(false);
          return;
        }

        setProfile(newProfile);
        setProfileLoading(false);
        return;
      }

      if (error) {
        console.error('Error loading profile:', error);
        setProfileLoading(false);
        return;
      }

      setProfile(data);
      setProfileLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileLoading(false);
    }
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []); // Empty dependency array to prevent re-creation and infinite loops

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Profile management
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProfileLoading(false);
        }
        // Profile will be loaded by the separate useEffect below
      }
    );

    return () => subscription.unsubscribe();
  }, []); // No dependencies - only run on mount

  // Separate effect for profile loading
  useEffect(() => {
    // Only load profile if we have a user and no profile and not already loading
    if (user && !profile && !profileLoading) {
      loadProfile(user.id);
    }
    // If user is null, clear profile
    else if (!user && profile) {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to minimize re-renders

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await auth.signIn(email, password);

      if (error) {
        // Hata mesajlarını Türkçe ve anlaşılır hale getir
        let message = error.message;
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Email adresinizi doğrulamanız gerekiyor. Email kutunuzu kontrol edin ve doğrulama linkine tıklayın. Email gelmemişse spam klasörünü kontrol edin.';
        } else if (error.message.includes('Too many requests')) {
          message = 'Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.';
        } else if (error.message.includes('User not found')) {
          message = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı. Önce kayıt olmanız gerekiyor.';
        }
        throw new Error(message);
      }

      // Profile will be loaded by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await auth.signUp(email, password, fullName);

      if (error) {
        // Hata mesajlarını Türkçe ve anlaşılır hale getir
        let message = error.message;
        if (error.message.includes('User already registered')) {
          message = 'Bu email adresi ile zaten kayıt olunmuş. Giriş yapmayı deneyin.';
        } else if (error.message.includes('Password should be at least')) {
          message = 'Şifre en az 6 karakter olmalıdır.';
        } else if (error.message.includes('Invalid email')) {
          message = 'Geçersiz email formatı. Lütfen kontrol edin.';
        } else if (error.message.includes('Signup is disabled')) {
          message = 'Kayıt alma şu anda devre dışı. Lütfen daha sonra tekrar deneyin.';
        }
        throw new Error(message);
      }

      // Profile will be created by the database trigger
      // and loaded by the auth state change listener
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await auth.signInWithGoogle();

      if (error) {
        // Hata mesajlarını Türkçe ve anlaşılır hale getir
        let message = error.message;
        if (error.message.includes('OAuth')) {
          message = 'Google ile giriş sırasında bir sorun oluştu. Lütfen tekrar deneyin.';
        } else if (error.message.includes('popup')) {
          message = 'Pop-up penceresi engellendi. Lütfen pop-up engelleyiciyi kapatın.';
        }
        throw new Error(message);
      }

      // Profile will be loaded by the auth state change listener
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      // Ana sayfaya yönlendir
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    setLoading(true);
    try {
      // Clear session from auth helper
      await auth.clearSession();

      // Reset all state
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Clear session error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProfile(data);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isLoggedIn: !!user,
    login,
    register,
    googleLogin,
    logout,
    clearSession,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
