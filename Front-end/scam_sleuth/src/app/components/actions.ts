'use server';

import { cookies } from 'next/headers';

interface AuthStatus {
  isAuthenticated: boolean;
  userType: string | null;
}

interface UserData {
  name: string;
  username?: string;
  email?: string;
  role?: string;
  is_verified?: boolean;
  profile_picture_id?: number | null;
}

async function getUserInfoFromToken(token: string): Promise<UserData | null> {
  try {
    const response = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
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

export async function getUserData(): Promise<UserData | { name: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return { name: '[User]' };
    }

    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { name: '[User]' };
    }

    return { 
      name: userInfo.name,
      username: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
      is_verified: userInfo.is_verified,
      profile_picture_id: userInfo.profile_picture_id
    };
  } catch (error) {
    console.error('Error in getUserData:', error);
    return { name: '[User]' };
  }
}

export async function getRecentReviews() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

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