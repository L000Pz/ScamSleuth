'use server';

import { cookies } from 'next/headers';

export async function logout() {
  const cookieStore = await cookies();
  
  // Delete the authentication token
  cookieStore.delete('token');
  
  return { success: true };
}