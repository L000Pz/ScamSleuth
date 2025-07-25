'use server';

import { cookies } from 'next/headers';

interface ReviewData {
  content: string;
  title: string;
  scam_type_id: number;
  review_date: string;
  media: number[];
}

interface ScamType {
  scam_type_id: number;
  scam_type: string;
}

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

// Get all available scam types
export async function getScamTypes(): Promise<{
  success: boolean;
  data?: ScamType[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Verify user is admin
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please login again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch scam types:', response.status);
      return { success: false, error: 'Failed to fetch scam types' };
    }

    const scamTypes = await response.json();
    return { success: true, data: scamTypes };

  } catch (error) {
    console.error('Error in getScamTypes:', error);
    return { success: false, error: 'Failed to fetch scam types' };
  }
}

// Upload a single file and return its media ID
export async function uploadFile(formData: FormData): Promise<{
  mediaId: number | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        mediaId: null,
        error: 'Please login to upload files'
      };
    }

    // Verify user is admin (admins don't need verification check)
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return {
        mediaId: null,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (userInfo.role !== 'admin') {
      return {
        mediaId: null,
        error: 'Admin access required to upload files'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Save`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = `Upload failed: ${response.statusText}`;
      console.error(errorMessage, response.status);
      return {
        mediaId: null,
        error: errorMessage
      };
    }

    const data = await response.json();
    
    if (data && typeof data === 'number') {
      return { mediaId: data, error: null };
    } else {
      console.error('Unexpected response format:', data);
      return {
        mediaId: null,
        error: 'Invalid server response format'
      };
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      mediaId: null,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

// Delete a file by its ID
export async function deleteFile(id: number): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Please login to delete files'
      };
    }

    // Verify user is admin (admins don't need verification check)
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return {
        success: false,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (userInfo.role !== 'admin') {
      return {
        success: false,
        error: 'Admin access required to delete files'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Delete?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to delete file: ${response.statusText}`
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file'
    };
  }
}

// Submit the complete review
export async function submitReview(reviewData: ReviewData): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Verify user is admin
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please login again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required to submit reviews' };
    }

    // Log the request body for debugging
    console.log('Submitting review with data:', JSON.stringify(reviewData, null, 2));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/WriteReview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        title: reviewData.title,
        content: reviewData.content,
        scam_type_id: Number(reviewData.scam_type_id),
        review_date: reviewData.review_date,
        media: reviewData.media
      })
    });

    // Log the response status and headers for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        text: errorText
      });
      return { 
        success: false, 
        error: `Failed to submit review (${response.status}). Server message: ${errorText.slice(0, 200)}...`
      };
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error: any) {
    console.error('Error in submitReview:', error);
    return { 
      success: false, 
      error: `Failed to submit review: ${error?.message || 'Unknown error'}`
    };
  }
}