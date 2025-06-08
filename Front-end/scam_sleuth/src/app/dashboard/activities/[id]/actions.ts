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
  media: Array<{
    report_id: number;
    media_id: number;
  }>;
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
      fetch('http://localhost:8080/Public/publicManager/scamTypes', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }),
      fetch(`http://localhost:8080/User/userManagement/reportId?report_id=${id}`, {
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

    // Transform media array from number[] to the expected format
    const mediaFiles = reportData.media?.map((mediaId: number) => ({
      report_id: reportData.report.report_id,
      media_id: mediaId
    })) || [];

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

    const transformedReport: TransformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: reportData.report.title,
      description: reportData.report.description,
      scamDate: new Date(reportData.report.scam_date).toLocaleDateString(), // When scam occurred
      reportDate: new Date(reportData.report.report_date).toLocaleDateString(), // When reported
      reportedBy: reportData.writerDetails.name,
      status: "Under Review",
      details: {
        platform: "Not specified",
        location: "Not specified",
        amount: reportData.report.financial_loss > 0 ? 
          formatCurrency(reportData.report.financial_loss) : 
          'No financial loss reported',
        evidence: mediaFiles.length > 0 ? 
          `${mediaFiles.length} media file${mediaFiles.length > 1 ? 's' : ''} attached` : 
          'No media attached'
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