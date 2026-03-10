'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Calendar,
  Loader2,
  Eye,
  EyeOff,
  Crosshair,
  Trophy,
  FileText,
  Zap,
} from 'lucide-react';

type Tab = 'login' | 'register';

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState(searchParams.get('error') || '');
  const [tabTransitioning, setTabTransitioning] = useState(false);

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regPosition, setRegPosition] = useState<'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any'>('any');
  const [regSkill, setRegSkill] = useState<'beginner' | 'intermediate' | 'advanced' | 'professional'>('intermediate');
  const [regBio, setRegBio] = useState('');

  const switchTab = (newTab: Tab) => {
    if (newTab === tab) return;
    setTabTransitioning(true);
    setError('');
    setTimeout(() => {
      setTab(newTab);
      setTimeout(() => setTabTransitioning(false), 50);
    }, 150);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await login('demo@tapadam.com', 'demo123');
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Demo login failed.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await register({
        email: regEmail,
        password: regPassword,
        full_name: regName,
        phone: regPhone || undefined,
        age: regAge ? parseInt(regAge) : undefined,
        preferred_position: regPosition,
        skill_level: regSkill,
        bio: regBio || undefined,
      });

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (isDemoMode) {
      setError('OAuth is not available in demo mode. Use email/password instead.');
      return;
    }

    setOauthLoading(provider);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setOauthLoading(null);
      }
    } catch {
      setError('An error occurred with OAuth. Please try again.');
      setOauthLoading(null);
    }
  };

  const BIO_MAX = 200;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-neon-green/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-neon-cyan/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-neon-green/5 blur-[180px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.4) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Football emoji accent */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', boxShadow: '0 0 20px rgba(0,255,136,0.1)' }}>
            ⚽
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Welcome to <span className="text-gradient-animated">Tapadam</span>
          </h1>
          <p className="text-sm text-white/40">
            Find players, join matches, dominate the pitch
          </p>
        </div>

        {/* Glass card */}
        <div className="auth-card glass rounded-2xl p-6 shadow-card animate-slide-up" style={{ borderColor: 'rgba(0,255,136,0.08)', boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.06)' }}>
          {/* Tab Switcher with sliding indicator */}
          <div className="relative flex mb-6 rounded-xl p-1" style={{ background: 'rgba(10,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Sliding background indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
              style={{
                left: tab === 'login' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
                background: 'linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(0,212,255,0.08) 100%)',
                border: '1px solid rgba(0,255,136,0.25)',
                boxShadow: '0 0 12px rgba(0,255,136,0.08)',
              }}
            />
            <button
              onClick={() => switchTab('login')}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors duration-300 ${
                tab === 'login' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors duration-300 ${
                tab === 'register' ? 'text-neon-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Tab content with transition */}
          <div
            className={`transition-all duration-200 ease-out ${
              tabTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Login Form */}
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Demo Quick Login */}
                {isDemoMode && (
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold
                      bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/20
                      text-neon-green hover:from-neon-green/20 hover:to-neon-cyan/20 hover:border-neon-green/40
                      hover:shadow-glow-green-sm transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>Quick Demo Login</span>
                  </button>
                )}

                {isDemoMode && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-gray-500">or use email</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="********"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-surface-light bg-dark-950 text-neon-green accent-[#00ff88]"
                    />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <button type="button" className="text-neon-green hover:underline text-xs">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Demo Quick Login hint */}
                {isDemoMode && (
                  <div className="p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/15 text-xs text-neon-cyan/70">
                    Demo mode: registration creates a local account instantly.
                  </div>
                )}

                {/* Personal Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 rounded-full bg-neon-green" style={{ boxShadow: '0 0 6px rgba(0,255,136,0.5)' }} />
                    <p className="text-xs font-bold uppercase tracking-widest text-neon-green/70">Personal Info</p>
                  </div>
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="input pl-10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="input pl-10"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="input pl-10 pr-10"
                        placeholder="********"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="input pl-10"
                          placeholder="+994..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          className="input pl-10"
                          placeholder="25"
                          min={16}
                          max={70}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 6px rgba(0,212,255,0.5)' }} />
                    <p className="text-xs font-bold uppercase tracking-widest text-neon-cyan/70">Game Info</p>
                  </div>
                  <div>
                    <label className="label">Preferred Position</label>
                    <div className="relative">
                      <Crosshair className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value as typeof regPosition)}
                        className="input pl-10 appearance-none"
                      >
                        <option value="any">Any Position</option>
                        <option value="goalkeeper">Goalkeeper</option>
                        <option value="defender">Defender</option>
                        <option value="midfielder">Midfielder</option>
                        <option value="forward">Forward</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Skill Level</label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select
                        value={regSkill}
                        onChange={(e) => setRegSkill(e.target.value as typeof regSkill)}
                        className="input pl-10 appearance-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Bio (optional)
                      </span>
                    </label>
                    <textarea
                      value={regBio}
                      onChange={(e) => {
                        if (e.target.value.length <= BIO_MAX) {
                          setRegBio(e.target.value);
                        }
                      }}
                      className="input"
                      rows={3}
                      placeholder="Tell us about yourself..."
                      maxLength={BIO_MAX}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {regBio.length}/{BIO_MAX}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* OAuth Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
            <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium
                bg-white/5 border border-white/10 text-gray-300
                hover:bg-white/10 hover:border-neon-green/20 hover:text-white
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium
                bg-white/5 border border-white/10 text-gray-300
                hover:bg-white/10 hover:border-neon-green/20 hover:text-white
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              )}
              <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          By continuing, you agree to the Tapadam Terms of Service
        </p>
      </div>
    </div>
  );
}
