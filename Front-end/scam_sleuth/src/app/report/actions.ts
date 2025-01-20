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
      cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

    const response = await fetch('http://localhost:8080/User/userManagement/SubmitReport', {
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
      throw new Error(`HTTP error! status: ${response.status}`);
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