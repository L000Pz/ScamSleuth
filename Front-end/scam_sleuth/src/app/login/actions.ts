// src/app/login/actions.ts
'use server';

import { cookies } from 'next/headers';

// User response interface based on your API
interface UserTokenResponse {
  user_id: number;
  username: string;
  email: string;
  name: string;
  profile_picture_id: number | null;
  is_verified: boolean;
  token: string;
  role: string;
}

// Admin response interface (assuming similar structure)
interface AdminTokenResponse {
  admin_id: number;
  username: string;
  email: string;
  name: string;
  contact_info?: string;
  bio?: string;
  profile_picture_id: number | null;
  token: string;
  role: string;
}

type LoginResult = 
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        user_id?: number;
        admin_id?: number;
        username: string;
        email: string;
        name: string;
        profile_picture_id: number | null;
        is_verified: boolean;
        role: string;
      };
    };

export async function login(formData: { email: string; password: string }): Promise<LoginResult> {
  try {
    // First, perform the login to get the token
    const loginResponse = await fetch('http://localhost:8080/IAM/authentication/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
    });

    if (!loginResponse.ok) {
      return {
        success: false,
        message: loginResponse.status === 400
          ? 'Invalid credentials. Please check your email and password.'
          : 'Server error. Please try again later.',
      };
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      return {
        success: false,
        message: 'Login failed: No token received.',
      };
    }

    // Now use the token to get complete user information
    const userInfoResponse = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!userInfoResponse.ok) {
      return {
        success: false,
        message: 'Failed to retrieve user information.',
      };
    }

    const userInfo: UserTokenResponse | AdminTokenResponse = await userInfoResponse.json();
    
    // Only store the essential token
    const cookiesStore = await cookies();
    
    cookiesStore.set({
      name: 'token',
      value: userInfo.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Handle is_verified flag
    const isVerified = 'is_verified' in userInfo ? userInfo.is_verified : true; // Admins default to verified

    // Return simplified data structure
    return { 
      success: true,
      data: {
        ...(('user_id' in userInfo) && { user_id: userInfo.user_id }),
        ...(('admin_id' in userInfo) && { admin_id: userInfo.admin_id }),
        username: userInfo.username,
        email: userInfo.email,
        name: userInfo.name,
        profile_picture_id: userInfo.profile_picture_id,
        is_verified: isVerified,
        role: userInfo.role,
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}