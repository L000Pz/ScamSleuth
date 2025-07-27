"use client";

import React, { useState, useEffect, JSX } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { getSpecificReport } from './actions';
import { 
  Download, 
  FileText, 
  Eye, 
  EyeOff, 
  User, 
  Calendar, 
  Clock,
  Image as ImageIcon,
  Video,
  Volume2,
  File,
  Play,
  Pause,
  Maximize2,
  X
} from 'lucide-react';

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
  scamDate: string; // When the scam occurred
  reportDate: string; // When the report was submitted
  reportedBy: string;
  status: string;
  details: {
    platform: string;
    location: string;
    amount: string;
    evidence: string;
  };
  writer: {
    id: number;
    username: string;
    email: string;
    name: string;
    profilePicture: number | null;
  };
  media: MediaFile[];
}

interface PageParams {
  params: Promise<{ id: string }>;
}

// Media Modal Component
interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaFile | null;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, media }) => {
  if (!isOpen || !media) return null;

  const mediaUrl = `${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Get?id=${media.media_id}`;

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
            <h3 className="text-xl font-bold mb-2">{media.name}</h3>
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
            <h3 className="text-xl font-bold mb-2">{media.name}</h3>
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
          <div className="flex items-center gap-3">
            {getMediaIcon(media.type, 'w-5 h-5')}
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {media.name}
            </h3>
            {media.size && (
              <span className="text-sm text-gray-500">({media.size})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
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

export default function ScamReportPage({ params }: PageParams): JSX.Element {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [previewingIds, setPreviewingIds] = useState<Set<number>>(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [modalMedia, setModalMedia] = useState<MediaFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const resolvedParams = React.use(params);

  const handleMediaDownload = (mediaId: number): void => {
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

  const togglePreview = (mediaId: number): void => {
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

  const truncateDescription = (text: string, maxLength: number = 300): string => {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return lastSpaceIndex > 0 
      ? truncated.slice(0, lastSpaceIndex) + '...'
      : truncated + '...';
  };

  const renderInlinePreview = (media: MediaFile): JSX.Element => {
    const mediaUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${media.media_id}`;

    switch (media.type) {
      case 'image':
        return (
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-50 p-3 border border-gray-200">
            <div className="relative w-full max-h-96 cursor-pointer" onClick={() => openModal(media)}>
              <Image
                src={mediaUrl}
                alt={media.name}
                width={800}
                height={600}
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-sm hover:scale-105 transition-transform"
                unoptimized={true}
                priority={false}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-50 p-3 border border-gray-200">
            <video
              controls
              className="w-full h-auto max-h-96 object-contain rounded-lg shadow-sm"
              preload="metadata"
            >
              <source src={mediaUrl} type={media.mimeType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{media.name}</p>
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
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{media.name}</p>
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
          <div className="mt-3 rounded-lg overflow-hidden bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <File className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{media.name}</p>
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

  useEffect(() => {
    const fetchReport = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const result = await getSpecificReport(resolvedParams.id);
        
        if (result.success && result.data) {
          setReport(result.data);
        } else {
          setError(result.error || 'Failed to fetch report');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/activities')}
          >
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center max-w-md">
          <p className="text-gray-600 font-medium mb-4">Report not found</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/activities')}
          >
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  const isLongDescription = report.description.length > 300;

  return (
    <>
      <div className="flex items-center justify-center p-4 md:p-8 lg:p-16">
        <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden w-full max-w-[1440px]">
          <div className="flex flex-col lg:flex-row min-h-[700px]">
            {/* Left Column - Report Content */}
            <div className="w-full lg:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[700px]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-3">
                  <div className="w-3 h-3 bg-red rounded-full"></div>
                  Scam Report
                </h2>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  onClick={() => router.push('/dashboard/activities')}
                >
                  Back to Activities
                </Button>
              </div>

              {/* Reporter Information */}
              <div className="mb-6">
                <h4 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Reporter Information
                </h4>
                <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-5 border border-green-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-lg text-gray-900 break-words">{report.writer.name}</p>
                      <p className="text-gray-600 break-words">@{report.writer.username}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 break-all">
                      <span className="font-medium">Email:</span> {report.writer.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Details */}
              <div className="mb-6">
                <h4 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Report Details
                </h4>
                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 break-words">{report.name}</h3>
                      <span className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-bold">
                        {report.type}
                      </span>
                    </div>
                    <div className="text-left sm:text-right bg-white p-3 rounded-lg border border-gray-200 flex-shrink-0">
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">Report ID:</span> {report.id}
                      </p>
                      {/* Compact Date Information */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 text-red" />
                          <span>Scam: {report.scamDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Reported: {report.reportDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description with proper text handling */}
                  <div className="break-words">
                    <h5 className="font-medium text-gray-700 mb-2">Description:</h5>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {isDescriptionExpanded || !isLongDescription 
                        ? report.description 
                        : truncateDescription(report.description)
                      }
                    </p>
                    
                    {isLongDescription && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="mb-6">
                <h4 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Financial Impact
                </h4>
                <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-5 border border-orange-100 shadow-sm">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-lg break-words">
                      <span className="font-bold text-gray-900">Financial Loss:</span> 
                      <span className="text-orange-600 font-semibold ml-2">{report.details.amount}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Media Attachments */}
              {report.media && report.media.length > 0 && (
                <div>
                  <h4 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Evidence ({report.media.length} file{report.media.length > 1 ? 's' : ''})
                  </h4>
                  <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-5 border border-purple-100 shadow-sm">
                    <div className="space-y-4">
                      {report.media.map((media, index) => {
                        const colors = getTypeColors(media.type);
                        return (
                          <div key={media.media_id}>
                            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border ${colors.border} shadow-sm gap-3 transition-all ${colors.hoverBg} ${colors.hoverBorder}`}>
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  {getMediaIcon(media.type, "h-5 w-5")}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">{media.name}</span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize flex-shrink-0">
                                      {media.type}
                                    </span>
                                  </div>
                                  {media.size && (
                                    <p className="text-sm text-gray-500">Size: {media.size}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                                {/* View/Preview Button */}
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    if (media.type === 'document' || media.type === 'unknown') {
                                      openModal(media);
                                    } else if (previewingIds.has(media.media_id)) {
                                      togglePreview(media.media_id);
                                    } else {
                                      togglePreview(media.media_id);
                                    }
                                  }}
                                  className={`flex items-center gap-2 flex-1 sm:flex-initial transition-colors ${colors.hoverBg} ${colors.hoverBorder}`}
                                >
                                  {media.type === 'document' || media.type === 'unknown' ? (
                                    <>
                                      <Eye className="h-4 w-4" />
                                      View
                                    </>
                                  ) : previewingIds.has(media.media_id) ? (
                                    <>
                                      <EyeOff className="h-4 w-4" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4" />
                                      Preview
                                    </>
                                  )}
                                </Button>
                                
                                {/* Fullscreen Button for Images/Videos */}
                                {(media.type === 'image' || media.type === 'video') && (
                                  <Button
                                    variant="outline"
                                    onClick={() => openModal(media)}
                                    className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                  >
                                    <Maximize2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Full</span>
                                  </Button>
                                )}
                                
                                {/* Download Button */}
                                <Button
                                  variant="outline"
                                  onClick={() => handleMediaDownload(media.media_id)}
                                  disabled={downloadingIds.has(media.media_id)}
                                  className="flex items-center gap-2 flex-1 sm:flex-initial hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                  {downloadingIds.has(media.media_id) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                  {downloadingIds.has(media.media_id) ? 'Opening...' : 'Download'}
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

            {/* Right Column - Gradient Background and Image */}
            <div className="hidden lg:flex w-full lg:w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
              <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 mb-4">
                <Image 
                  src={heroImage} 
                  alt="Detective Dog" 
                  fill
                  className="object-contain"
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

      {/* Media Modal */}
      <MediaModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        media={modalMedia}
      />
    </>
  );
}