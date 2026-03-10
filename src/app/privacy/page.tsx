import Link from 'next/link';
import { Metadata } from 'next';
import {
  Lock,
  Database,
  Eye,
  Bell,
  Trash2,
  Scale,
  Mail,
  Shield,
  ChevronRight,
  HardDrive,
  UserCheck,
  Share2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Tapadam Football - Learn how we collect, use, and protect your personal data.',
};

const sections = [
  {
    id: 'data-collected',
    icon: Database,
    title: 'Data We Collect',
    color: 'neon-cyan',
    content: [
      {
        heading: 'Account Information',
        body: 'When you register, we collect your email address and full name. These are required to create and identify your account, send notifications, and allow other players to recognize you within the platform.',
      },
      {
        heading: 'Profile Information',
        body: 'You may optionally provide your preferred playing position (goalkeeper, defender, midfielder, forward), skill level (beginner, intermediate, advanced), age, and phone number. This information helps match you with suitable games and other players of similar ability.',
      },
      {
        heading: 'Match and Activity Data',
        body: 'We record your match history — games you have created, joined, and completed. This includes match outcomes, participation timestamps, and ratings received from other players after games.',
      },
      {
        heading: 'Player Ratings',
        body: 'After matches are completed, participants may rate each other across categories such as pace, shooting, passing, dribbling, defense, and physical. These ratings contribute to your overall player stats visible on your profile.',
      },
      {
        heading: 'Avatar and Media',
        body: 'If you upload a profile photo, this image is stored in our cloud storage (Supabase Storage) and linked to your account. You can update or remove your avatar at any time from your profile settings.',
      },
      {
        heading: 'Usage Data',
        body: 'We may collect technical information about how you interact with the platform, including pages visited, features used, and approximate session duration. This data is used in aggregate to improve the platform and is not linked to your identity for marketing purposes.',
      },
    ],
  },
  {
    id: 'how-used',
    icon: Eye,
    title: 'How We Use Your Data',
    color: 'neon-green',
    content: [
      {
        heading: 'Player Matching and Match Organization',
        body: 'Your profile data — including position preference and skill level — is used to display relevant matches, help organizers understand who is joining their games, and enable other players to assess whether a match suits their level.',
      },
      {
        heading: 'Notifications',
        body: 'We use your email address and in-app notification preferences to inform you about join request approvals or rejections, match reminders (approximately 2 hours before kick-off), match completion prompts to rate your teammates, and important platform announcements.',
      },
      {
        heading: 'Platform Communication',
        body: 'Real-time match chat messages are stored to provide continuity of conversation for all participants. Messages are visible only to the match creator and approved participants.',
      },
      {
        heading: 'Platform Improvement',
        body: 'Aggregated and anonymized usage data helps us understand how the platform is being used, identify bugs, and prioritize new features that benefit the Baku football community.',
      },
      {
        heading: 'Security and Fraud Prevention',
        body: 'We may use account and activity data to detect and prevent fraudulent accounts, abuse of the platform, or violations of our Terms of Service.',
      },
    ],
  },
  {
    id: 'storage',
    icon: HardDrive,
    title: 'Data Storage',
    color: 'neon-amber',
    content: [
      {
        heading: 'Production Mode (Supabase)',
        body: 'When the platform is operating in production mode, all user data is stored securely in Supabase — a cloud database service hosted on secure infrastructure. Supabase uses Row-Level Security (RLS) policies to ensure that each user can only access their own data or data they are explicitly permitted to see.',
      },
      {
        heading: 'Demo Mode (localStorage)',
        body: 'If you use Tapadam in demo mode (when no account credentials are provided), all data — including any match listings, profile details, and chat messages you create — is stored locally in your browser\'s localStorage. This data never leaves your device and is not transmitted to any server. Demo mode data can be cleared by clearing your browser\'s site data.',
      },
      {
        heading: 'Data Retention',
        body: 'We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required to retain it for legal or legitimate business purposes (such as dispute resolution records).',
      },
      {
        heading: 'Data Security',
        body: 'We implement industry-standard security measures including encrypted connections (HTTPS/TLS), secure API key management, and database-level access controls. While we take reasonable precautions, no internet-based service can guarantee absolute security.',
      },
    ],
  },
  {
    id: 'sharing',
    icon: Share2,
    title: 'Data Sharing',
    color: 'neon-purple',
    content: [
      {
        heading: 'We Do Not Sell Your Data',
        body: 'Tapadam does not sell, rent, or trade your personal information to third parties for commercial or marketing purposes. Your data is used exclusively to operate and improve the Tapadam platform.',
      },
      {
        heading: 'Data Visible to Other Users',
        body: 'Certain information you provide is visible to other Tapadam users as part of the platform\'s social features. This includes your display name, profile photo, preferred position, skill level, and player stats. Match history is visible on your public profile. Your email address and phone number are never shared with other users.',
      },
      {
        heading: 'Service Providers',
        body: 'We use a limited number of trusted third-party service providers to operate the platform, including Supabase (database and authentication), Cloudflare (hosting and content delivery), and email delivery services. These providers are contractually bound to process your data only as directed by us and in accordance with applicable data protection laws.',
      },
      {
        heading: 'Legal Obligations',
        body: 'We may disclose your data if required to do so by law, court order, or government authority, or if we believe disclosure is necessary to protect the safety of any person, prevent fraud, or defend our legal rights.',
      },
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications and Communications',
    color: 'neon-cyan',
    content: [
      {
        heading: 'In-App Notifications',
        body: 'Tapadam sends in-app notifications for platform events relevant to you, including match join requests, request approvals or rejections, match reminders, and post-match rating prompts. These notifications are a core part of the service and cannot be fully disabled while your account is active.',
      },
      {
        heading: 'Email Notifications',
        body: 'Match reminder emails are sent approximately 2 hours before scheduled matches. You can manage your email notification preferences from your profile settings. Transactional emails (such as password resets) cannot be disabled as they are essential for account security.',
      },
      {
        heading: 'No Marketing Emails',
        body: 'We will not send you unsolicited promotional or marketing emails without your explicit consent. Any future marketing communications will include a clear unsubscribe option.',
      },
    ],
  },
  {
    id: 'rights',
    icon: UserCheck,
    title: 'Your Rights',
    color: 'neon-green',
    content: [
      {
        heading: 'Right of Access',
        body: 'You have the right to request a copy of the personal data we hold about you. To make a data access request, contact us at support@tapadam.az. We will respond within 30 days.',
      },
      {
        heading: 'Right to Rectification',
        body: 'You can update most of your personal information directly through your profile settings. If you need assistance correcting data that you cannot update yourself, contact our support team.',
      },
      {
        heading: 'Right to Erasure (Account Deletion)',
        body: 'You have the right to request deletion of your account and associated personal data. Please contact us at support@tapadam.az to initiate the deletion process. Note that some data (such as aggregated, anonymized match statistics) may be retained in a form that does not identify you.',
      },
      {
        heading: 'Right to Data Portability',
        body: 'Upon request, we can provide you with a machine-readable export of your personal data held on the platform. Contact support@tapadam.az to request a data export.',
      },
      {
        heading: 'Right to Object',
        body: 'You may object to certain processing of your data where we rely on legitimate interests as our legal basis. Please contact us to discuss any such objection.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: Shield,
    title: 'Cookies and Local Storage',
    color: 'neon-amber',
    content: [
      {
        heading: 'Authentication Cookies',
        body: 'Tapadam uses session cookies to maintain your logged-in state. These are essential for the platform to function and are automatically deleted when you log out or close your browser session.',
      },
      {
        heading: 'localStorage',
        body: 'The platform uses your browser\'s localStorage to cache certain data for performance (such as current user session data) and, in demo mode, to store all application data locally. You can clear localStorage through your browser\'s developer tools or site settings.',
      },
      {
        heading: 'No Tracking Cookies',
        body: 'We do not use third-party tracking or advertising cookies. We do not participate in cross-site tracking or behavioural advertising networks.',
      },
    ],
  },
  {
    id: 'governing-law',
    icon: Scale,
    title: 'Governing Law',
    color: 'neon-green',
    content: [
      {
        heading: 'Jurisdiction',
        body: 'This Privacy Policy is governed by the laws of the Republic of Azerbaijan. Any disputes relating to this Privacy Policy shall be subject to the jurisdiction of the courts of the Republic of Azerbaijan.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. When we make material changes, we will notify registered users via email or in-app notification at least 14 days before the changes take effect. Continued use of the platform after changes are in effect constitutes your acceptance of the revised policy.',
      },
      {
        heading: 'Children\'s Privacy',
        body: 'Tapadam is not intended for children under the age of 16. We do not knowingly collect personal data from children under 16. If we become aware that a user under 16 has provided personal data, we will take steps to delete that information.',
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  'neon-green': 'text-neon-green',
  'neon-cyan': 'text-neon-cyan',
  'neon-amber': 'text-neon-amber',
  'neon-red': 'text-neon-red',
  'neon-purple': 'text-neon-purple',
};

const bgColorMap: Record<string, string> = {
  'neon-green': 'bg-neon-green/10 border-neon-green/20',
  'neon-cyan': 'bg-neon-cyan/10 border-neon-cyan/20',
  'neon-amber': 'bg-neon-amber/10 border-neon-amber/20',
  'neon-red': 'bg-neon-red/10 border-neon-red/20',
  'neon-purple': 'bg-neon-purple/10 border-neon-purple/20',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 mb-6">
              <Lock className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="text-xs font-semibold text-neon-cyan tracking-wider uppercase">Privacy</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              We take your privacy seriously. This policy explains exactly what data we collect, why we collect it, and how you can control it.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-slate-500">
              <span>Effective: March 2026</span>
              <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
              <span>Jurisdiction: Republic of Azerbaijan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Privacy Commitment Banner */}
          <div className="flex items-start space-x-4 p-5 rounded-xl bg-neon-green/5 border border-neon-green/15 mb-10">
            <div className="p-2.5 rounded-lg bg-neon-green/10 flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neon-green mb-1">Our Commitment</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tapadam does not sell your personal data to third parties. We collect only what is necessary to operate the platform and connect football players in Baku. You remain in control of your data at all times.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="card mb-10">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Table of Contents</h2>
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                >
                  <span className="text-xs font-mono text-slate-600 group-hover:text-slate-400 w-5 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-neon-cyan transition-colors" />
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => {
              const Icon = section.icon;
              const textColor = colorMap[section.color] || 'text-neon-green';
              const badgeBg = bgColorMap[section.color] || 'bg-neon-green/10 border-neon-green/20';

              return (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  {/* Section Header */}
                  <div className={`flex items-center space-x-3 p-4 rounded-xl border ${badgeBg} mb-6`}>
                    <div className="p-2 rounded-lg bg-white/5">
                      <Icon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <h2 className={`font-heading text-xl font-bold ${textColor}`}>
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Content */}
                  <div className="space-y-5 pl-2">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-start space-x-2">
                          <span
                            className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${textColor.replace('text-', 'bg-')}`}
                            style={{ marginTop: '6px' }}
                          />
                          <span>{item.heading}</span>
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed ml-3.5">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Data Deletion CTA */}
          <div className="mt-14 card">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-neon-red/10 border border-neon-red/20 flex-shrink-0">
                <Trash2 className="w-6 h-6 text-neon-red" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-white mb-2">Request Account Deletion</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  You have the right to have your account and personal data permanently deleted from Tapadam. Send us a deletion request and we will process it within 30 days.
                </p>
                <a
                  href="mailto:support@tapadam.az?subject=Account%20Deletion%20Request"
                  className="inline-flex items-center space-x-2 text-neon-red hover:text-neon-red/80 font-semibold text-sm transition-colors group"
                >
                  <Mail className="w-4 h-4" />
                  <span>Request Deletion via Email</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-6 card glow-border">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex-shrink-0">
                <Mail className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-white mb-2">Privacy Questions?</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, want to exercise your data rights, or have concerns about how your data is being used, contact our support team.
                </p>
                <a
                  href="mailto:support@tapadam.az"
                  className="inline-flex items-center space-x-2 text-neon-cyan hover:text-neon-cyan/80 font-semibold text-sm transition-colors group"
                >
                  <Mail className="w-4 h-4" />
                  <span>support@tapadam.az</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Nav */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 border-t border-white/5 pt-8">
            <span>Last updated: March 2026</span>
            <div className="flex items-center space-x-4">
              <Link href="/terms" className="hover:text-neon-cyan transition-colors">
                Terms of Service
              </Link>
              <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
              <Link href="/" className="hover:text-neon-cyan transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
