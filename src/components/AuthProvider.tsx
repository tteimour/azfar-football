'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { supabase, isDemoMode } from '@/lib/supabase';
import { getCurrentUser, setCurrentUser, initializeStore, getUserByEmail, registerUserInRegistry, generateStableId, updateUserInRegistry } from '@/lib/store';
import { getProfile, updateProfile as updateDbProfile, upsertProfile } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  age?: number;
  preferred_position: User['preferred_position'];
  skill_level: User['skill_level'];
  bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: use localStorage
      initializeStore();
      const savedUser = getCurrentUser();
      setUser(savedUser);
      setLoading(false);
    } else {
      // Production mode: use Supabase Auth
      const initAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await getProfile(session.user.id);
            setUser(profile);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          setLoading(false);
        }
      };

      initAuth();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Small delay to allow profile creation to complete during registration
          await new Promise(resolve => setTimeout(resolve, 100));
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      // Demo mode: restore existing user by email or create new with stable ID
      const existing = getUserByEmail(email);
      if (existing) {
        setCurrentUser(existing);
        setUser(existing);
        return { success: true };
      }
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@tapadam.az';
      const demoUser: User = {
        id: generateStableId(email),
        email,
        full_name: email.split('@')[0],
        preferred_position: 'any',
        skill_level: 'intermediate',
        games_played: 0,
        is_admin: email.toLowerCase() === adminEmail.toLowerCase(),
        created_at: new Date().toISOString(),
      };
      setCurrentUser(demoUser);
      registerUserInRegistry(demoUser);
      setUser(demoUser);
      return { success: true };
    }

    // Production mode: Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const profile = await getProfile(data.user.id);
      setUser(profile);
    }

    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      // Demo mode: check if already registered with this email
      const existing = getUserByEmail(data.email);
      if (existing) {
        setCurrentUser(existing);
        setUser(existing);
        return { success: true };
      }
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@tapadam.az';
      const newUser: User = {
        id: generateStableId(data.email),
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        age: data.age,
        preferred_position: data.preferred_position,
        skill_level: data.skill_level,
        bio: data.bio,
        games_played: 0,
        is_admin: data.email.toLowerCase() === adminEmail.toLowerCase(),
        created_at: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      registerUserInRegistry(newUser);
      setUser(newUser);
      return { success: true };
    }

    // Production mode: Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      return { success: false, error: authError.message };
    }

    if (authData.user) {
      // Create profile directly in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone || null,
          age: data.age || null,
          preferred_position: data.preferred_position,
          skill_level: data.skill_level,
          bio: data.bio || null,
          games_played: 0,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Failed to create profile: ' + profileError.message };
      }

      setUser(profile as User);
    }

    return { success: true };
  };

  const logout = async () => {
    if (isDemoMode) {
      setCurrentUser(null);
      setUser(null);
    } else {
      await supabase.auth.signOut();
      setUser(null);
    }
    // Redirect to login page
    window.location.href = '/auth';
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = { ...user, ...updates };
      setCurrentUser(updated);
      registerUserInRegistry(updated);
      setUser(updated);
    } else {
      const updated = await updateDbProfile(user.id, updates);
      if (updated) {
        setUser(updated);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
