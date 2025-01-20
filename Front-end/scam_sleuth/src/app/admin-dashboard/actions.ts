"use server";

import { cookies } from 'next/headers';

interface TransformedReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  financial_loss: number;
}

export async function getReports() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
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
      method: 'PUT', // Changed to PUT as per your API
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });
    console.log(reportsRes)

    const [scamTypes, reports] = await Promise.all([
      scamTypesRes.json(),
      reportsRes.json()
    ]);

    const scamTypeMap = new Map(
      scamTypes.map((type: any) => [type.scam_type_id, type.scam_type])
    );

    const transformedData: TransformedReport[] = reports.map((report: any) => ({
      id: report.report_id.toString(),
      type: scamTypeMap.get(report.scam_type_id) || 'Unknown',
      name: report.title,
      description: report.description,
      date: new Date(report.scam_date).toLocaleDateString(),
      financial_loss: report.financial_loss
    }));

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: 'Failed to fetch reports' };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      try {
        await fetch('http://localhost:8080/IAM/authentication/Logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Backend logout failed, proceeding with cookie cleanup');
      }
    }

    cookieStore.delete('token');
    cookieStore.delete('userType');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Failed to logout' };
  }
}