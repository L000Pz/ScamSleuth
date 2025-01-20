"use server";

import { cookies } from 'next/headers';

export async function getActivities() {
 try {
   const cookieStore = await cookies();
   const token = cookieStore.get('token')?.value;

   if (!token) {
     return { success: false, error: 'No token found' };
   }

   const [scamTypesRes, reportsRes] = await Promise.all([
     fetch('http://localhost:8080/Public/publicManager/scamTypes', {
       headers: { 'Authorization': `Bearer ${token}` }
     }),
     fetch('http://localhost:8080/User/userManagement/GetUserReports', {
       headers: { 'Authorization': `Bearer ${token}` }
     })
   ]);

   const [scamTypes, reports] = await Promise.all([
     scamTypesRes.json(),
     reportsRes.json()
   ]);

   const scamTypeMap = new Map(
     scamTypes.map((type: any) => [type.scam_type_id, type.scam_type])
   );

   const transformedData = reports.map((report: any) => ({
     id: report.report_id.toString(),
     type: scamTypeMap.get(report.scam_type_id) || 'Unknown',
     name: report.title,
     description: report.description,
     date: new Date(report.scam_date).toLocaleDateString(),
     financial_loss: report.financial_loss
   }));

   return { success: true, data: transformedData };
 } catch (error) {
   return { success: false, error: 'Failed to fetch activities' };
 }
}