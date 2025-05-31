"use server";

import { cookies } from 'next/headers';

export async function getSpecificReport(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Get report and scam types
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

    const [scamTypes, reportData] = await Promise.all([
      scamTypesRes.json(),
      reportRes.json()
    ]);

    if (!reportData || !reportData.report) {
      return { success: false, error: 'Invalid report data received' };
    }

    // Transform media array - reportData.media is now just number[]
    let mediaFiles = [];
    if (reportData.media && reportData.media.length > 0) {
      mediaFiles = reportData.media.map((mediaId: number) => ({
        report_id: reportData.report.report_id,
        media_id: mediaId
      }));
    }

    const scamType = scamTypes.find((type: any) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    const transformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: reportData.report.title,
      description: reportData.report.description,
      date: new Date(reportData.report.scam_date).toLocaleDateString(),
      reportedBy: reportData.writerDetails.name,
      status: "Under Review",
      details: {
        platform: "Not specified",
        location: "Not specified",
        amount: reportData.report.financial_loss ? 
          `$${reportData.report.financial_loss.toLocaleString()}` : 
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
    return { success: false, error: 'Failed to fetch report' };
  }
}