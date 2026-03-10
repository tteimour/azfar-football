import Link from 'next/link';
import { FileText, Lock, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="hidden md:block border-t border-white/5"
      style={{
        background: 'linear-gradient(180deg, rgba(10,14,26,0) 0%, rgba(10,14,26,0.8) 100%)',
      }}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <span
                className="text-xl font-heading font-bold text-neon-green"
                style={{ textShadow: '0 0 10px rgba(0,255,136,0.3)' }}
              >
                TAPADAM
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Find players and organize football matches at premium stadiums in Baku, Azerbaijan.
            </p>
            <div className="flex items-center space-x-1.5 mt-3 text-slate-600 text-xs">
              <MapPin className="w-3 h-3" />
              <span>Baku, Azerbaijan</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Platform</h3>
            <ul className="space-y-2">
              {[
                { href: '/rooms', label: 'Browse Matches' },
                { href: '/rooms/create', label: 'Create a Match' },
                { href: '/stadiums', label: 'Stadiums' },
                { href: '/auth', label: 'Sign In' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-neon-green transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="flex items-center space-x-2 text-sm text-slate-500 hover:text-neon-green transition-colors duration-200 group"
                >
                  <FileText className="w-3.5 h-3.5 group-hover:text-neon-green transition-colors" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center space-x-2 text-sm text-slate-500 hover:text-neon-green transition-colors duration-200 group"
                >
                  <Lock className="w-3.5 h-3.5 group-hover:text-neon-green transition-colors" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@tapadam.az"
                  className="flex items-center space-x-2 text-sm text-slate-500 hover:text-neon-green transition-colors duration-200 group"
                >
                  <Mail className="w-3.5 h-3.5 group-hover:text-neon-green transition-colors" />
                  <span>support@tapadam.az</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>&copy; {currentYear} Tapadam Football. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span className="w-0.5 h-3 bg-slate-700 rounded-full inline-block" />
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <span className="w-0.5 h-3 bg-slate-700 rounded-full inline-block" />
            <a href="mailto:support@tapadam.az" className="hover:text-slate-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
