"use server";

import { cookies } from 'next/headers';

export async function getActivities() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:8080/User/userManagement/GetUserReports', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return {
      success: false,
      error: 'Failed to fetch activities'
    };
  }
}