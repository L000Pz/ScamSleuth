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

    // Get media data if available
    let mediaFiles = [];
    if (reportData.media && reportData.media.length > 0) {
      const mediaPromises = reportData.media.map(async (media: any) => {
        const mediaRes = await fetch(`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          },
          cache: 'no-store'
        });

        if (!mediaRes.ok) {
          console.error(`Failed to fetch media ${media.media_id}:`, mediaRes.status);
          return null;
        }

        return {
          report_id: media.report_id,
          media_id: media.media_id
        };
      });

      mediaFiles = (await Promise.all(mediaPromises)).filter(Boolean);
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
      reportedBy: reportData.writer.name,
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
        id: reportData.writer.user_id,
        username: reportData.writer.username,
        email: reportData.writer.email,
        name: reportData.writer.name,
        profilePicture: reportData.writer.profile_picture_id
      },
      media: mediaFiles
    };

    return { success: true, data: transformedReport };
  } catch (error) {
    console.error('Error in getSpecificReport:', error);
    return { success: false, error: 'Failed to fetch report' };
  }
}