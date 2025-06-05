// src/app/terms/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Users, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const router = useRouter();

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: <FileText className="w-5 h-5" />,
      content: `By accessing and using Scam Sleuth ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 'description',
      title: '2. Service Description',
      icon: <Shield className="w-5 h-5" />,
      content: `Scam Sleuth is a community-driven platform that allows users to:
      • Report scam incidents and fraudulent activities
      • Browse and search scam reports submitted by other users
      • Access AI-powered website analysis and safety scores
      • Receive alerts about potential scams in their area
      • Contribute to a safer digital environment through shared knowledge`
    },
    {
      id: 'user-accounts',
      title: '3. User Accounts and Registration',
      icon: <Users className="w-5 h-5" />,
      content: `To access certain features of our Service, you must register for an account. You agree to:
      • Provide accurate, current, and complete information during registration
      • Maintain the security of your password and account
      • Accept all responsibility for all activities that occur under your account
      • Notify us immediately of any unauthorized use of your account
      
      We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.`
    },
    {
      id: 'user-content',
      title: '4. User-Generated Content',
      icon: <AlertCircle className="w-5 h-5" />,
      content: `By submitting content to Scam Sleuth, you represent and warrant that:
      • You own or have the necessary rights to submit such content
      • Your content does not violate any third-party rights
      • Your content is accurate to the best of your knowledge
      • You will not submit false, misleading, or defamatory information
      
      You grant Scam Sleuth a non-exclusive, worldwide, royalty-free license to use, modify, and display your content for the purpose of operating our Service.`
    },
    {
      id: 'prohibited-uses',
      title: '5. Prohibited Uses',
      icon: <AlertCircle className="w-5 h-5" />,
      content: `You may not use our Service:
      • For any unlawful purpose or to solicit others to unlawful acts
      • To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
      • To transmit, or procure the sending of, any advertising or promotional material without our prior written consent
      • To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity
      • To submit false reports or misleading information
      • To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
      • To submit or transmit any content that is harmful, offensive, or inappropriate`
    },
    {
      id: 'content-moderation',
      title: '6. Content Moderation and Removal',
      icon: <Shield className="w-5 h-5" />,
      content: `We reserve the right to:
      • Review, moderate, and remove any user-generated content
      • Investigate reports and take appropriate action
      • Suspend or terminate accounts that violate these terms
      • Preserve content and account information as required by law
      
      We employ both automated systems and human moderators to maintain content quality and user safety.`
    },
    {
      id: 'disclaimers',
      title: '7. Disclaimers and Limitations',
      icon: <AlertCircle className="w-5 h-5" />,
      content: `IMPORTANT: Scam Sleuth is provided "as is" without warranties of any kind. We do not guarantee:
      • The accuracy, completeness, or reliability of user-submitted reports
      • The availability or uptime of our service
      • That our AI analysis tools are error-free or completely accurate
      • Protection against all types of scams or fraudulent activities
      
      Users should exercise their own judgment and conduct additional research before making decisions based on information found on our platform.`
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      icon: <Shield className="w-5 h-5" />,
      content: `To the maximum extent permitted by law, Scam Sleuth shall not be liable for:
      • Any indirect, incidental, special, consequential, or punitive damages
      • Any loss of profits, revenues, data, or use
      • Any damages resulting from user-generated content
      • Any damages resulting from reliance on information provided through our Service
      
      Our total liability shall not exceed the amount paid by you, if any, for accessing our Service.`
    },
    {
      id: 'intellectual-property',
      title: '9. Intellectual Property Rights',
      icon: <FileText className="w-5 h-5" />,
      content: `The Service and its original content, features, and functionality are owned by Scam Sleuth and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
      
      You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of our content except as permitted by these Terms.`
    },
    {
      id: 'termination',
      title: '10. Termination',
      icon: <AlertCircle className="w-5 h-5" />,
      content: `We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
      
      Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service or contact us for account deletion.`
    },
    {
      id: 'changes',
      title: '11. Changes to Terms',
      icon: <FileText className="w-5 h-5" />,
      content: `We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
      
      By continuing to access or use our Service after revisions become effective, you agree to be bound by the revised terms.`
    },
    {
      id: 'contact',
      title: '12. Contact Information',
      icon: <Users className="w-5 h-5" />,
      content: `If you have any questions about these Terms of Service, please contact us:
      • Email: legal@scamsleuth.com
      • Phone: +1-800-SCAM-SLEUTH (1-800-722-6758)
      • Address: [Your Business Address]
      • Website: Contact form available at scamsleuth.com/contact`
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mt-4">
            Please read these terms carefully before using Scam Sleuth. By using our service, you agree to these terms.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-cardWhite rounded-2xl shadow-lg p-6 md:p-8 lg:p-12">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 font-medium">
              <strong>Last Updated:</strong> June 5, 2025
            </p>
            <p className="text-blue-700 text-sm mt-1">
              These terms are effective immediately and apply to all users of the Scam Sleuth platform.
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Scam Sleuth</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your use of the Scam Sleuth platform and services. 
              Scam Sleuth is committed to creating a safe and trustworthy environment for users to share 
              information about scams and fraudulent activities.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our platform, you become part of a community dedicated to protecting others from 
              online and offline scams. Please take the time to read and understand these terms.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-red/10 rounded-full flex items-center justify-center text-red flex-shrink-0 mt-1">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                </div>
                <div className="ml-11">
                  {section.content.includes('•') ? (
                    <div className="space-y-3">
                      {section.content.split('\n').map((paragraph, pIndex) => {
                        if (paragraph.trim().startsWith('•')) {
                          return (
                            <div key={pIndex} className="flex items-start gap-2">
                              <span className="text-red font-bold mt-1">•</span>
                              <span className="text-gray-700 leading-relaxed">
                                {paragraph.trim().substring(1).trim()}
                              </span>
                            </div>
                          );
                        } else if (paragraph.trim()) {
                          return (
                            <p key={pIndex} className="text-gray-700 leading-relaxed">
                              {paragraph.trim()}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.content.split('\n').map((paragraph, pIndex) => 
                        paragraph.trim() ? (
                          <p key={pIndex} className="text-gray-700 leading-relaxed">
                            {paragraph.trim()}
                          </p>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Agreement Statement */}
          <div className="mt-12 p-6 bg-gradient-to-r from-red/5 to-red/10 border border-red/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Agreement Acknowledgment</h3>
                <p className="text-gray-700 leading-relaxed">
                  By continuing to use Scam Sleuth, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service. If you do not agree with any part 
                  of these terms, you must not use our service.
                </p>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/privacy')}
              className="hover:bg-red hover:text-white hover:border-red transition-all"
            >
              View Privacy Policy
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/contact')}
              className="hover:bg-red hover:text-white hover:border-red transition-all"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}