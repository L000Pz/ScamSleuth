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