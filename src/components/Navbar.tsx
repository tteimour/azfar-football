'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import NotificationBadge from './NotificationBadge';
import { Menu, X, User, LogOut, Home, Users } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/rooms', label: 'Matches', icon: Users },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Zapolya Football</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 ${
                  isActive(link.href) ? 'nav-link-active' : 'nav-link'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBadge />
                <Link
                  href="/profile"
                  className={`flex items-center space-x-2 ${
                    isActive('/profile') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{user.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link href="/auth" className="btn-primary">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 py-2 ${
                    isActive(link.href) ? 'nav-link-active' : 'nav-link'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center space-x-2 py-2 ${
                      isActive('/profile') ? 'nav-link-active' : 'nav-link'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
