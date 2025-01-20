'use server';

import { cookies } from 'next/headers';

export async function changePassword(email: string, password: string) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
  
      const response = await fetch('http://localhost:5276/userManagement/ChangePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to change password');
      }
  
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to change password' };
    }
  }