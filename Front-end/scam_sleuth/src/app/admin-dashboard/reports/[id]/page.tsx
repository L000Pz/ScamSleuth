/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  FileText, 
  Eye, 
  EyeOff, 
  Download,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Shield,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { getAdminReport } from './actions';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  reportDate: string;
  financialLoss: number;
  reporterName: string;
  contactInfo: string;
  evidence?: string[];
  writer: {
    id: number;
    username: string;
    email: string;
    name: string;
    profilePicture: number | null;
    isVerified: boolean;
  };
  media: Array<{
    report_id: number;
    media_id: number;
  }>;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ScamReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [previewingIds, setPreviewingIds] = useState<Set<number>>(new Set());

  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminReport(resolvedParams.id);
        
        if (result.success && result.data) {
          setReport(result.data);
        } else {
          setError(result.error || 'Failed to fetch report');
        }
      } catch (error) {
        setError('Failed to load scam report');
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [resolvedParams.id]);

  const handleWriteReview = () => {
    router.push('/admin-dashboard/write-review');
  };

  const handleMediaDownload = (mediaId: number) => {
    setDownloadingIds(prev => new Set(prev).add(mediaId));
    const downloadUrl = `http://localhost:8080/Media/mediaManager/Get?id=${mediaId}`;
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }, 1000);
  };

  const togglePreview = (mediaId: number) => {
    setPreviewingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskLevel = (amount: number): { level: string; color: string; bgColor: string } => {
    if (amount >= 10000) return { level: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' };
    if (amount >= 1000) return { level: 'Medium Risk', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' };
    if (amount > 0) return { level: 'Low Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' };
    return { level: 'No Financial Loss', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cardWhite p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-lg font-medium text-gray-600">Loading report details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-cardWhite p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Report Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The requested report could not be found.'}</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/reports')}
                className="w-full"
              >
                Back to Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskLevel(report.financialLoss);

  return (
    <div className="min-h-screen bg-cardWhite p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push('/admin-dashboard')}
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => router.push('/admin-dashboard/reports')}
              className="hover:text-gray-700 transition-colors"
            >
              Scam Reports
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Report #{report.id}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Scam Report Review</h1>
              <p className="text-gray-600">Review and analyze the submitted scam report</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/admin-dashboard/reports')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleWriteReview}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Pencil className="w-4 h-4" />
                Write Review
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Report Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Report Overview Card */}
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Reported: {report.reportDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Incident: {report.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${riskInfo.bgColor} ${riskInfo.color}`}>
                    {riskInfo.level}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{report.type}</div>
                    <div className="text-sm text-gray-500">Scam Type</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">#{report.id}</div>
                    <div className="text-sm text-gray-500">Report ID</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(report.financialLoss)}</div>
                    <div className="text-sm text-gray-500">Financial Loss</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Report Description
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Evidence Card */}
            {report.media && report.media.length > 0 && (
              <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Media Evidence
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                      {report.media.length}
                    </span>
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-4">
                    {report.media.map((media, index) => (
                      <div key={`media-${media.media_id}-${index}`} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-4 bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Evidence #{index + 1}</h4>
                              <p className="text-sm text-gray-500">Media ID: {media.media_id}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePreview(media.media_id)}
                              className="flex items-center gap-2"
                            >
                              {previewingIds.has(media.media_id) ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMediaDownload(media.media_id)}
                              disabled={downloadingIds.has(media.media_id)}
                              className="flex items-center gap-2"
                            >
                              {downloadingIds.has(media.media_id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              {downloadingIds.has(media.media_id) ? 'Opening...' : 'Download'}
                            </Button>
                          </div>
                        </div>
                        
                        {previewingIds.has(media.media_id) && (
                          <div className="p-4 bg-white">
                            <Image
                              src={`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`}
                              alt={`Evidence ${index + 1}`}
                              width={800}
                              height={600}
                              className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200"
                              unoptimized={true}
                              priority={false}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Reporter Info & Actions */}
          <div className="space-y-6">
            {/* Reporter Information Card */}
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Reporter Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {report.writer.profilePicture ? (
                      <Image
                        src={`http://localhost:8080/Media/mediaManager/Get?id=${report.writer.profilePicture}`}
                        alt={report.writer.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized={true}
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">{report.writer.name}</h4>
                    <p className="text-gray-600 truncate">@{report.writer.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {report.writer.isVerified ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Unverified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 truncate">{report.writer.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${report.writer.email}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium text-gray-900">#{report.writer.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="p-6 space-y-3">
                <Button
                  onClick={handleWriteReview}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Write Public Review
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${report.writer.email}?subject=Regarding Report #${report.id}`, '_blank')}
                  className="w-full justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Reporter
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/reports')}
                  className="w-full justify-start"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Reports
                </Button>
              </div>
            </div>

            {/* Report Statistics */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Financial Impact</span>
                  <span className={`font-bold ${riskInfo.color}`}>{formatCurrency(report.financialLoss)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-medium ${riskInfo.color}`}>{riskInfo.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Evidence Files</span>
                  <span className="font-medium text-gray-900">{report.media?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
              </div>
      </div>
  );
}