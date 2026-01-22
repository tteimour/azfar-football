'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getCurrentUser, setCurrentUser, initializeStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
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
    initializeStore();
    const savedUser = getCurrentUser();
    setUser(savedUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo mode: accept any email/password and create a demo user
    const demoUser: User = {
      id: Date.now().toString(),
      email,
      full_name: email.split('@')[0],
      preferred_position: 'any',
      skill_level: 'intermediate',
      games_played: 0,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(demoUser);
    setUser(demoUser);
    return true;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      age: data.age,
      preferred_position: data.preferred_position,
      skill_level: data.skill_level,
      bio: data.bio,
      games_played: 0,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setCurrentUser(updated);
      setUser(updated);
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
