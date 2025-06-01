'use server';

import { cookies } from 'next/headers';

export interface ScamType {
  scam_type_id: number;
  scam_type: string;
}

export interface ScamReportPayload {
  title: string;
  scam_type_id: number;
  scam_date: string;
  financial_loss: number;
  description: string;
  media: number[];
}

interface UserInfo {
  user_id: number;
  username: string;
  email: string;
  name: string;
  is_verified: boolean;
  role: string;
  profile_picture_id?: number | null;
}

async function getUserInfoFromToken(token: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
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

// Upload a single file and return its media ID
export async function uploadFile(formData: FormData): Promise<{
  mediaId: number | null;
  error: string | null;
}> {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token');

    if (!token) {
      return {
        mediaId: null,
        error: 'Please login to upload files'
      };
    }

    // Verify user is authenticated and verified
    const userInfo = await getUserInfoFromToken(token.value);
    
    if (!userInfo) {
      return {
        mediaId: null,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (!userInfo.is_verified) {
      return {
        mediaId: null,
        error: 'Please verify your account to upload files'
      };
    }

    const response = await fetch('http://localhost:8080/Media/mediaManager/Save', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
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
    console.log('Server response:', data);

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
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token');

    if (!token) {
      return {
        success: false,
        error: 'Please login to delete files'
      };
    }

    // Verify user is authenticated and verified
    const userInfo = await getUserInfoFromToken(token.value);
    
    if (!userInfo) {
      return {
        success: false,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (!userInfo.is_verified) {
      return {
        success: false,
        error: 'Please verify your account to delete files'
      };
    }

    const response = await fetch(`http://localhost:8080/Media/mediaManager/Delete?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
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

// Fetch available scam types
export async function fetchScamTypes(): Promise<{
  data: ScamType[] | null;
  error: string | null;
}> {
  try {
    // Fixed the URL - should match the pattern from other working endpoints
    const response = await fetch('http://localhost:8080/Public/publicManager/scamTypes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return {
        data: null,
        error: 'Failed to fetch scam types'
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching scam types:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch scam types'
    };
  }
}

// Submit the complete scam report
export async function submitScamReport(report: ScamReportPayload): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token');

    if (!token) {
      return {
        success: false,
        error: 'Please login to submit a report'
      };
    }

    // Verify user is authenticated and verified
    const userInfo = await getUserInfoFromToken(token.value);
    
    if (!userInfo) {
      return {
        success: false,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (!userInfo.is_verified) {
      return {
        success: false,
        error: 'Please verify your account to submit a report'
      };
    }

    // Fixed the URL to match the working curl request
    const response = await fetch('http://localhost:8080/User/userManagement/SubmitReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
        'Accept': '*/*' // Added this header to match the curl request
      },
      body: JSON.stringify(report),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        text: errorText
      });
      
      if (response.status === 401) {
        return {
          success: false,
          error: 'Please login again to submit your report'
        };
      }
      
      return {
        success: false,
        error: `Failed to submit report: ${errorText || response.statusText}`
      };
    }

    // Handle the response - it could be either JSON or plain text
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log('Server response:', responseData);

    // Since your API returns "Report submitted successfully." as a string,
    // we consider it successful regardless of the response format
    return { success: true, error: null };

  } catch (error) {
    console.error('Error submitting scam report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit report'
    };
  }
}