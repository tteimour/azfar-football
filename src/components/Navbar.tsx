'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import NotificationBadge from './NotificationBadge';
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  Trophy,
  MapPin,
  Shield,
  PlusCircle,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [topNavVisible, setTopNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);

      // Hide/show top nav on mobile based on scroll direction
      if (currentY > lastScrollY.current && currentY > 60) {
        setTopNavVisible(false);
      } else {
        setTopNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/rooms', label: 'Matches', icon: Trophy },
    { href: '/stadiums', label: 'Stadiums', icon: MapPin },
  ];

  const bottomNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/rooms', label: 'Matches', icon: Trophy },
    { href: '/rooms/create', label: 'Create', icon: PlusCircle, isCreate: true },
    { href: '/stadiums', label: 'Stadiums', icon: MapPin },
    { href: user ? '/profile' : '/auth', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-dark-900/80 backdrop-blur-xl border-b border-white/5'
        } ${
          topNavVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-heading font-bold text-neon-green drop-shadow-[0_0_10px_rgba(0,255,136,0.3)] group-hover:drop-shadow-[0_0_16px_rgba(0,255,136,0.5)] transition-all duration-300">
                TAPADAM
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-white bg-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${active ? 'text-neon-green' : ''}`} />
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-neon-green rounded-full shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
                    )}
                  </Link>
                );
              })}

              {/* Admin link */}
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/admin')
                      ? 'text-white bg-white/10'
                      : 'text-neon-amber/70 hover:text-neon-amber hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <NotificationBadge />
                  <Link
                    href="/profile"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/profile')
                        ? 'text-white bg-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-neon-green" />
                      </div>
                    )}
                    <span className="max-w-[120px] truncate">{user.full_name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-neon-red hover:bg-white/5 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="btn-primary text-sm px-5 py-2"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile: Notification + Menu Button (visible only when top nav is showing, hidden by bottom nav otherwise) */}
            <div className="flex md:hidden items-center space-x-2">
              {user && <NotificationBadge />}
              <button
                className="p-2 text-white/60 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-dark-900/95 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-lg font-heading font-bold text-neon-green">
            TAPADAM
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col p-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-white bg-white/10 border-l-2 border-neon-green'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className={`w-5 h-5 ${active ? 'text-neon-green' : ''}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user?.is_admin && (
            <Link
              href="/admin"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/admin')
                  ? 'text-white bg-white/10 border-l-2 border-neon-amber'
                  : 'text-neon-amber/70 hover:text-neon-amber hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Shield className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}

          <div className="border-t border-white/10 my-3" />

          {user ? (
            <>
              <Link
                href="/profile"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/profile')
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-neon-green" />
                  </div>
                )}
                <span>{user.full_name}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-white/40 hover:text-neon-red hover:bg-white/5 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="btn-primary text-center text-sm mx-4 mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          className="flex items-end justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          style={{
            background: 'linear-gradient(180deg, rgba(10,14,26,0.95) 0%, rgba(15,22,41,0.98) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {bottomNavLinks.map((link) => {
            const active = isActive(link.href);

            if (link.isCreate) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center -mt-5"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                      boxShadow: '0 0 20px rgba(0,255,136,0.4), 0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <PlusCircle className="w-7 h-7 text-dark-950" />
                  </div>
                  <span className="text-[10px] mt-1 text-neon-green font-semibold">Create</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center py-1 px-3 min-w-[60px]"
              >
                <div className="relative">
                  <link.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active ? 'text-neon-green' : 'text-slate-500'
                    }`}
                  />
                  {active && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-green"
                      style={{ boxShadow: '0 0 6px rgba(0,255,136,0.6)' }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors duration-200 ${
                    active ? 'text-neon-green' : 'text-slate-500'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
