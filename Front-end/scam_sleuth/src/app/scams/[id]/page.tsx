"use client"
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, AlertTriangle, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScamReport {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl: string;
  }

interface ScamDetailedReport extends ScamReport {
  reportedCount: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  targetDemographic: string;
  preventionTips: string[];
  howItWorks: string;
  whatToDo: string[];
  relatedScams: string[];
}

// Custom Alert Component
const CustomAlert = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
    {children}
  </div>
);

const ScamDetailPage = () => {
    const router = useRouter();
  // Example of expanded dummy data for a detailed report
  const scamDetail: ScamDetailedReport = {
    id: '1',
    name: 'Sophisticated Phishing Email Scam',
    description: 'Sophisticated email impersonating a major bank, requesting urgent account verification. Includes fraudulent login page to steal credentials.',
    date: '2024/10/1',
    imageUrl: '/detective-dog.png',
    reportedCount: 2347,
    riskLevel: 'High',
    targetDemographic: 'Banking customers, primarily targeting users of major banks',
    preventionTips: [
      'Always verify emails claiming to be from your bank',
      'Never click on links in unexpected emails',
      'Check the sender\'s email address carefully',
      'Contact your bank directly using official numbers'
    ],
    howItWorks: 'Scammers send emails that look identical to legitimate bank communications. They create urgency by claiming account suspension or security issues. The emails contain links to fake websites that perfectly mimic real banking sites. When users enter their credentials, the information is stolen and can be used for unauthorized access.',
    whatToDo: [
      'Report the email to your bank\'s fraud department',
      'Change passwords if you\'ve entered any information',
      'Monitor your accounts for suspicious activity',
      'File a report with relevant authorities'
    ],
    relatedScams: [
      'SMS Banking Scam',
      'Voice Phishing Calls',
      'Fake Bank Apps'
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => router.push('/scams')}>
        <ArrowLeft size={20} />
        Back to Scams
      </Button>

      {/* Main Content */}
      <Card>
        {/* Header Image */}
        <div className="relative w-full h-96">
          <Image
            src={scamDetail.imageUrl}
            alt={scamDetail.name}
            className="object-cover"
            fill
          />
        </div>

        <CardContent className="p-8">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar size={16} />
                {new Date(scamDetail.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <h1 className="text-3xl font-bold">{scamDetail.name}</h1>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 size={20} />
              Share Report
            </Button>
          </div>

          {/* Risk Alert */}
          <CustomAlert>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="flex items-center gap-4">
              <span>
                Risk Level: <span className="font-bold text-red-500">{scamDetail.riskLevel}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {scamDetail.reportedCount.toLocaleString()} reported cases
              </span>
            </div>
          </CustomAlert>

          {/* Main Description */}
          <div className="space-y-8 mt-8">
            {/* Target Section */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Who is Being Targeted?</h2>
              <p className="text-gray-700">{scamDetail.targetDemographic}</p>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="text-xl font-semibold mb-3">How This Scam Works</h2>
              <p className="text-gray-700">{scamDetail.howItWorks}</p>
            </section>

            {/* Prevention Tips */}
            <section>
              <h2 className="text-xl font-semibold mb-3">How to Protect Yourself</h2>
              <div className="grid gap-3">
                {scamDetail.preventionTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What To Do */}
            <section>
              <h2 className="text-xl font-semibold mb-3">If You've Been Targeted</h2>
              <div className="space-y-3">
                {scamDetail.whatToDo.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Scams */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Related Scams to Watch For</h2>
              <div className="grid gap-2">
                {scamDetail.relatedScams.map((scam, index) => (
                  <Button key={index} variant="outline" className="justify-start">
                    {scam}
                  </Button>
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      {/* Report Button */}
      <div className="mt-8 text-center">
        <Button size="lg" className="rounded-full px-8">
          Report Similar Scam
        </Button>
      </div>
    </div>
  );
};

export default ScamDetailPage;