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
  media_id: number;
}

export async function uploadFile(formData: FormData): Promise<{
  mediaId: number | null;
  error: string | null;
}> {
  try {
    const cookiesStore =await cookies();
    const token = cookiesStore.get('token');
    const isVerified = cookiesStore.get('isVerified');

    if (!token || !isVerified || isVerified.value !== 'true') {
      return {
        mediaId: null,
        error: 'Please login and verify your account to upload files'
      };
    }

    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry - ${key}:`, value instanceof File ? {
        name: value.name,
        type: value.type,
        size: value.size
      } : value);
    }

    const response = await fetch('http://localhost:8080/Media/mediaManager/Save', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formData,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);

      if (response.status === 401) {
        return {
          mediaId: null,
          error: 'Please login again to upload files'
        };
      }
      if (response.status === 404) {
        return {
          mediaId: null,
          error: 'File upload service not found. Please try again later.'
        };
      }
      if (response.status === 413) {
        return {
          mediaId: null,
          error: 'File size too large. Please upload a smaller file.'
        };
      }
      if (response.status === 415) {
        return {
          mediaId: null,
          error: 'File type not supported. Please upload a valid file type.'
        };
      }

      return {
        mediaId: null,
        error: `Upload failed: ${errorText || response.statusText}`
      };
    }

    const data = await response.json();
    
    if (!data) {
      console.error('Invalid response format:', data);
      return {
        mediaId: null,
        error: 'Invalid response from server'
      };
    }

    return { 
      mediaId: data, 
      error: null 
    };

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      mediaId: null,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

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
      const errorText = await response.text();
      console.error('Fetch scam types error:', errorText);

      if (response.status === 404) {
        return {
          data: null,
          error: 'Scam types service not available. Please try again later.'
        };
      }

      return {
        data: null,
        error: `Failed to fetch scam types: ${errorText || response.statusText}`
      };
    }

    const data = await response.json();

    // Validate the response format
    if (!Array.isArray(data)) {
      console.error('Invalid scam types response format:', data);
      return {
        data: null,
        error: 'Invalid response format from server'
      };
    }

    // Validate each scam type object
    const validScamTypes = data.every(type => 
      typeof type.scam_type_id === 'number' && 
      typeof type.scam_type === 'string'
    );

    if (!validScamTypes) {
      console.error('Invalid scam type object format:', data);
      return {
        data: null,
        error: 'Invalid scam type data format'
      };
    }

    return { data, error: null };

  } catch (error) {
    console.error('Error fetching scam types:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch scam types'
    };
  }
}

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

    // Validate required fields before submitting
    if (!report.title || !report.scam_type_id || !report.scam_date || report.financial_loss < 0 || !report.description) {
      return {
        success: false,
        error: 'Please fill in all required fields'
      };
    }

    const response = await fetch('http://localhost:8080/User/userManagement/SubmitReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submit report error:', errorText);

      if (response.status === 401) {
        return {
          success: false,
          error: 'Please login again to submit your report'
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'Report submission service not available. Please try again later.'
        };
      }
      if (response.status === 400) {
        return {
          success: false,
          error: 'Invalid report data. Please check your input and try again.'
        };
      }

      return {
        success: false,
        error: `Failed to submit report: ${errorText || response.statusText}`
      };
    }

    const data = await response.json();
    
    if (!data.success && data.error) {
      return {
        success: false,
        error: data.error
      };
    }

    return { 
      success: true, 
      error: null 
    };

  } catch (error) {
    console.error('Error submitting scam report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit report'
    };
  }
}