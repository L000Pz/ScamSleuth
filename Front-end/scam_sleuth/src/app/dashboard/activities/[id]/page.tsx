"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { getSpecificReport } from './actions';
import { Download, FileText } from 'lucide-react';

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
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  
  const resolvedParams = React.use(params);

  const handleMediaDownload = (mediaId: number) => {
    setDownloadingIds(prev => new Set(prev).add(mediaId));
    const downloadUrl = `http://localhost:5002/mediaManager/Get?id=${mediaId}`;
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }, 1000);
  };

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
        <div className="text-red-500 font-medium">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 font-medium">Report not found</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 md:p-8 lg:p-16">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Report Content */}
          <div className="w-full lg:w-3/5 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Scam Report</h2>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => router.push('/dashboard/activities')}
              >
                Back to Activities
              </Button>
            </div>

            {/* Report Header */}
            <div className="bg-blue-100 rounded-xl p-4 md:p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{report.name}</h3>
                  <span className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
                    {report.type}
                  </span>
                </div>
                <div className="text-left sm:text-right">
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
                <h4 className="text-lg md:text-xl font-bold mb-3">Reporter Information</h4>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="mb-2">
                    <span className="font-bold">Name:</span> {report.writer.name}
                  </p>
                  <p className="mb-2">
                    <span className="font-bold">Username:</span> {report.writer.username}
                  </p>
                  <p>
                    <span className="font-bold">Email:</span> {report.writer.email}
                  </p>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-lg md:text-xl font-bold mb-3">Financial Impact</h4>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p>
                    <span className="font-bold">Financial Loss:</span> {report.details.amount}
                  </p>
                </div>
              </div>

              {/* Media Attachments */}
              {report.media && report.media.length > 0 && (
                <div>
                  <h4 className="text-lg md:text-xl font-bold mb-3">Media Attachments</h4>
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="space-y-3">
                      {report.media.map((media, index) => (
                        <div 
                          key={media.media_id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg shadow-sm gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span>Attachment {index + 1}</span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleMediaDownload(media.media_id)}
                            disabled={downloadingIds.has(media.media_id)}
                            className="flex items-center gap-2 w-full sm:w-auto"
                          >
                            {downloadingIds.has(media.media_id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            {downloadingIds.has(media.media_id) ? 'Opening...' : 'Download'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Gradient Background and Image */}
          <div className="hidden lg:flex w-full lg:w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
            <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 mb-4">
              <Image 
                src={heroImage} 
                alt="Detective Dog" 
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center lg:text-left">
              Reviewing <span style={{ color: "#E14048" }}>reports</span>
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center lg:text-left">
              helps prevent scams!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}