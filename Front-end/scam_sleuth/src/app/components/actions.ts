'use server';

import { cookies } from 'next/headers';

interface AuthStatus {
  isAuthenticated: boolean;
  userType: string | null;
}

export async function checkAuth(): Promise<AuthStatus> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const userType = cookieStore.get('userType');

  return {
    isAuthenticated: !!token,
    userType: userType?.value || null
  };
}


export async function getRecentReviews() {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get('token')?.value;

    // if (!token) {
    //   return { success: false, error: 'Authentication required' };
    // }

    const response = await fetch('http://localhost:8080/Public/publicManager/recentReviews', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const reviews = await response.json();
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return { success: false, error: 'Failed to fetch recent reviews' };
  }
}