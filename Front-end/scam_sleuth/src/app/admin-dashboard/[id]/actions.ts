"use server";

import { cookies } from 'next/headers';

export async function getAdminReport(id: string) {
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
      fetch(`http://localhost:8080/Admin/adminManagement/reportId?report_id=${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
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

    const scamType = scamTypes.find((type: any) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    const transformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: reportData.report.title,
      description: reportData.report.description,
      date: new Date(reportData.report.scam_date).toLocaleDateString(),
      status: 'under_review',
      reporterName: reportData.writer.name,
      contactInfo: reportData.writer.email,
      evidence: reportData.media?.map((media: any) => `Media ID: ${media.media_id}`),
      timeline: `Scam occurred on ${new Date(reportData.report.scam_date).toLocaleDateString()}`,
      writer: {
        id: reportData.writer.user_id,
        username: reportData.writer.username,
        email: reportData.writer.email,
        name: reportData.writer.name,
        profilePicture: reportData.writer.profile_picture_id
      },
      media: reportData.media || []
    };

    return { success: true, data: transformedReport };
  } catch (error) {
    console.error('Error in getAdminReport:', error);
    return { success: false, error: 'Failed to fetch report' };
  }
}