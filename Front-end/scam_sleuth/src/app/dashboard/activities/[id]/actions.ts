"use server";

import { cookies } from 'next/headers';

// Interface for media item
interface MediaItem {
  report_id: number;
  media_id: number;
  mediaUrl?: string;
}

export async function getSpecificReport(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Fetch report
    const reportRes = await fetch(`http://localhost:8080/User/userManagement/reportId?report_id=${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!reportRes.ok) {
      console.error('Report fetch failed with status:', reportRes.status);
      const errorText = await reportRes.text();
      console.error('Error response:', errorText);
      return { success: false, error: `Failed to fetch report: ${reportRes.status}` };
    }

    const reportData = await reportRes.json();

    // Fetch scam types
    const scamTypesRes = await fetch('http://localhost:8080/Public/publicManager/scamTypes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!scamTypesRes.ok) {
      console.error('ScamTypes fetch failed with status:', scamTypesRes.status);
      return { success: false, error: 'Failed to fetch scam types' };
    }

    const scamTypes = await scamTypesRes.json();

    // Find the corresponding scam type
    const scamType = scamTypes.find((type: any) => 
      type.scam_type_id === reportData.report.scam_type_id
    );

    // Fetch media URLs if media exists
    let mediaWithUrls: MediaItem[] = [];
    if (reportData.media && reportData.media.length > 0) {
      const mediaUrlPromises = reportData.media.map(async (media: MediaItem) => {
        try {
          const mediaRes = await fetch(`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (mediaRes.ok) {
            const mediaUrl = await mediaRes.text(); // Assuming the endpoint returns the URL directly
            return {
              ...media,
              mediaUrl
            };
          }
          return media;
        } catch (error) {
          console.error(`Failed to fetch media URL for media_id ${media.media_id}:`, error);
          return media;
        }
      });

      mediaWithUrls = await Promise.all(mediaUrlPromises);
    }

    // Transform the data to match your interface
    const transformedReport = {
      id: reportData.report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: reportData.report.title,
      description: reportData.report.description,
      date: new Date(reportData.report.scam_date).toLocaleDateString(),
      reportedBy: reportData.writer.name,
      status: "Under Investigation",
      details: {
        platform: "Not specified",
        location: "Not specified",
        amount: reportData.report.financial_loss ? 
          `$${reportData.report.financial_loss.toLocaleString()}` : 
          'No financial loss reported',
        evidence: mediaWithUrls.length > 0 ? 
          `${mediaWithUrls.length} media files attached` : 
          'No media attached'
      },
      writer: {
        id: reportData.writer.user_id,
        username: reportData.writer.username,
        email: reportData.writer.email,
        name: reportData.writer.name,
        profilePicture: reportData.writer.profile_picture_id
      },
      media: mediaWithUrls
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