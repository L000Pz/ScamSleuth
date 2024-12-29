"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  reportedBy: string;
  status: string;
  details: {
    platform: string;
    location: string;
    amount?: string;
    evidence?: string;
  };
}

export default function ScamReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching report data
    // Replace this with your actual API call
    const fetchReport = async () => {
      try {
        // Simulated API response
        const dummyReport: ScamReport = {
          id: params.id,
          type: "Phishing",
          name: "Email Scam Report",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.",
          date: "2024/10/1",
          reportedBy: "John Doe",
          status: "Under Investigation",
          details: {
            platform: "Email",
            location: "Singapore",
            amount: "$5,000",
            evidence: "Email screenshots and communication records"
          }
        };

        setReport(dummyReport);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching report:', error);
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        {/* Left Column - Report Content */}
        <div className="w-3/5 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[40px] font-bold">Scam Report</h2>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/dashboard/activities')}
            >
              Back to Activities
            </Button>
          </div>

          {/* Report Header */}
          <div className="bg-blue-100 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">{report.name}</h3>
                <span className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
                  {report.type}
                </span>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Report ID: {report.id}</p>
                <p className="text-gray-600">Date: {report.date}</p>
              </div>
            </div>
            <p className="text-gray-700">{report.description}</p>
          </div>

          {/* Report Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-3">Status Information</h4>
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="mb-2">
                  <span className="font-bold">Current Status:</span>{' '}
                  <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                    {report.status}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="font-bold">Reported By:</span> {report.reportedBy}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-3">Incident Details</h4>
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="mb-2">
                  <span className="font-bold">Platform:</span> {report.details.platform}
                </p>
                <p className="mb-2">
                  <span className="font-bold">Location:</span> {report.details.location}
                </p>
                {report.details.amount && (
                  <p className="mb-2">
                    <span className="font-bold">Amount Involved:</span> {report.details.amount}
                  </p>
                )}
                {report.details.evidence && (
                  <p className="mb-2">
                    <span className="font-bold">Evidence:</span> {report.details.evidence}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Gradient Background and Image */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            Reviewing <span style={{ color: "#E14048" }}>reports</span>
          </p>
          <p className="text-[40px] font-bold text-white text-left">helps prevent scams!</p>
        </div>
      </div>
    </div>
  );
}