import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark backgrounds
        dark: {
          950: '#0a0e1a',
          900: '#0f1629',
          800: '#111827',
          700: '#1a1f36',
        },
        // Surfaces
        surface: {
          DEFAULT: '#1e293b',
          light: '#334155',
          lighter: '#475569',
        },
        // Neon accents
        neon: {
          green: '#00ff88',
          cyan: '#00d4ff',
          amber: '#ffaa00',
          red: '#ff4444',
          purple: '#8b5cf6',
        },
        // Legacy alias
        azfar: {
          green: '#00ff88',
          dark: '#0a0e1a',
          light: '#0f1629',
        },
      },
      fontFamily: {
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-rajdhani)', 'Rajdhani', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glass-strong-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'green-glow-gradient': 'linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(0,212,255,0.05) 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,22,41,0.8) 100%)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)',
        'glow-green-sm': '0 0 10px rgba(0,255,136,0.2)',
        'glow-green-lg': '0 0 30px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.15)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)',
        'glow-cyan-sm': '0 0 10px rgba(0,212,255,0.2)',
        'glow-amber': '0 0 20px rgba(255,170,0,0.3), 0 0 40px rgba(255,170,0,0.1)',
        'glow-red': '0 0 20px rgba(255,68,68,0.3), 0 0 40px rgba(255,68,68,0.1)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,136,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-green': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;
