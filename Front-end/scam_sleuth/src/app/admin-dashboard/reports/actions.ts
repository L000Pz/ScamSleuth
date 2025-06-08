/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from 'next/headers';

interface ApiReport {
  report_id: number;
  title: string;
  writer_id: number;
  scam_type_id: number;
  scam_date: string;
  report_date: string; // New field
  financial_loss: number;
  description: string;
}

interface ApiScamType {
  scam_type_id: number;
  scam_type: string;
}

interface TransformedReport {
  id: string;
  type: string;
  name: string;
  description: string;
  scamDate: string; // When the scam occurred
  reportDate: string; // When the report was submitted
  date: string; // For backwards compatibility (using report_date)
  financial_loss: number;
}

interface ApiResponse {
  success: boolean;
  data?: TransformedReport[];
  error?: string;
}

async function getUserInfoFromToken(token: string): Promise<any> {
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

export async function getReports(): Promise<ApiResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Verify user is admin
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please login again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    // First API call - Get scam types
    const scamTypesRes = await fetch('http://localhost:8080/Public/publicManager/scamTypes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    // Second API call - Get reports
    const reportsRes = await fetch('http://localhost:8080/Admin/adminManagement/ViewReports', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    if (!scamTypesRes.ok || !reportsRes.ok) {
      return { success: false, error: 'Failed to fetch data from server' };
    }

    const [scamTypes, reports]: [ApiScamType[], ApiReport[]] = await Promise.all([
      scamTypesRes.json(),
      reportsRes.json()
    ]);

    // Create a map for faster scam type lookups
    const scamTypeMap = new Map(
      scamTypes.map((type) => [type.scam_type_id, type.scam_type])
    );

    const transformedData: TransformedReport[] = reports.map((report) => ({
      id: report.report_id.toString(),
      type: scamTypeMap.get(report.scam_type_id) || 'Unknown',
      name: report.title,
      description: report.description,
      scamDate: new Date(report.scam_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      reportDate: new Date(report.report_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      date: new Date(report.report_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }), // For backwards compatibility, using report_date as the primary date
      financial_loss: report.financial_loss
    }));

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: 'Failed to fetch reports' };
  }
}