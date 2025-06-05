// src/app/privacy/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, UserCheck, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const sections = [
    {
      id: 'overview',
      title: '1. Privacy Overview',
      icon: <Shield className="w-5 h-5" />,
      content: `At Scam Sleuth, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, process, and protect your data when you use our platform.

We believe in transparency and want you to understand exactly what information we collect and why. Your trust is essential to our mission of creating a safer digital environment.`
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      icon: <Database className="w-5 h-5" />,
      content: `We collect several types of information to provide and improve our services:

Personal Information:
• Name and email address (required for account creation)
• Username and profile information
• Contact information when you reach out to us
• Profile pictures (optional)

Account and Usage Data:
• Login credentials and authentication information
• Account preferences and settings
• Usage patterns and interaction history
• Device information (browser type, operating system, IP address)
• Cookies and similar tracking technologies

Content You Submit:
• Scam reports and descriptions
• Comments and reviews
• Uploaded files and media (screenshots, documents)
• Communication with our support team

Automatically Collected Information:
• Log files and server data
• Analytics data (page views, click patterns, time spent)
• Error reports and diagnostic information
• Location data (approximate, based on IP address)`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      icon: <Eye className="w-5 h-5" />,
      content: `We use the collected information for the following purposes:

Service Operation:
• Create and manage your user account
• Process and display scam reports
• Provide website analysis and safety scores
• Enable communication between users
• Verify the authenticity of reports

Platform Improvement:
• Analyze usage patterns to improve our services
• Develop new features and functionality
• Enhance security and fraud detection
• Optimize user experience and interface design

Communication:
• Send important account notifications
• Provide customer support and assistance
• Share platform updates and security alerts
• Respond to your inquiries and feedback

Legal and Safety:
• Comply with legal obligations and law enforcement requests
• Protect against fraud, abuse, and unauthorized access
• Enforce our Terms of Service
• Maintain platform integrity and user safety`
    },
    {
      id: 'information-sharing',
      title: '4. Information Sharing and Disclosure',
      icon: <Globe className="w-5 h-5" />,
      content: `We are committed to protecting your privacy and do not sell your personal information. We may share information in the following limited circumstances:

Public Information:
• Scam reports you choose to make public (usernames may be displayed)
• Profile information you choose to make visible
• Comments and reviews you post publicly

Service Providers:
• Trusted third-party services that help us operate our platform
• Cloud hosting and data storage providers
• Analytics and monitoring services
• Email and communication services

Legal Requirements:
• When required by law, court order, or government request
• To protect our rights, property, or safety
• To prevent or investigate fraud or illegal activities
• In connection with legal proceedings

Business Transfers:
• In case of merger, acquisition, or sale of assets
• Data may be transferred as part of business transactions
• Users will be notified of any such changes

With Your Consent:
• Any other sharing will only occur with your explicit consent
• You can withdraw consent at any time`
    },
    {
      id: 'data-security',
      title: '5. Data Security and Protection',
      icon: <Lock className="w-5 h-5" />,
      content: `We implement comprehensive security measures to protect your information:

Technical Safeguards:
• Industry-standard encryption for data transmission (SSL/TLS)
• Secure data storage with encryption at rest
• Regular security audits and penetration testing
• Multi-factor authentication options
• Automated threat detection and monitoring

Access Controls:
• Limited access to personal data on a need-to-know basis
• Employee background checks and privacy training
• Secure development practices and code reviews
• Regular access reviews and permission updates

Data Backup and Recovery:
• Regular encrypted backups of all data
• Disaster recovery procedures and testing
• Data redundancy across multiple secure locations

Incident Response:
• Dedicated security team for threat monitoring
• Incident response plan for potential breaches
• Prompt notification procedures for affected users
• Continuous improvement of security measures`
    },
    {
      id: 'data-retention',
      title: '6. Data Retention and Deletion',
      icon: <Database className="w-5 h-5" />,
      content: `We retain your information only as long as necessary for legitimate purposes:

Account Information:
• Maintained while your account is active
• Deleted within 30 days of account deletion request
• Some information may be retained for legal compliance

Scam Reports:
• Public reports may be retained to maintain platform integrity
• Personal identifiers are removed or anonymized
• Users can request removal of their reports

Usage Data:
• Analytics data is retained for up to 2 years
• Log files are automatically deleted after 1 year
• Aggregated, anonymized data may be retained longer

Legal Requirements:
• Some data may be retained longer for legal compliance
• Law enforcement requests may require extended retention
• Financial records may be kept for tax and regulatory purposes

Data Deletion:
• You can request deletion of your personal data at any time
• We will respond to deletion requests within 30 days
• Some anonymized data may remain for platform operation`
    },
    {
      id: 'user-rights',
      title: '7. Your Rights and Choices',
      icon: <UserCheck className="w-5 h-5" />,
      content: `You have several rights regarding your personal information:

Access and Portability:
• Request a copy of all personal data we have about you
• Download your data in a machine-readable format
• View and edit your profile information anytime

Correction and Updates:
• Update your personal information through account settings
• Request correction of inaccurate information
• Modify privacy preferences and communication settings

Deletion and Erasure:
• Delete your account and associated personal data
• Request removal of specific content or information
• Opt out of certain data collection practices

Communication Preferences:
• Unsubscribe from marketing emails
• Control notification settings
• Choose what information to make public

Data Processing:
• Object to certain types of data processing
• Request limitation of processing in specific circumstances
• Withdraw consent for optional data collection

To exercise these rights, contact us at privacy@scamsleuth.com or through your account settings.`
    },
    {
      id: 'cookies',
      title: '8. Cookies and Tracking Technologies',
      icon: <Globe className="w-5 h-5" />,
      content: `We use cookies and similar technologies to enhance your experience:

Types of Cookies:
• Essential cookies: Required for basic platform functionality
• Analytics cookies: Help us understand how you use our platform
• Preference cookies: Remember your settings and preferences
• Security cookies: Protect against fraud and unauthorized access

Third-Party Services:
• Analytics providers (Google Analytics, etc.)
• Social media integration
• Advertisement and marketing services
• Security and fraud prevention tools

Cookie Management:
• You can control cookie settings through your browser
• Most browsers allow you to block or delete cookies
• Some features may not work properly without cookies
• We provide cookie preference controls in your account settings

Do Not Track:
• We respect browser "Do Not Track" signals where possible
• Some third-party services may not honor these signals
• You can opt out of analytics tracking in your account settings`
    },
    {
      id: 'children-privacy',
      title: '9. Children\'s Privacy',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: `Scam Sleuth is not intended for children under the age of 13:

Age Restrictions:
• Our platform is designed for users 13 years and older
• We do not knowingly collect information from children under 13
• Users must verify they meet age requirements during registration

Parental Rights:
• Parents can request deletion of their child's information
• We will verify parental identity before processing requests
• Parents can contact us to review their child's data

Discovery of Underage Users:
• If we discover a user is under 13, we will delete their account
• No personal information will be retained
• Parents will be notified if possible

Educational Content:
• We may provide age-appropriate safety education
• Such content does not require personal information collection
• Parents are encouraged to supervise online activities`
    },
    {
      id: 'international',
      title: '10. International Data Transfers',
      icon: <Globe className="w-5 h-5" />,
      content: `Scam Sleuth operates globally and may transfer data internationally:

Data Transfer Locations:
• Primary data processing occurs in [Your Primary Location]
• Some services may process data in other countries
• We ensure adequate protection regardless of location

Protection Measures:
• Standard Contractual Clauses for EU data transfers
• Adequate safeguards for all international transfers
• Compliance with applicable data protection laws
• Regular reviews of transfer mechanisms

User Rights:
• EU users have rights under GDPR
• California users have rights under CCPA
• We respect all applicable privacy regulations
• Contact us for region-specific privacy information

Legal Compliance:
• We comply with local data protection laws
• Regular legal reviews of international operations
• Cooperation with relevant privacy authorities
• Transparent reporting of data processing activities`
    },
    {
      id: 'updates',
      title: '11. Policy Updates and Changes',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: `We may update this Privacy Policy periodically:

Notification of Changes:
• Material changes will be announced 30 days in advance
• Email notifications to all registered users
• Prominent notice on our platform
• Updated "Last Modified" date at the top of this policy

Types of Updates:
• Changes in data collection practices
• New features or services
• Legal or regulatory requirements
• Security enhancements

Your Continued Use:
• Continued use after changes indicates acceptance
• You can delete your account if you disagree with updates
• We encourage regular review of this policy
• Contact us with questions about any changes`
    },
    {
      id: 'contact',
      title: '12. Contact Information',
      icon: <UserCheck className="w-5 h-5" />,
      content: `For privacy-related questions or concerns, contact us:

Privacy Team:
• Email: privacy@scamsleuth.com
• Response time: Within 48 hours for urgent matters
• Regular inquiries: Within 5 business days

General Contact:
• Email: support@scamsleuth.com
• Phone: +1-800-SCAM-SLEUTH (1-800-722-6758)
• Online: Contact form at scamsleuth.com/contact

Data Protection Officer:
• Available for EU users and complex privacy matters
• Email: dpo@scamsleuth.com
• Handles formal complaints and data protection inquiries

Mailing Address:
[Your Business Address]
[City, State, ZIP Code]
[Country]`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-black to-red text-white py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:text-red hover:bg-white/10 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red rounded-full animate-pulse"></div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mt-4">
            Learn how we collect, use, and protect your personal information on Scam Sleuth.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-cardWhite rounded-2xl shadow-lg p-6 md:p-8 lg:p-12">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 font-medium">
              <strong>Last Updated:</strong> June 5, 2025
            </p>
            <p className="text-green-700 text-sm mt-1">
              This Privacy Policy is effective immediately and applies to all users of the Scam Sleuth platform.
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Privacy Matters</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Scam Sleuth, we understand that privacy is fundamental to trust. This Privacy Policy 
              explains in detail how we handle your personal information, what rights you have, and 
              how we protect your data.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to being transparent about our data practices and giving you control 
              over your personal information. If you have any questions after reading this policy, 
              please don&apos;t hesitate to contact us.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 text-sm">
                <strong>Quick Summary:</strong> We only collect information necessary to operate our platform 
                and protect users from scams. We never sell your personal data, and you have full control 
                over your information.
              </p>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                </div>
                <div className="ml-11">
                  <div className="space-y-3">
                    {section.content.split('\n').map((paragraph, pIndex) => {
                      const trimmedParagraph = paragraph.trim();
                      
                      if (trimmedParagraph.startsWith('•')) {
                        return (
                          <div key={pIndex} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-1">•</span>
                            <span className="text-gray-700 leading-relaxed">
                              {trimmedParagraph.substring(1).trim()}
                            </span>
                          </div>
                        );
                      } else if (trimmedParagraph.endsWith(':') && !trimmedParagraph.includes(' ')) {
                        return (
                          <h4 key={pIndex} className="font-semibold text-gray-800 mt-4 mb-2">
                            {trimmedParagraph}
                          </h4>
                        );
                      } else if (trimmedParagraph.length > 0) {
                        return (
                          <p key={pIndex} className="text-gray-700 leading-relaxed">
                            {trimmedParagraph}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Commitment */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Our Privacy Commitment</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We are committed to protecting your privacy and earning your trust. Your personal 
                  information is never sold to third parties, and we use it solely to provide you 
                  with the best possible scam protection service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you have any concerns about how we handle your data or want to exercise your 
                  privacy rights, please reach out to our privacy team. We&apos;re here to help and 
                  ensure your experience with Scam Sleuth is safe and secure.
                </p>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/terms')}
              className="hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
            >
              View Terms of Service
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/contact')}
              className="hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
            >
              Contact Privacy Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}