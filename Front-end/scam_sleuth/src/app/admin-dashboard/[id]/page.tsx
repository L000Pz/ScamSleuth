"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Pencil, FileText, Eye, EyeOff, Download } from 'lucide-react';
import { getAdminReport } from './actions';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  status: string;
  reporterName: string;
  contactInfo: string;
  evidence?: string[];
  timeline?: string;
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

export default function ScamReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [previewingIds, setPreviewingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminReport(params.id);
        
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
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: 'resolved' | 'pending') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (report) {
        setReport({ ...report, status: newStatus });
      }
      
      setTimeout(() => router.push('/admin-dashboard/write-review'), 500);
    } catch (error) {
      console.error('Error updating status:', error);
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error || 'Report not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin-dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl md:text-[40px] font-bold">Review Scam Report</h2>
        </div>
        <div className="flex items-center gap-3 min-w-fit">
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('pending')}
            className="rounded-full font-bold whitespace-nowrap"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
          <Button
            onClick={() => handleStatusUpdate('resolved')}
            className="rounded-full px-6 font-bold bg-black hover:bg-gray-800 whitespace-nowrap"
          >
            <Check className="mr-2 h-4 w-4" />
            Resolved
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background rounded-xl p-4 md:p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Type</label>
                <p className="text-lg break-words">{report.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg break-words">{report.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-lg whitespace-pre-wrap break-words max-h-64 overflow-y-auto">{report.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Timeline</label>
                <p className="text-lg break-words">{report.timeline}</p>
              </div>
            </div>
          </div>

          {/* Media Attachments Section */}
          {report.media && report.media.length > 0 && (
            <div className="bg-background rounded-xl p-4 md:p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Media Evidence</h3>
              <div className="space-y-4">
                {report.media.map((media, index) => (
                  <div key={media.media_id} className="border rounded-lg p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm md:text-base">Attachment {index + 1}</span>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => togglePreview(media.media_id)}
                          className="flex items-center gap-2 flex-1 sm:flex-initial text-sm md:text-base"
                        >
                          {previewingIds.has(media.media_id) ? (
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
                        <Button
                          variant="outline"
                          onClick={() => handleMediaDownload(media.media_id)}
                          disabled={downloadingIds.has(media.media_id)}
                          className="flex items-center gap-2 flex-1 sm:flex-initial text-sm md:text-base"
                        >
                          {downloadingIds.has(media.media_id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {downloadingIds.has(media.media_id) ? 'Opening...' : 'Download'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview Section */}
                    {previewingIds.has(media.media_id) && (
                      <div className="mt-2 rounded-lg overflow-hidden bg-gray-50 p-2">
                        <img
                          src={`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-auto max-h-96 object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Reporter Info */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl p-4 md:p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Reporter Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg break-words">{report.writer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg break-words">{report.writer.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg break-words">{report.writer.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}