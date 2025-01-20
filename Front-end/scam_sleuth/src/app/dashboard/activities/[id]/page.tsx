"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { getSpecificReport } from './actions';

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
  writer: {
    id: number;
    username: string;
    email: string;
    name: string;
    profilePicture: string | null;
  };
  media: Array<{
    report_id: number;
    media_id: number;
  }>;
}

export default function ScamReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const result = await getSpecificReport(resolvedParams.id);
        
        if (result.success && result.data) {
          setReport(result.data);
        } else {
          setError(result.error || 'Failed to fetch report');
        }
      } catch (err) {
        setError('An error occurred while fetching the report');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Report not found</div>
      </div>
    );
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
            {/* Reporter Information */}
            <div>
              <h4 className="text-xl font-bold mb-3">Reporter Information</h4>
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="mb-2">
                  <span className="font-bold">Name:</span> {report.writer.name}
                </p>
                <p className="mb-2">
                  <span className="font-bold">Username:</span> {report.writer.username}
                </p>
                <p className="mb-2">
                  <span className="font-bold">Email:</span> {report.writer.email}
                </p>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className="text-xl font-bold mb-3">Financial Impact</h4>
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="mb-2">
                  <span className="font-bold">Financial Loss:</span> {report.details.amount}
                </p>
              </div>
            </div>

            {/* Media Attachments */}
            {report.media && report.media.length > 0 && (
              <div>
                <h4 className="text-xl font-bold mb-3">Media Attachments</h4>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="mb-2">
                    {report.details.evidence}
                  </p>
                </div>
              </div>
            )}
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