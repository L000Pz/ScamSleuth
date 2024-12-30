'use server';

import { cookies } from 'next/headers';

export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    
    // Clear all authentication-related cookies
    cookieStore.delete('token');
    cookieStore.delete('userType');

    // Optional: Call backend logout endpoint if you need to invalidate the token server-side
    try {
      const response = await fetch('http://localhost:8080/IAM/authentication/Logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookieStore.get('token')?.value}`,
        },
      });

      if (!response.ok) {
        console.warn('Backend logout failed, but cookies were cleared');
      }
    } catch (error) {
      console.warn('Could not reach logout endpoint, but cookies were cleared');
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Failed to logout. Please try again.'
    };
  }
}