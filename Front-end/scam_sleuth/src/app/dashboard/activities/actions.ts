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
  scam_date: string;
  report_date: string;
  financial_loss: number;
  description: string;
}

interface TransformedActivity {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string; // formatted display date
  scamDate: string; // formatted display date
  rawReportDate: string; // raw ISO date for sorting
  rawScamDate: string; // raw ISO date for sorting
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/User/userManagement/GetUserReports`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      })
    ]);

    if (!scamTypesRes.ok) {
      throw new Error(`Failed to fetch scam types: ${scamTypesRes.status}`);
    }

    if (!reportsRes.ok) {
      throw new Error(`Failed to fetch user reports: ${reportsRes.status}`);
    }

    const [scamTypes, reports]: [ScamType[], UserReport[]] = await Promise.all([
      scamTypesRes.json(),
      reportsRes.json()
    ]);

    const scamTypeMap = new Map<number, string>(
      scamTypes.map((type) => [type.scam_type_id, type.scam_type])
    );
        
    const formatDatePretty = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
    };
    
    const formatDateTimePretty = (dateString: string): string => {
      const d = new Date(dateString);

      const date = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });

      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      return `${date} • ${time}`;
    };

    const transformedData: TransformedActivity[] = reports.map((report) => ({
      id: report.report_id.toString(),
      type: scamTypeMap.get(report.scam_type_id) || 'Unknown',
      name: report.title,
      description: report.description,
      date: formatDateTimePretty(report.report_date),
      scamDate: formatDatePretty(report.scam_date),
      rawReportDate: report.report_date, // تاریخ خام برای مرتب‌سازی
      rawScamDate: report.scam_date, // تاریخ خام برای مرتب‌سازی
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