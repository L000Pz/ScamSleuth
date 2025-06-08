"use server";

import { cookies } from 'next/headers';

// Type definitions based on the new API response
interface ScamType {
  scam_type_id: number;
  scam_type: string;
}

interface UserReport {
  report_id: number;
  title: string;
  writer_id: number;
  scam_type_id: number;
  scam_date: string; // When the scam occurred
  report_date: string; // When the report was submitted
  financial_loss: number;
  description: string;
}

interface TransformedActivity {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  scamDate: string;
  financialLoss: number;
}

interface ApiResponse {
  success: boolean;
  data?: TransformedActivity[];
  error?: string;
}

export async function getActivities(): Promise<ApiResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Fetch scam types and user reports in parallel
    const [scamTypesRes, reportsRes] = await Promise.all([
      fetch('http://localhost:8080/Public/publicManager/scamTypes', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      }),
      fetch('http://localhost:8080/User/userManagement/GetUserReports', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      })
    ]);

    // Check if requests were successful
    if (!scamTypesRes.ok) {
      throw new Error(`Failed to fetch scam types: ${scamTypesRes.status}`);
    }

    if (!reportsRes.ok) {
      throw new Error(`Failed to fetch user reports: ${reportsRes.status}`);
    }

    // Parse responses
    const [scamTypes, reports]: [ScamType[], UserReport[]] = await Promise.all([
      scamTypesRes.json(),
      reportsRes.json()
    ]);

    // Create a map for efficient scam type lookup
    const scamTypeMap = new Map<number, string>(
      scamTypes.map((type) => [type.scam_type_id, type.scam_type])
    );

    // Transform the data to match the frontend interface
    const transformedData: TransformedActivity[] = reports.map((report) => ({
      id: report.report_id.toString(),
      type: scamTypeMap.get(report.scam_type_id) || 'Unknown',
      name: report.title,
      description: report.description,
      date: new Date(report.report_date).toLocaleDateString(), // When reported
      scamDate: new Date(report.scam_date).toLocaleDateString(), // When scam occurred
      financialLoss: report.financial_loss
    }));

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch activities' 
    };
  }
}