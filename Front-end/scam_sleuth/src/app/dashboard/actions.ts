'use server';

import { cookies } from 'next/headers';

export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    
    // Clear all authentication-related cookies
    cookieStore.delete('token');
    cookieStore.delete('userType'); // In case you add this later
    
    // Optional: Call backend logout endpoint if available
    try {
      await fetch('http://localhost:8080/IAM/authentication/Logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookieStore.get('token')?.value}`,
        },
      });
    } catch (error) {
      // Continue with logout even if backend call fails
      console.warn('Backend logout call failed, but cookies were cleared');
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