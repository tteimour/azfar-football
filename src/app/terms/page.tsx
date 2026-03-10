import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, Shield, Users, CreditCard, Scale, Mail, AlertTriangle, Globe, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Tapadam Football - Read our terms and conditions for using the platform.',
};

const sections = [
  {
    id: 'overview',
    icon: Globe,
    title: 'Platform Overview',
    color: 'neon-green',
    content: [
      {
        heading: 'What is Tapadam?',
        body: 'Tapadam Football ("Tapadam", "we", "us", or "our") is an online platform that helps football players in Baku, Azerbaijan connect with each other, organize matches, and discover available stadiums. We are a match-organizing platform — not a sports facility, stadium operator, or sports club.',
      },
      {
        heading: 'Scope of Service',
        body: 'Our service enables users to create match listings, request to join matches organized by others, communicate with fellow participants, and discover stadium locations. Tapadam does not own, operate, or manage any physical stadium or sports facility listed on the platform.',
      },
      {
        heading: 'Acceptance of Terms',
        body: 'By accessing or using Tapadam, you confirm that you are at least 16 years of age, that you have read and understood these Terms, and that you agree to be bound by them. If you do not agree, please discontinue use of the platform immediately.',
      },
    ],
  },
  {
    id: 'accounts',
    icon: Users,
    title: 'User Account Responsibilities',
    color: 'neon-cyan',
    content: [
      {
        heading: 'Account Registration',
        body: 'To create matches or join games, you must register an account. You agree to provide accurate, current, and complete information during registration and to keep your account details up to date. You are responsible for maintaining the confidentiality of your login credentials.',
      },
      {
        heading: 'Account Security',
        body: 'You are solely responsible for all activity that occurs under your account. If you suspect unauthorized use of your account, notify us immediately at support@tapadam.az. Tapadam is not liable for any loss resulting from unauthorized account access caused by your failure to protect your credentials.',
      },
      {
        heading: 'Accurate Profile Information',
        body: 'You agree to represent your skill level, preferred position, and other profile details honestly. Misrepresenting your abilities in order to gain access to matches above or below your actual level is a violation of these Terms and may result in account suspension.',
      },
      {
        heading: 'One Account Per Person',
        body: 'Each individual may maintain only one active Tapadam account. Creating duplicate or fake accounts is prohibited. Tapadam reserves the right to merge, suspend, or terminate accounts found to be duplicates.',
      },
    ],
  },
  {
    id: 'matches',
    icon: FileText,
    title: 'Match Creation and Cancellation',
    color: 'neon-amber',
    content: [
      {
        heading: 'Creating a Match',
        body: 'When you create a match ("room"), you take on the role of the match organizer. You are responsible for providing accurate information about the venue, date, time, player limit, and any fees. You must have confirmed or reasonable access to the listed stadium before publishing a match.',
      },
      {
        heading: 'Joining a Match',
        body: 'Joining a match is subject to approval by the organizer. Being approved for a match constitutes a commitment to attend. Repeated no-shows may result in restrictions on your ability to join future matches.',
      },
      {
        heading: 'Cancellation by Organizer',
        body: 'If you need to cancel a match you have created, you must do so as early as possible and notify all approved participants through the platform. Organizing matches with the intent to cancel them, or repeatedly cancelling matches at short notice, may result in account restrictions.',
      },
      {
        heading: 'Cancellation by Participant',
        body: 'If you can no longer attend a match you have joined, you should withdraw your participation promptly to allow waitlisted players to fill your spot. Excessive last-minute withdrawals may affect your standing on the platform.',
      },
      {
        heading: 'Match Modifications',
        body: 'Organizers may modify match details (time, location) only before the match begins and must notify all participants of any changes. Participants who find the changes unacceptable may withdraw without penalty.',
      },
    ],
  },
  {
    id: 'conduct',
    icon: Shield,
    title: 'Participant Conduct',
    color: 'neon-purple',
    content: [
      {
        heading: 'Fair Play',
        body: 'All participants are expected to play fairly and within the spirit of the game. Aggressive, violent, or unsportsmanlike behavior — on or off the pitch — may be reported to Tapadam and may result in account suspension or permanent removal from the platform.',
      },
      {
        heading: 'Punctuality',
        body: 'Participants are expected to arrive on time for matches they have joined. Repeated lateness that disrupts organized matches is a violation of community standards. The match organizer may remove participants who are consistently late.',
      },
      {
        heading: 'Respect',
        body: 'All users must treat other players, organizers, and stadium staff with respect. Harassment, discrimination, hate speech, or abusive language — whether in the chat, profile content, or match descriptions — is strictly prohibited.',
      },
      {
        heading: 'Prohibited Conduct',
        body: 'You must not use the platform to: spam other users, post false or misleading match listings, impersonate another person, engage in unauthorized data collection, or attempt to disrupt the platform\'s technical infrastructure.',
      },
      {
        heading: 'Reporting Violations',
        body: 'If you experience or witness a violation of these conduct standards, please report it to us at support@tapadam.az. We will investigate all reports and take appropriate action.',
      },
    ],
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Payment and Stadium Fees',
    color: 'neon-amber',
    content: [
      {
        heading: 'Tapadam Does Not Process Payments',
        body: 'Tapadam is not a payment processor. All financial arrangements — including stadium rental fees, per-player contributions, and any other costs — are agreed upon and settled directly between match participants and stadium operators, outside of the Tapadam platform.',
      },
      {
        heading: 'Fee Transparency',
        body: 'Match organizers are encouraged to clearly state the cost per player and any other financial expectations in the match listing. Tapadam does not guarantee the accuracy of any fee information displayed and is not liable for any payment disputes.',
      },
      {
        heading: 'No Tapadam Fee',
        body: 'Tapadam currently provides its platform services free of charge. We reserve the right to introduce optional premium features in the future, at which point separate terms and pricing will be communicated clearly.',
      },
      {
        heading: 'Payment Disputes',
        body: 'Any financial disputes between users, or between users and stadium operators, must be resolved directly between the parties involved. Tapadam will not mediate, arbitrate, or bear liability for any such disputes.',
      },
    ],
  },
  {
    id: 'ip',
    icon: FileText,
    title: 'Intellectual Property',
    color: 'neon-cyan',
    content: [
      {
        heading: 'Tapadam Content',
        body: 'All content created by Tapadam — including the platform design, logo, software code, text, and graphics — is the exclusive intellectual property of Tapadam and its licensors. You may not reproduce, distribute, or create derivative works without our prior written consent.',
      },
      {
        heading: 'User-Generated Content',
        body: 'By submitting content to Tapadam (profile information, match descriptions, chat messages), you grant us a non-exclusive, royalty-free, worldwide license to use, store, and display that content for the purpose of operating the platform. You retain ownership of your content.',
      },
      {
        heading: 'Restrictions',
        body: 'You must not upload content that infringes on the intellectual property rights of others. If you believe your intellectual property rights have been violated by content on our platform, contact us at support@tapadam.az.',
      },
    ],
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    title: 'Limitation of Liability',
    color: 'neon-red',
    content: [
      {
        heading: 'Platform Provided "As Is"',
        body: 'Tapadam provides its platform on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the reliability, accuracy, or fitness for a particular purpose of our services.',
      },
      {
        heading: 'No Liability for Physical Injury',
        body: 'Football is a contact sport with inherent risks. Tapadam is not responsible for any injuries, accidents, or health issues that occur during matches organized through our platform. Participants engage in physical activity at their own risk.',
      },
      {
        heading: 'No Liability for Third-Party Actions',
        body: 'Tapadam is not liable for the actions, omissions, or conduct of any user, stadium operator, or third party connected to matches organized through our platform.',
      },
      {
        heading: 'No Liability for Service Interruptions',
        body: 'We do not guarantee uninterrupted access to the platform. We are not liable for any loss or inconvenience arising from temporary service outages, maintenance, or technical failures beyond our reasonable control.',
      },
      {
        heading: 'Limitation of Damages',
        body: 'To the maximum extent permitted by applicable law, Tapadam\'s total liability for any claim arising from the use of our platform shall not exceed the amount paid by you to Tapadam in the twelve months preceding the claim, or AZN 50, whichever is greater.',
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
        body: 'These Terms of Service are governed by and construed in accordance with the laws of the Republic of Azerbaijan. Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of the Republic of Azerbaijan.',
      },
      {
        heading: 'Amendments',
        body: 'Tapadam reserves the right to update these Terms at any time. We will notify registered users of material changes via email or an in-app notification. Continued use of the platform following notification of changes constitutes your acceptance of the revised Terms.',
      },
      {
        heading: 'Severability',
        body: 'If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.',
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

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-cyan/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 mb-6">
              <FileText className="w-3.5 h-3.5 text-neon-green" />
              <span className="text-xs font-semibold text-neon-green tracking-wider uppercase">Legal</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Please read these terms carefully before using Tapadam Football. By creating an account or joining a match, you agree to the following conditions.
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
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-neon-green transition-colors" />
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
                    <div className={`p-2 rounded-lg bg-white/5`}>
                      <Icon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <h2 className={`font-heading text-xl font-bold ${textColor}`}>
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Content */}
                  <div className="space-y-5 pl-2">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="group">
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-start space-x-2">
                          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${textColor.replace('text-', 'bg-')}`} style={{ marginTop: '6px' }} />
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

          {/* Contact Section */}
          <div className="mt-14 card glow-border">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/20 flex-shrink-0">
                <Mail className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-white mb-2">Questions or Concerns?</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, or if you need to report a violation or account issue, our support team is here to help.
                </p>
                <a
                  href="mailto:support@tapadam.az"
                  className="inline-flex items-center space-x-2 text-neon-green hover:text-neon-green/80 font-semibold text-sm transition-colors group"
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
              <Link href="/privacy" className="hover:text-neon-green transition-colors">
                Privacy Policy
              </Link>
              <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
              <Link href="/" className="hover:text-neon-green transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
