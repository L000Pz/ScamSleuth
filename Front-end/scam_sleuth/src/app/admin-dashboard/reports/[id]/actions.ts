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
  media: number[]; // Array of media IDs
  reportWriterDetails: {
    user_id: number;
    username: string;
    email: string;
    name: string;
    profile_picture_id: number | null;
    is_verified: boolean;
  };
}

interface TransformedReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  reportDate: string;
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
  media: Array<{
    report_id: number;
    media_id: number;
  }>;
}

/**
 * Fetch user info from token for authentication verification
 */
async function getUserInfoFromToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
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

/**
 * Format date string to localized date
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Get admin report by ID
 * @param id - The report ID to fetch
 * @returns Promise with success status and report data or error
 */
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

    // Verify user is admin
    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please log in again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required to view reports.' };
    }

    // Fetch scam types and report data in parallel
    const [scamTypesRes, reportRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/GetReportById?report_id=${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      })
    ]);

    // Check if both requests were successful
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

    // Parse responses
    const [scamTypes, reportData]: [ApiScamType[], ApiReportResponse] = await Promise.all([
      scamTypesRes.json(),
      reportRes.json()
    ]);

    // Validate report data structure
    if (!reportData?.report) {
      console.error('Invalid report data structure:', reportData);
      return { success: false, error: 'Invalid report data received from server.' };
    }

    // Find the matching scam type
    const scamType = scamTypes.find((type) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    // Transform media array to expected format
    const transformedMedia = reportData.media?.map((mediaId) => ({
      report_id: reportData.report.report_id,
      media_id: mediaId
    })) || [];

    // Transform the report data to match frontend expectations
    const transformedReport: TransformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown Scam Type',
      name: reportData.report.title,
      description: reportData.report.description,
      date: formatDate(reportData.report.scam_date),
      reportDate: formatDate(reportData.report.report_date),
      financialLoss: reportData.report.financial_loss || 0,
      status: 'under_review', // This status is hardcoded, adjust if API provides it
      reporterName: reportData.reportWriterDetails.name,
      contactInfo: reportData.reportWriterDetails.email,
      evidence: reportData.media?.length > 0 
        ? reportData.media.map((mediaId) => `Media ID: ${mediaId}`)
        : undefined,
      timeline: `Scam occurred on ${formatDate(reportData.report.scam_date)}`, // Hardcoded timeline, adjust if API provides it
      writer: {
        id: reportData.reportWriterDetails.user_id,
        username: reportData.reportWriterDetails.username,
        email: reportData.reportWriterDetails.email,
        name: reportData.reportWriterDetails.name,
        profilePicture: reportData.reportWriterDetails.profile_picture_id,
        isVerified: reportData.reportWriterDetails.is_verified
      },
      media: transformedMedia
    };

    return { success: true, data: transformedReport };

  } catch (error) {
    console.error('Error in getAdminReport:', error);
    
    // Provide more specific error messages based on error type
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

/**
 * Update report status (placeholder for future implementation)
 */
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

    // Verify admin access
    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required.' };
    }

    // TODO: Implement actual API call when endpoint is available
    console.log(`Would update report ${reportId} to status: ${status}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: 'Failed to update report status.' };
  }
}

/**
 * Delete report
 * @param reportId - The ID of the report to delete
 * @returns Promise with success status or error
 */
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

    // Verify admin access
    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required.' };
    }

    // Perform actual API call to delete the report
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/DeleteReport?report_id=${reportId}`, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store' // Ensure this request is always fresh
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

    const responseData = await response.text(); // Response is "Report deleted successfully."
    const message = responseData.startsWith('"') && responseData.endsWith('"')
      ? responseData.slice(1, -1)
      : responseData;

    return { success: true, message: message || 'Report deleted successfully.' };

  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, error: 'An unexpected error occurred while deleting the report.' };
  }
}

/**
 * Add admin note to report (placeholder for future implementation)
 */
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

    // Verify admin access
    const userInfo = await getUserInfoFromToken(token);
    if (!userInfo || userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required.' };
    }

    // TODO: Implement actual API call when endpoint is available
    console.log(`Would add note to report ${reportId}: ${note}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding admin note:', error);
    return { success: false, error: 'Failed to add admin note.' };
  }
}