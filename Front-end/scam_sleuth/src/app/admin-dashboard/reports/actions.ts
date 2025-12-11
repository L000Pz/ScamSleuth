/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from 'next/headers';

interface ApiReport {
  report_id: number;
  title: string;
  writer_id: number;
  scam_type_id: number;
  scam_date: string;
  report_date: string;
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
  scamDate: string; 
  reportDate: string; 
  date: string; 
  rawScamDate: string; 
  rawReportDate: string; 
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

function formatSmartDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return date.toLocaleDateString('en-US', options).replace(',', ' •');
}

const formatDatePretty = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  

  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

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
    const scamTypesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Public/publicManager/scamTypes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    // Second API call - Get reports
    const reportsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/ViewReports`, {
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
      scamDate: formatDatePretty(report.scam_date), 
      reportDate: formatSmartDate(report.report_date), 
      date: formatSmartDate(report.report_date), 
      rawScamDate: report.scam_date, 
      rawReportDate: report.report_date, 
      financial_loss: report.financial_loss
    }));

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: 'Failed to fetch reports' };
  }
}