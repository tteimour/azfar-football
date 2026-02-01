'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { User as UserIcon, Mail, Lock, Phone, Calendar, Loader2 } from 'lucide-react';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              tab === 'login'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              tab === 'register'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="********"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Login</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="********"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            <div>
              <label className="label">Preferred Position</label>
              <select
                value={regPosition}
                onChange={(e) => setRegPosition(e.target.value as typeof regPosition)}
                className="input"
              >
                <option value="any">Any Position</option>
                <option value="goalkeeper">Goalkeeper</option>
                <option value="defender">Defender</option>
                <option value="midfielder">Midfielder</option>
                <option value="forward">Forward</option>
              </select>
            </div>
            <div>
              <label className="label">Skill Level</label>
              <select
                value={regSkill}
                onChange={(e) => setRegSkill(e.target.value as typeof regSkill)}
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="label">Bio (optional)</label>
              <textarea
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                className="input"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
