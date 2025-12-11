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
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  Video,
  Volume2,
  File,
  Maximize2,
  X
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { getAdminReport, deleteReport } from './actions';

// Enhanced media interface with type detection
interface MediaFile {
  report_id: number;
  media_id: number;
  type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  name: string;
  size?: string;
  mimeType?: string;
}

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  reportDate: string;
  rawScamDate: string;
  rawReportDate: string;
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
  media: MediaFile[];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Media Modal Component
interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaFile | null;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, media }) => {
  if (!isOpen || !media) return null;

  const mediaUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${media.media_id}`;

  const renderModalContent = () => {
    switch (media.type) {
      case 'image':
        return (
          <div className="max-w-4xl max-h-[80vh] overflow-auto">
            <Image
              src={mediaUrl}
              alt={media.name}
              width={1200}
              height={800}
              className="w-full h-auto object-contain"
              unoptimized={true}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="max-w-4xl max-h-[80vh]">
            <video
              controls
              className="w-full h-auto max-h-[70vh] object-contain"
              preload="metadata"
            >
              <source src={mediaUrl} type={media.mimeType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full max-w-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <audio
              controls
              className="w-full"
              preload="metadata"
            >
              <source src={mediaUrl} type={media.mimeType || 'audio/mpeg'} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'document':
        return (
          <div className="w-full max-w-lg p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 break-words">{media.name}</h3>
            {media.size && (
              <p className="text-gray-600 mb-4">Size: {media.size}</p>
            )}
            <p className="text-gray-600 mb-6">
              This document will open in a new tab for viewing.
            </p>
            <Button
              onClick={() => window.open(mediaUrl, '_blank')}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Open Document
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="w-full max-w-lg p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                <File className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 break-words">{media.name}</h3>
            {media.size && (
              <p className="text-gray-600 mb-4">Size: {media.size}</p>
            )}
            <p className="text-gray-600 mb-6">
              This file type is not supported for preview.
            </p>
            <Button
              onClick={() => window.open(mediaUrl, '_blank')}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getMediaIcon(media.type, 'w-5 h-5')}
            <h3 className="text-lg font-semibold text-gray-800 truncate" title={media.name}>
              {media.name}
            </h3>
            {media.size && (
              <span className="text-sm text-gray-500 flex-shrink-0">({media.size})</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(mediaUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center p-4">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

// Helper function to get appropriate icon for media type
const getMediaIcon = (type: string, className: string = "w-5 h-5") => {
  switch (type) {
    case 'image':
      return <ImageIcon className={`${className} text-green-600`} />;
    case 'video':
      return <Video className={`${className} text-red-600`} />;
    case 'audio':
      return <Volume2 className={`${className} text-purple-600`} />;
    case 'document':
      return <FileText className={`${className} text-blue-600`} />;
    default:
      return <File className={`${className} text-gray-600`} />;
  }
};

// Helper function to get type-specific colors
const getTypeColors = (type: string) => {
  switch (type) {
    case 'image':
      return {
        bg: 'bg-green-100',
        border: 'border-green-300',
        hoverBg: 'hover:bg-green-50',
        hoverBorder: 'hover:border-green-400'
      };
    case 'video':
      return {
        bg: 'bg-red-100',
        border: 'border-red-300',
        hoverBg: 'hover:bg-red-50',
        hoverBorder: 'hover:border-red-400'
      };
    case 'audio':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-300',
        hoverBg: 'hover:bg-purple-50',
        hoverBorder: 'hover:border-purple-400'
      };
    case 'document':
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        hoverBg: 'hover:bg-blue-50',
        hoverBorder: 'hover:border-blue-400'
      };
    default:
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        hoverBg: 'hover:bg-gray-50',
        hoverBorder: 'hover:border-gray-400'
      };
  }
};

export default function ScamReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [previewingIds, setPreviewingIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMedia, setModalMedia] = useState<MediaFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${mediaId}`;
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

  const openModal = (media: MediaFile): void => {
    setModalMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setModalMedia(null);
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

  const handleDeleteReport = async () => {
    if (!report) return;

    if (window.confirm(`Are you sure you want to delete report #${report.id}? This action cannot be undone.`)) {
      setIsDeleting(true);
      setError(null);

      try {
        const result = await deleteReport(report.id);
        if (result.success) {
          alert(result.message || `Report #${report.id} deleted successfully.`);
          router.push('/admin-dashboard');
        } else {
          setError(result.error || 'Failed to delete report.');
        }
      } catch (err) {
        console.error('Error deleting report:', err);
        setError('An unexpected error occurred while deleting the report.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const renderInlinePreview = (media: MediaFile): React.ReactNode => {
    const mediaUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${media.media_id}`;

    switch (media.type) {
      case 'image':
        return (
          <div className="p-4 bg-white cursor-pointer" onClick={() => openModal(media)}>
            <div className="relative group">
              <Image
                src={mediaUrl}
                alt={media.name}
                width={800}
                height={600}
                className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 hover:scale-105 transition-transform"
                unoptimized={true}
                priority={false}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center rounded-lg">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="p-4 bg-white">
            <video
              controls
              className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200"
              preload="metadata"
            >
              <source src={mediaUrl} type={media.mimeType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="p-4 bg-white">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate" title={media.name}>{media.name}</p>
                {media.size && (
                  <p className="text-sm text-gray-600">Size: {media.size}</p>
                )}
              </div>
            </div>
            <audio
              controls
              className="w-full"
              preload="metadata"
            >
              <source src={mediaUrl} type={media.mimeType || 'audio/mpeg'} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'document':
        return (
          <div className="p-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate" title={media.name}>{media.name}</p>
                {media.size && (
                  <p className="text-sm text-gray-600">Size: {media.size}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Click "View" to open in new tab</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <File className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate" title={media.name}>{media.name}</p>
                {media.size && (
                  <p className="text-sm text-gray-600">Size: {media.size}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Preview not available for this file type</p>
              </div>
            </div>
          </div>
        );
    }
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
                onClick={() => router.push('/admin-dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskLevel(report.financialLoss);

  return (
    <>
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
                  onClick={() => router.push('/admin-dashboard')}
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

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Report Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* Report Overview Card */}
              <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 break-words">{report.name}</h2>
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
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${riskInfo.bgColor} ${riskInfo.color} flex-shrink-0 ml-4`}>
                      {riskInfo.level}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900 break-words">{report.type}</div>
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
                    <div className="bg-gray-50 rounded-xl p-4 max-h-128 overflow-y-auto">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Media Evidence Card */}
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
                      {report.media.map((media, index) => {
                        const colors = getTypeColors(media.type);
                        return (
                          <div key={`media-${media.media_id}-${index}`} className={`border ${colors.border} rounded-xl overflow-hidden transition-all ${colors.hoverBg} ${colors.hoverBorder}`}>
                            <div className="p-4 bg-gray-50 flex items-center justify-between min-w-0">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  {getMediaIcon(media.type, "w-5 h-5")}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 
                                      className="font-medium text-gray-900 truncate" 
                                      title={media.name}
                                    >
                                      {media.name}
                                    </h4>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize flex-shrink-0">
                                      {media.type}
                                    </span>
                                  </div>
                                  {media.size && (
                                    <p className="text-sm text-gray-500">Size: {media.size}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0 ml-4">
                                {/* View/Preview Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (media.type === 'document' || media.type === 'unknown') {
                                      openModal(media);
                                    } else if (previewingIds.has(media.media_id)) {
                                      togglePreview(media.media_id);
                                    } else {
                                      togglePreview(media.media_id);
                                    }
                                  }}
                                  className="flex items-center gap-2 min-w-0"
                                >
                                  {media.type === 'document' || media.type === 'unknown' ? (
                                    <>
                                      <Eye className="w-4 h-4 flex-shrink-0" />
                                      <span className="hidden sm:inline">View</span>
                                    </>
                                  ) : previewingIds.has(media.media_id) ? (
                                    <>
                                      <EyeOff className="w-4 h-4 flex-shrink-0" />
                                      <span className="hidden sm:inline">Hide</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 flex-shrink-0" />
                                      <span className="hidden sm:inline">Preview</span>
                                    </>
                                  )}
                                </Button>
                                
                                {/* Fullscreen Button for Images/Videos */}
                                {(media.type === 'image' || media.type === 'video') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal(media)}
                                    className="flex items-center gap-2 min-w-0"
                                  >
                                    <Maximize2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Full</span>
                                  </Button>
                                )}
                                
                                {/* Download Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMediaDownload(media.media_id)}
                                  disabled={downloadingIds.has(media.media_id)}
                                  className="flex items-center gap-2 min-w-0"
                                >
                                  {downloadingIds.has(media.media_id) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent flex-shrink-0" />
                                  ) : (
                                    <Download className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {downloadingIds.has(media.media_id) ? 'Opening...' : 'Download'}
                                  </span>
                                </Button>
                              </div>
                            </div>
                            
                            {/* Inline Preview */}
                            {previewingIds.has(media.media_id) && renderInlinePreview(media)}
                          </div>
                        );
                      })}
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
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${report.writer.profilePicture}`}
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
                      <h4 className="text-lg font-semibold text-gray-900 truncate" title={report.writer.name}>
                        {report.writer.name}
                      </h4>
                      <p className="text-gray-600 truncate" title={`@${report.writer.username}`}>
                        @{report.writer.username}
                      </p>
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
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 truncate" title={report.writer.email}>
                          {report.writer.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${report.writer.email}`, '_blank')}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
                    <Pencil className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Write Public Review</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${report.writer.email}?subject=Regarding Report #${report.id}`, '_blank')}
                    className="w-full justify-start"
                  >
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Contact Reporter</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleDeleteReport}
                    disabled={isDeleting}
                    className="w-full justify-start bg-black text-white hover:bg-white"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 flex-shrink-0" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {isDeleting ? 'Deleting...' : 'Delete Report'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin-dashboard')}
                    className="w-full justify-start"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Back to Dashboard</span>
                  </Button>
                </div>
              </div>

              {/* Report Statistics */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Financial Impact</span>
                    <span className={`font-bold ${riskInfo.color} text-right`}>
                      {formatCurrency(report.financialLoss)}
                    </span>
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

      {/* Media Modal */}
      <MediaModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        media={modalMedia}
      />
    </>
  );
}