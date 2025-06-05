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
    financial_loss: number;
    description: string;
  };
  media: number[]; // Media is an array of numbers (media IDs), not objects
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
  };
  media: Array<{
    report_id: number;
    media_id: number;
  }>;
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
      return { success: false, error: 'No token found' };
    }

    // Get report and scam types - using the correct endpoint
    const [scamTypesRes, reportRes] = await Promise.all([
      fetch('http://localhost:8080/Public/publicManager/scamTypes', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }),
      // Fixed endpoint name
      fetch(`http://localhost:8080/Admin/adminManagement/GetReportById?report_id=${id}`, {
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

    const [scamTypes, reportData]: [ApiScamType[], ApiReportResponse] = await Promise.all([
      scamTypesRes.json(),
      reportRes.json()
    ]);

    if (!reportData?.report) {
      return { success: false, error: 'Invalid report data received' };
    }

    // Find the matching scam type
    const scamType = scamTypes.find((type) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    // Transform media array to match expected format
    const transformedMedia = reportData.media?.map((mediaId) => ({
      report_id: reportData.report.report_id,
      media_id: mediaId
    })) || [];

    const transformedReport: TransformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: reportData.report.title,
      description: reportData.report.description,
      date: new Date(reportData.report.scam_date).toLocaleDateString(),
      status: 'under_review',
      reporterName: reportData.reportWriterDetails.name,
      contactInfo: reportData.reportWriterDetails.email,
      evidence: reportData.media?.length > 0 
        ? reportData.media.map((mediaId) => `Media ID: ${mediaId}`)
        : undefined,
      timeline: `Scam occurred on ${new Date(reportData.report.scam_date).toLocaleDateString()}`,
      writer: {
        id: reportData.reportWriterDetails.user_id,
        username: reportData.reportWriterDetails.username,
        email: reportData.reportWriterDetails.email,
        name: reportData.reportWriterDetails.name,
        profilePicture: reportData.reportWriterDetails.profile_picture_id
      },
      media: transformedMedia
    };

    return { success: true, data: transformedReport };
  } catch (error) {
    console.error('Error in getAdminReport:', error);
    return { success: false, error: 'Failed to fetch report' };
  }
}