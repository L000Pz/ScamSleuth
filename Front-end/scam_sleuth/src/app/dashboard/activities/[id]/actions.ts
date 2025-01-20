"use server";

import { cookies } from 'next/headers';

export async function getSpecificReport(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Fetch both the specific report and scam types
    const [reportRes, scamTypesRes] = await Promise.all([
      fetch(`http://localhost:8080/User/userManagement/GetReport/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:8080/Public/publicManager/scamTypes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const [report, scamTypes] = await Promise.all([
      reportRes.json(),
      scamTypesRes.json()
    ]);

    // Find the corresponding scam type
    const scamType = scamTypes.find((type: any) => type.scam_type_id === report.scam_type_id);

    // Transform the data to match your interface
    const transformedReport = {
      id: report.report_id.toString(),
      type: scamType?.scam_type || 'Unknown',
      name: report.title,
      description: report.description,
      date: new Date(report.scam_date).toLocaleDateString(),
      reportedBy: report.reported_by,
      status: report.status,
      details: {
        platform: report.platform,
        location: report.location,
        amount: report.financial_loss ? `$${report.financial_loss}` : undefined,
        evidence: report.evidence
      }
    };

    return { success: true, data: transformedReport };
  } catch (error) {
    console.error('Error fetching report:', error);
    return { success: false, error: 'Failed to fetch report' };
  }
}