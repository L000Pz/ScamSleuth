"use server";

import { cookies } from 'next/headers';

// Type definitions for the API response
interface ScamType {
  scam_type_id: number;
  scam_type: string;
}

interface ReportData {
  report: {
    report_id: number;
    title: string;
    writer_id: number;
    scam_type_id: number;
    scam_date: string; // When the scam occurred
    report_date: string; // When the report was submitted
    financial_loss: number;
    description: string;
  };
  media: number[]; // Array of media IDs
  writerDetails: {
    user_id: number;
    username: string;
    email: string;
    name: string;
    profile_picture_id: number | null;
  };
}

// Enhanced media interface with type detection
interface MediaFile {
  report_id: number;
  media_id: number;
  type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  name: string;
  size?: string;
  mimeType?: string;
}

interface TransformedReport {
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

// Function to detect media type by making a HEAD request to get Content-Type
async function detectMediaType(mediaId: number, token: string): Promise<{
  type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  mimeType?: string;
  size?: string;
  name?: string;
}> {
  try {
    // First try to get metadata with HEAD request
    const headResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${mediaId}`, {
      method: 'HEAD',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      cache: 'no-store'
    });

    let contentType = '';
    let contentLength = '';
    let fileName = `media_${mediaId}`;

    if (headResponse.ok) {
      contentType = headResponse.headers.get('content-type')?.toLowerCase() || '';
      contentLength = headResponse.headers.get('content-length') || '';
      
      // Try to extract filename from content-disposition header
      const contentDisposition = headResponse.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          fileName = filenameMatch[1].replace(/['"]/g, '');
        }
      }
    } else {
      // If HEAD fails, try a small range request to get headers
      try {
        const rangeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${mediaId}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'Range': 'bytes=0-1023' // Get first 1KB only
          },
          cache: 'no-store'
        });

        if (rangeResponse.ok) {
          contentType = rangeResponse.headers.get('content-type')?.toLowerCase() || '';
          contentLength = rangeResponse.headers.get('content-length') || 
                         rangeResponse.headers.get('content-range')?.split('/')[1] || '';
          
          const contentDisposition = rangeResponse.headers.get('content-disposition');
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch) {
              fileName = filenameMatch[1].replace(/['"]/g, '');
            }
          }
        }
      } catch (rangeError) {
        console.warn(`Range request failed for media ${mediaId}:`, rangeError);
      }
    }

    // Format file size
    let size: string | undefined;
    if (contentLength) {
      const bytes = parseInt(contentLength);
      if (!isNaN(bytes)) {
        if (bytes < 1024) {
          size = `${bytes} B`;
        } else if (bytes < 1024 * 1024) {
          size = `${(bytes / 1024).toFixed(1)} KB`;
        } else if (bytes < 1024 * 1024 * 1024) {
          size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          size = `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        }
      }
    }

    // Determine file type based on content-type first
    let type: 'image' | 'video' | 'audio' | 'document' | 'unknown' = 'unknown';

    if (contentType) {
      if (contentType.startsWith('image/')) {
        type = 'image';
      } else if (contentType.startsWith('video/')) {
        type = 'video';
      } else if (contentType.startsWith('audio/')) {
        type = 'audio';
      } else if (
        contentType.includes('pdf') ||
        contentType.includes('msword') ||
        contentType.includes('vnd.openxmlformats-officedocument') ||
        contentType.includes('vnd.ms-') ||
        contentType.includes('text/plain') ||
        contentType.includes('application/rtf') ||
        contentType === 'application/json' ||
        contentType === 'application/xml'
      ) {
        type = 'document';
      }
    }

    // Fallback: detect by file extension if content-type detection failed
    if (type === 'unknown') {
      const extension = fileName.toLowerCase().split('.').pop() || '';
      
      // Image extensions
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(extension)) {
        type = 'image';
      } 
      // Video extensions
      else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'ogv', 'mpeg', 'mpg', 'm4v'].includes(extension)) {
        type = 'video';
      } 
      // Audio extensions
      else if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus', 'amr'].includes(extension)) {
        type = 'audio';
      } 
      // Document extensions
      else if ([
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
        'txt', 'rtf', 'csv', 'json', 'xml', 'html', 'htm',
        'odt', 'ods', 'odp', 'pages', 'numbers', 'key'
      ].includes(extension)) {
        type = 'document';
      }
    }

    return {
      type,
      mimeType: contentType || undefined,
      size,
      name: fileName
    };
  } catch (error) {
    console.error(`Error detecting media type for ${mediaId}:`, error);
    
    // Last resort: return unknown type with basic info
    return { 
      type: 'unknown',
      name: `media_${mediaId}`
    };
  }
}

export async function getSpecificReport(id: string): Promise<{
  success: boolean;
  data?: TransformedReport;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Get report and scam types in parallel
    const [scamTypesRes, reportRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Public/publicManager/scamTypes`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/User/userManagement/reportId?report_id=${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      })
    ]);

    if (!scamTypesRes.ok || !reportRes.ok) {
      console.error('API call failed:', {
        scamTypes: scamTypesRes.status,
        report: reportRes.status
      });
      return { success: false, error: 'Failed to fetch data' };
    }

    const [scamTypes, reportData]: [ScamType[], ReportData] = await Promise.all([
      scamTypesRes.json(),
      reportRes.json()
    ]);

    if (!reportData?.report) {
      return { success: false, error: 'Invalid report data received' };
    }

    // Enhanced media processing with type detection
    const mediaFiles: MediaFile[] = [];
    if (reportData.media && reportData.media.length > 0) {
      // Process media files in parallel for better performance
      const mediaPromises = reportData.media.map(async (mediaId: number) => {
        const mediaInfo = await detectMediaType(mediaId, token);
        return {
          report_id: reportData.report.report_id,
          media_id: mediaId,
          type: mediaInfo.type,
          name: mediaInfo.name || `media_${mediaId}`,
          size: mediaInfo.size,
          mimeType: mediaInfo.mimeType
        };
      });

      const resolvedMedia = await Promise.all(mediaPromises);
      mediaFiles.push(...resolvedMedia);
    }

    // Find the corresponding scam type
    const scamType = scamTypes.find((type) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    // Format currency for financial loss
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };
    const formatDatePretty = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
    };
    const formatDateTimePretty = (dateString: string): string => {
      const d = new Date(dateString);

      const date = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });

      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      return `${date} • ${time}`;
    };

    // Enhanced evidence description
    const getEvidenceDescription = (mediaFiles: MediaFile[]): string => {
      if (mediaFiles.length === 0) return 'No media attached';
      
      const counts = mediaFiles.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const descriptions: string[] = [];
      if (counts.image) descriptions.push(`${counts.image} image${counts.image > 1 ? 's' : ''}`);
      if (counts.video) descriptions.push(`${counts.video} video${counts.video > 1 ? 's' : ''}`);
      if (counts.audio) descriptions.push(`${counts.audio} audio file${counts.audio > 1 ? 's' : ''}`);
      if (counts.document) descriptions.push(`${counts.document} document${counts.document > 1 ? 's' : ''}`);
      if (counts.unknown) descriptions.push(`${counts.unknown} other file${counts.unknown > 1 ? 's' : ''}`);

      return descriptions.join(', ') + ' attached';
    };

    const transformedReport: TransformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: reportData.report.title,
      description: reportData.report.description,
      scamDate: formatDatePretty(reportData.report.scam_date), // When scam occurred
      reportDate: formatDateTimePretty(reportData.report.report_date), // When reported
      reportedBy: reportData.writerDetails.name,
      status: "Under Review",
      details: {
        platform: "Not specified",
        location: "Not specified",
        amount: reportData.report.financial_loss > 0 ? 
          formatCurrency(reportData.report.financial_loss) : 
          'No financial loss reported',
        evidence: getEvidenceDescription(mediaFiles)
      },
      writer: {
        id: reportData.writerDetails.user_id,
        username: reportData.writerDetails.username,
        email: reportData.writerDetails.email,
        name: reportData.writerDetails.name,
        profilePicture: reportData.writerDetails.profile_picture_id
      },
      media: mediaFiles
    };

    return { success: true, data: transformedReport };
  } catch (error) {
    console.error('Error in getSpecificReport:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch report' 
    };
  }
}