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

// Upload a single file and return its media ID
export async function uploadFile(formData: FormData): Promise<{
  mediaId: number | null;
  error: string | null;
}> {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token');
    const isVerified = cookiesStore.get('isVerified');

    if (!token || !isVerified || isVerified.value !== 'true') {
      return {
        mediaId: null,
        error: 'Please login and verify your account to upload files'
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
    const isVerified = cookiesStore.get('isVerified');

    if (!token || !isVerified || isVerified.value !== 'true') {
      return {
        success: false,
        error: 'Please login and verify your account'
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
    const response = await fetch('http://localhost:8080/public/publicManager/scamTypes', {
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
    const isVerified = cookiesStore.get('isVerified');

    if (!token || !isVerified || isVerified.value !== 'true') {
      return {
        success: false,
        error: 'Please login and verify your account to submit a report'
      };
    }

    const response = await fetch('http://localhost:8080/user/userManagement/SubmitReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Please login again to submit your report'
        };
      }
      return {
        success: false,
        error: 'Failed to submit report'
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error submitting scam report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit report'
    };
  }
}