"use server";

import { cookies } from 'next/headers';

// Type definitions based on the actual API response
interface ApiScamType {
  scam_type_id: number;
  scam_type: string;
}

interface ApiReportResponse {
  report: {
    report_id: number;
    title: string;
    writer_id: number;
    scam_type_id: number;
    scam_date: string;
    report_date: string;
    financial_loss: number;
    description: string;
  };
  media: number[];
  reportWriterDetails: {
    user_id: number;
    username: string;
    email: string;
    name: string;
    profile_picture_id: number | null;
    is_verified: boolean;
  };
}

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
  date: string;
  reportDate: string;
  rawScamDate: string;
  rawReportDate: string;
  financialLoss: number;
  status: string;
  reporterName: string;
  contactInfo: string;
  evidence?: string[];
  timeline: string;
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

async function getUserInfoFromToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

async function detectMediaType(mediaId: number, token: string): Promise<{
  type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  mimeType?: string;
  size?: string;
  name?: string;
}> {
  try {
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
      
      const contentDisposition = headResponse.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          fileName = filenameMatch[1].replace(/['"]/g, '');
        }
      }
    } else {
      try {
        const rangeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Media/mediaManager/Get?id=${mediaId}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'Range': 'bytes=0-1023'
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

    if (type === 'unknown') {
      const extension = fileName.toLowerCase().split('.').pop() || '';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(extension)) {
        type = 'image';
      } 
      else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'ogv', 'mpeg', 'mpg', 'm4v'].includes(extension)) {
        type = 'video';
      } 
      else if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus', 'amr'].includes(extension)) {
        type = 'audio';
      } 
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
    
    return { 
      type: 'unknown',
      name: `media_${mediaId}`
    };
  }
}

function formatSmartDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return date.toLocaleDateString('en-US', options).replace(',', ' •');
}

function formatDatePretty(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

export async function getAdminReport(id: string): Promise<{
  success: boolean;
  data?: TransformedReport;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required. Please log in again.' };
    }

    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please log in again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required to view reports.' };
    }

    const [scamTypesRes, reportRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Public/publicManager/scamTypes`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Admin/adminManagement/GetReportById?report_id=${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      })
    ]);

    if (!scamTypesRes.ok) {
      console.error('Failed to fetch scam types:', scamTypesRes.status, scamTypesRes.statusText);
      return { success: false, error: 'Failed to fetch scam type information.' };
    }

    if (!reportRes.ok) {
      if (reportRes.status === 404) {
        return { success: false, error: 'Report not found. It may have been deleted or the ID is incorrect.' };
      }
      console.error('Failed to fetch report:', reportRes.status, reportRes.statusText);
      return { success: false, error: 'Failed to fetch report data.' };
    }

    const [scamTypes, reportData]: [ApiScamType[], ApiReportResponse] = await Promise.all([
      scamTypesRes.json(),
      reportRes.json()
    ]);

    if (!reportData?.report) {
      console.error('Invalid report data structure:', reportData);
      return { success: false, error: 'Invalid report data received from server.' };
    }

    const mediaFiles: MediaFile[] = [];
    if (reportData.media && reportData.media.length > 0) {
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

    const scamType = scamTypes.find((type) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    const getEvidenceDescription = (mediaFiles: MediaFile[]): string[] => {
      if (mediaFiles.length === 0) return [];
      
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

      return descriptions;
    };

    const transformedReport: TransformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown Scam Type',
      name: reportData.report.title,
      description: reportData.report.description,
      date: formatDatePretty(reportData.report.scam_date),
      reportDate: formatSmartDate(reportData.report.report_date),
      rawScamDate: reportData.report.scam_date,
      rawReportDate: reportData.report.report_date,
      financialLoss: reportData.report.financial_loss || 0,
      status: 'under_review',
      reporterName: reportData.reportWriterDetails.name,
      contactInfo: reportData.reportWriterDetails.email,
      evidence: getEvidenceDescription(mediaFiles),
      timeline: `Scam occurred ${formatDatePretty(reportData.report.scam_date)}`,
      writer: {
        id: reportData.reportWriterDetails.user_id,
        username: reportData.reportWriterDetails.username,
        email: reportData.reportWriterDetails.email,
        name: reportData.reportWriterDetails.name,
        profilePicture: reportData.reportWriterDetails.profile_picture_id,
        isVerified: reportData.reportWriterDetails.is_verified
      },
      media: mediaFiles
    };

    return { success: true, data: transformedReport };

  } catch (error) {
    console.error('Error in getAdminReport:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
    
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Server returned invalid data. Please try again.' };
    }
    
    return { 
      success: false, 
      error: 'An unexpected error occurred while fetching the report. Please try again.' 
    };
  }
}

export async function updateReportStatus(reportId: string, status: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }

    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required.' };
    }

    console.log(`Would update report ${reportId} to status: ${status}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: 'Failed to update report status.' };
  }
}

export async function deleteReport(reportId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }

    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required.' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/Admin/adminManagement/DeleteReport?report_id=${reportId}`, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response for deleteReport:', {
        status: response.status,
        text: errorText
      });
      return {
        success: false,
        error: `Failed to delete report: ${errorText || response.statusText}`
      };
    }

    const responseData = await response.text();
    const message = responseData.startsWith('"') && responseData.endsWith('"')
      ? responseData.slice(1, -1)
      : responseData;

    return { success: true, message: message || 'Report deleted successfully.' };

  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, error: 'An unexpected error occurred while deleting the report.' };
  }
}

export async function addAdminNote(reportId: string, note: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }

    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required.' };
    }

    console.log(`Would add note to report ${reportId}: ${note}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding admin note:', error);
    return { success: false, error: 'Failed to add admin note.' };
  }
}